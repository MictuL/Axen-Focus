import { useMemo, useState } from "react";
import { FOCUS_RELATIONSHIP_TYPES, validateRelationshipConfiguration } from "../lib/focusConsolidation";
import type { BusinessUnit, CollaboratorProfile, FocusHierarchyRelationship, FocusRelationshipType, Position } from "../types";
import { Icon } from "./Icon";

type RelationshipDraft = Omit<FocusHierarchyRelationship, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string };

const today = new Date().toISOString().slice(0, 10);
const blankDraft = (businessUnitId: string): RelationshipDraft => ({
  businessUnitId,
  sourceProfileId: "",
  targetProfileId: "",
  relationshipType: "Reporta directamente a",
  weight: 1,
  startDate: today,
  endDate: "",
  status: "active",
  createdBy: "Admin",
});

function profileLabel(profile: CollaboratorProfile, positions: Position[]) {
  const position = positions.find((item) => item.id === profile.positionId);
  return `${profile.name} · ${position?.name ?? "Puesto sin identificar"}`;
}

export function FocusRelationshipAdmin({
  deactivateRelationship,
  deleteRelationship,
  positions,
  profiles,
  relationships,
  units,
  upsertRelationship,
}: {
  deactivateRelationship: (id: string) => void;
  deleteRelationship: (id: string) => void;
  positions: Position[];
  profiles: CollaboratorProfile[];
  relationships: FocusHierarchyRelationship[];
  units: BusinessUnit[];
  upsertRelationship: (relationship: RelationshipDraft) => void;
}) {
  const firstUnitId = units.find((unit) => unit.status === "active")?.id ?? units[0]?.id ?? "";
  const [selectedUnitId, setSelectedUnitId] = useState(firstUnitId);
  const [draft, setDraft] = useState<RelationshipDraft>(() => blankDraft(firstUnitId));
  const [notice, setNotice] = useState("");
  const unitProfiles = profiles.filter((profile) => profile.businessUnitId === selectedUnitId && profile.status === "active");
  const unitRelationships = relationships.filter((relationship) => relationship.businessUnitId === selectedUnitId);
  const errors = useMemo(() => validateRelationshipConfiguration(draft, relationships), [draft, relationships]);

  function selectUnit(unitId: string) {
    setSelectedUnitId(unitId);
    setDraft(blankDraft(unitId));
    setNotice("");
  }

  function editRelationship(relationship: FocusHierarchyRelationship) {
    setSelectedUnitId(relationship.businessUnitId);
    setDraft(relationship);
    setNotice("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      upsertRelationship(draft);
      setNotice(draft.id ? "Conexión jerárquica actualizada." : "Conexión jerárquica creada.");
      setDraft(blankDraft(selectedUnitId));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No fue posible guardar la conexión.");
    }
  }

  return <section className="panel relationship-admin">
    <header className="relationship-admin-heading">
      <div><p className="eyebrow">Arquitectura Focus</p><h2>Relaciones jerárquicas configurables</h2><p>Define qué perfiles alimentan la condición consolidada de cada responsable. El cálculo usa estas conexiones sin duplicar perfiles dentro del mismo responsable.</p></div>
      <label><span>Unidad</span><select value={selectedUnitId} onChange={(event) => selectUnit(event.target.value)}>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
    </header>

    {notice ? <p className="admin-notice">{notice}</p> : null}

    <div className="relationship-admin-grid">
      <form className="relationship-form" onSubmit={submit}>
        <div className="relationship-form-title">
          <Icon name="people" size={18} />
          <div><b>{draft.id ? "Editar conexión" : "Nueva conexión"}</b><span>{unitProfiles.length} perfiles disponibles en la unidad.</span></div>
        </div>
        <label><span>Colaborador origen</span><select value={draft.sourceProfileId} onChange={(event) => setDraft((current) => ({ ...current, sourceProfileId: event.target.value }))}><option value="">Seleccionar perfil</option>{unitProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profileLabel(profile, positions)}</option>)}</select></label>
        <label><span>Responsable destino</span><select value={draft.targetProfileId} onChange={(event) => setDraft((current) => ({ ...current, targetProfileId: event.target.value }))}><option value="">Seleccionar responsable</option>{unitProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profileLabel(profile, positions)}</option>)}</select></label>
        <label><span>Tipo de relación</span><select value={draft.relationshipType} onChange={(event) => setDraft((current) => ({ ...current, relationshipType: event.target.value as FocusRelationshipType }))}>{FOCUS_RELATIONSHIP_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
        <div className="form-grid">
          <label><span>Peso de influencia</span><input min="0.01" step="0.01" type="number" value={draft.weight} onChange={(event) => setDraft((current) => ({ ...current, weight: Number(event.target.value) }))} /></label>
          <label><span>Estado</span><select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as RelationshipDraft["status"] }))}><option value="active">Activa</option><option value="inactive">Inactiva</option></select></label>
        </div>
        <div className="form-grid">
          <label><span>Inicio</span><input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} /></label>
          <label><span>Fin opcional</span><input type="date" value={draft.endDate ?? ""} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} /></label>
        </div>
        <div className="relationship-validation">
          {errors.length ? errors.map((error) => <span key={error}><Icon name="alert" size={13} /> {error}</span>) : <span className="is-ok"><Icon name="check" size={13} /> Lista para calcular consolidación</span>}
        </div>
        <div className="relationship-actions">
          <button className="primary-button" type="submit"><Icon name="check" size={15} /> Guardar conexión</button>
          {draft.id ? <button className="text-button" onClick={() => setDraft(blankDraft(selectedUnitId))} type="button">Cancelar edición</button> : null}
        </div>
      </form>

      <div className="relationship-table-card">
        <div className="relationship-table-heading">
          <div><p className="eyebrow">Conexiones activas e históricas</p><h3>{unitRelationships.length} registros</h3></div>
        </div>
        {unitRelationships.length ? <div className="relationship-table-wrap">
          <table className="relationship-table">
            <thead><tr><th>Colaborador origen</th><th>Responsable destino</th><th>Tipo</th><th>Peso</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{unitRelationships.map((relationship) => {
              const source = profiles.find((profile) => profile.id === relationship.sourceProfileId);
              const target = profiles.find((profile) => profile.id === relationship.targetProfileId);
              return <tr key={relationship.id}>
                <td><b>{source?.name ?? "Perfil no encontrado"}</b><span>{positions.find((item) => item.id === source?.positionId)?.name ?? ""}</span></td>
                <td><b>{target?.name ?? "Perfil no encontrado"}</b><span>{positions.find((item) => item.id === target?.positionId)?.name ?? ""}</span></td>
                <td>{relationship.relationshipType}</td>
                <td>{relationship.weight}</td>
                <td><span className={`relationship-status is-${relationship.status}`}>{relationship.status === "active" ? "Activa" : "Inactiva"}</span></td>
                <td><div className="relationship-row-actions">
                  <button className="text-button" onClick={() => editRelationship(relationship)} type="button">Editar</button>
                  {relationship.status === "active" ? <button className="text-button" onClick={() => deactivateRelationship(relationship.id)} type="button">Desactivar</button> : null}
                  <button aria-label="Eliminar conexión" className="text-button" onClick={() => deleteRelationship(relationship.id)} type="button"><Icon name="x" size={14} /></button>
                </div></td>
              </tr>;
            })}</tbody>
          </table>
        </div> : <div className="empty-state relationship-empty"><Icon name="people" size={26} /><strong>Sin conexiones configuradas</strong><span>Conecta los puestos del organigrama para activar la cadena operativa.</span></div>}
      </div>
    </div>
  </section>;
}

import { useEffect, useState } from "react";
import type { BusinessUnit, Kpi, Position } from "../types";
import { Icon } from "./Icon";
import { createPositionId, getOperationalLevel, groupByOperationalLevel, hasOfficialKpis } from "../lib/catalog";

const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const emptyKpi = (): Kpi => ({ name: "", description: "" });
const cleanKpis = (kpis: Kpi[]) => kpis.map((item) => ({ name: item.name.trim(), description: item.description.trim() })).filter((item) => item.name || item.description);

function blankUnit(): BusinessUnit {
  return { id: "", name: "", description: "", status: "active", createdAt: new Date().toISOString().slice(0, 10), responsible: "", observations: "" };
}

function blankPosition(unitId: string): Position {
  return {
    id: "",
    businessUnitId: unitId,
    area: "",
    name: "",
    rep: "",
    kpis: [emptyKpi()],
    suggestedFrequency: "Mensual",
    suggestedEvidence: "Definir con responsable del área",
    suggestedEvaluator: "Responsable directo del área",
    status: "active",
    isEvaluable: true,
  };
}

export function CatalogAdmin({
  units,
  positions,
  addUnit,
  updateUnit,
  addPosition,
  updatePosition,
  restoreCatalog,
}: {
  units: BusinessUnit[];
  positions: Position[];
  addUnit: (unit: BusinessUnit) => void;
  updateUnit: (unit: BusinessUnit) => void;
  addPosition: (position: Position) => void;
  updatePosition: (position: Position) => void;
  restoreCatalog: () => void;
}) {
  const firstUnitId = units[0]?.id ?? "";
  const [selectedUnitId, setSelectedUnitId] = useState(firstUnitId);
  const [unitDraft, setUnitDraft] = useState<BusinessUnit>(() => units[0] ?? blankUnit());
  const [newUnitName, setNewUnitName] = useState("");
  const unitPositions = positions.filter((item) => item.businessUnitId === selectedUnitId);
  const positionLevelGroups = groupByOperationalLevel(unitPositions, (item) => item.name);
  const [selectedPositionId, setSelectedPositionId] = useState(unitPositions[0]?.id ?? "new");
  const [positionDraft, setPositionDraft] = useState<Position>(() => unitPositions[0] ?? blankPosition(firstUnitId));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const unit = units.find((item) => item.id === selectedUnitId) ?? units[0];
    if (!unit) return;
    setUnitDraft(unit);
  }, [selectedUnitId, units]);

  useEffect(() => {
    const visible = positions.filter((item) => item.businessUnitId === selectedUnitId);
    const selected = visible.find((item) => item.id === selectedPositionId);
    if (selected) {
      setPositionDraft({ ...selected, kpis: selected.kpis.length ? selected.kpis : [emptyKpi()] });
      return;
    }
    setSelectedPositionId("new");
    setPositionDraft(blankPosition(selectedUnitId));
  }, [selectedUnitId, selectedPositionId, positions]);

  function submitNewUnit(event: React.FormEvent) {
    event.preventDefault();
    const id = slug(newUnitName);
    if (!id || units.some((item) => item.id === id)) return setNotice("La unidad necesita un nombre único.");
    const unit = { ...blankUnit(), id, name: newUnitName.trim() };
    addUnit(unit);
    setSelectedUnitId(id);
    setNewUnitName("");
    setNotice("Unidad agregada. Ya puede recibir puestos propios.");
  }

  function saveUnit(event: React.FormEvent) {
    event.preventDefault();
    if (!unitDraft.name.trim()) return setNotice("La unidad necesita nombre.");
    updateUnit({ ...unitDraft, name: unitDraft.name.trim(), description: unitDraft.description.trim(), responsible: unitDraft.responsible.trim(), observations: unitDraft.observations.trim() });
    setNotice("Unidad de negocio actualizada.");
  }

  function savePosition(event: React.FormEvent) {
    event.preventDefault();
    const kpis = cleanKpis(positionDraft.kpis);
    const isNew = selectedPositionId === "new";
    const localId = slug(positionDraft.name);
    const id = isNew ? createPositionId(positionDraft.businessUnitId, localId) : positionDraft.id;
    if (!positionDraft.name.trim() || !positionDraft.area.trim()) return setNotice("El puesto necesita nombre y área.");
    if (isNew && (!localId || positions.some((item) => item.id === id))) return setNotice("El puesto necesita un nombre único dentro de la unidad.");
    if (!positionDraft.rep.trim()) return setNotice("El puesto necesita un REP oficial antes de guardarse.");
    if (!hasOfficialKpis(kpis)) return setNotice("Agrega al menos un KPI con nombre y descripción completos.");
    const next: Position = {
      ...positionDraft,
      id,
      businessUnitId: positionDraft.businessUnitId,
      area: positionDraft.area.trim(),
      name: positionDraft.name.trim(),
      rep: positionDraft.rep.trim(),
      kpis,
      suggestedFrequency: positionDraft.suggestedFrequency.trim() || "Mensual",
      suggestedEvidence: positionDraft.suggestedEvidence.trim() || "Definir con responsable del área",
      suggestedEvaluator: positionDraft.suggestedEvaluator.trim() || "Responsable directo del área",
      isEvaluable: positionDraft.isEvaluable && Boolean(positionDraft.rep.trim() && hasOfficialKpis(kpis)),
    };
    if (isNew) {
      addPosition(next);
      setSelectedPositionId(next.id);
      setNotice(next.isEvaluable ? "Puesto evaluable agregado." : "Puesto agregado con captura digital bloqueada.");
      return;
    }
    updatePosition(next);
    setNotice(next.isEvaluable ? "Puesto actualizado y evaluable." : "Puesto actualizado con captura digital bloqueada.");
  }

  const updateUnitDraft = <K extends keyof BusinessUnit>(key: K, value: BusinessUnit[K]) => {
    setNotice("");
    setUnitDraft((current) => ({ ...current, [key]: value }));
  };

  const updatePositionDraft = <K extends keyof Position>(key: K, value: Position[K]) => {
    setNotice("");
    setPositionDraft((current) => ({ ...current, [key]: value }));
  };

  const updateKpi = (index: number, key: keyof Kpi, value: string) => {
    setNotice("");
    setPositionDraft((current) => ({ ...current, kpis: current.kpis.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  };

  const removeKpi = (index: number) => {
    setNotice("");
    setPositionDraft((current) => ({ ...current, kpis: current.kpis.filter((_, itemIndex) => itemIndex !== index).length ? current.kpis.filter((_, itemIndex) => itemIndex !== index) : [emptyKpi()] }));
  };

  return <div className="admin-stack">
    <section className="panel admin-intro"><div><p className="eyebrow">Administración de configuración</p><h2>Unidades, puestos y KPIs editables</h2><p>Cada cambio afecta capturas futuras. Las evaluaciones ya guardadas conservan el snapshot histórico del puesto, REP y KPIs usados en su momento.</p></div><button className="secondary-button" onClick={() => { restoreCatalog(); setSelectedUnitId(firstUnitId); setSelectedPositionId("new"); setNotice("Catálogo inicial restaurado."); }} type="button"><Icon name="refresh" size={16} /> Restaurar catálogo inicial</button></section>
    {notice && <p className="admin-notice">{notice}</p>}

    <div className="admin-grid admin-grid-wide">
      <section className="panel admin-form">
        <p className="eyebrow">Unidades de negocio</p>
        <h2>Editar unidad</h2>
        <form className="admin-inner-form" onSubmit={saveUnit}>
          <label><span>Unidad</span><select value={selectedUnitId} onChange={(event) => { setSelectedUnitId(event.target.value); setSelectedPositionId("new"); }}>{units.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Nombre</span><input required value={unitDraft.name} onChange={(event) => updateUnitDraft("name", event.target.value)} /></label>
          <label><span>Descripción</span><textarea value={unitDraft.description} onChange={(event) => updateUnitDraft("description", event.target.value)} /></label>
          <div className="form-grid"><label><span>Responsable</span><input value={unitDraft.responsible} onChange={(event) => updateUnitDraft("responsible", event.target.value)} /></label><label><span>Estatus</span><select value={unitDraft.status} onChange={(event) => updateUnitDraft("status", event.target.value as BusinessUnit["status"])}><option value="active">Activa</option><option value="inactive">Inactiva</option></select></label></div>
          <label><span>Observaciones</span><textarea value={unitDraft.observations} onChange={(event) => updateUnitDraft("observations", event.target.value)} /></label>
          <button className="primary-button" type="submit"><Icon name="check" size={16} /> Guardar unidad</button>
        </form>
        <form className="admin-new-unit" onSubmit={submitNewUnit}>
          <label><span>Nueva unidad</span><input placeholder="Ej. Nueva unidad Axen" value={newUnitName} onChange={(event) => setNewUnitName(event.target.value)} /></label>
          <button className="secondary-button" type="submit"><Icon name="plus" size={16} /> Agregar</button>
        </form>
        <div className="unit-list">{units.map((item) => <article key={item.id}><b>{item.name}</b><span>{positions.filter((position) => position.businessUnitId === item.id).length} puestos configurados · {item.status === "active" ? "Activa" : "Inactiva"}</span></article>)}</div>
      </section>

      <form className="panel admin-form position-admin" onSubmit={savePosition}>
        <p className="eyebrow">Catálogo especializado</p>
        <h2>Editar puesto, REP y KPIs</h2>
        <div className="form-grid">
          <label><span>Unidad</span><select value={positionDraft.businessUnitId} onChange={(event) => { updatePositionDraft("businessUnitId", event.target.value); setSelectedUnitId(event.target.value); setSelectedPositionId("new"); }}>{units.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Puesto</span><select value={selectedPositionId} onChange={(event) => setSelectedPositionId(event.target.value)}><option value="new">Nuevo puesto</option>{positionLevelGroups.map((group) => <optgroup key={group.level} label={group.level}>{group.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}</select></label>
          <label><span>Estatus</span><select value={positionDraft.status} onChange={(event) => updatePositionDraft("status", event.target.value as Position["status"])}><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label>
          <label><span>Área</span><input required value={positionDraft.area} onChange={(event) => updatePositionDraft("area", event.target.value)} /></label>
          <label><span>Nombre del puesto</span><input required value={positionDraft.name} onChange={(event) => updatePositionDraft("name", event.target.value)} /></label>
          <div className="operational-level-preview"><span>Escalón operativo</span><strong>{getOperationalLevel(positionDraft)}</strong><small>Se asigna automáticamente según el puesto.</small></div>
          <label><span>Captura digital</span><select value={positionDraft.isEvaluable ? "true" : "false"} onChange={(event) => updatePositionDraft("isEvaluable", event.target.value === "true")}><option value="true">Evaluable si está completo</option><option value="false">Bloqueado</option></select></label>
          <label className="span-2"><span>REP oficial</span><textarea value={positionDraft.rep} onChange={(event) => updatePositionDraft("rep", event.target.value)} /></label>
        </div>
        <div className="admin-kpi-header"><div><p className="eyebrow">KPIs activos</p><strong>{cleanKpis(positionDraft.kpis).length} configurados</strong></div><button className="secondary-button" onClick={() => updatePositionDraft("kpis", [...positionDraft.kpis, emptyKpi()])} type="button"><Icon name="plus" size={16} /> Agregar KPI</button></div>
        <div className="admin-kpi-list">{positionDraft.kpis.map((kpi, index) => <div className="admin-kpi" key={index}>
          <label><span>KPI {index + 1}</span><input value={kpi.name} onChange={(event) => updateKpi(index, "name", event.target.value)} /></label>
          <label><span>Descripción KPI {index + 1}</span><input value={kpi.description} onChange={(event) => updateKpi(index, "description", event.target.value)} /></label>
          <button className="text-button admin-remove-kpi" onClick={() => removeKpi(index)} type="button"><Icon name="x" size={15} /> Quitar</button>
        </div>)}</div>
        <div className="form-grid"><label><span>Periodicidad sugerida</span><input value={positionDraft.suggestedFrequency} onChange={(event) => updatePositionDraft("suggestedFrequency", event.target.value)} /></label><label><span>Evidencia sugerida</span><input value={positionDraft.suggestedEvidence} onChange={(event) => updatePositionDraft("suggestedEvidence", event.target.value)} /></label><label><span>Evaluador sugerido</span><input value={positionDraft.suggestedEvaluator} onChange={(event) => updatePositionDraft("suggestedEvaluator", event.target.value)} /></label></div>
        <button className="primary-button" type="submit"><Icon name="check" size={16} /> {selectedPositionId === "new" ? "Agregar puesto" : "Guardar puesto"}</button>
      </form>
    </div>
  </div>;
}

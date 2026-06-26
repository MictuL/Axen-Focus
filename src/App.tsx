import { useEffect, useMemo, useState } from "react";
import { CatalogAdmin } from "./components/CatalogAdmin";
import { ConditionBadge } from "./components/ConditionBadge";
import { EvaluationForm } from "./components/EvaluationForm";
import { EvaluationResetPanel } from "./components/EvaluationResetPanel";
import { EvaluationTable } from "./components/EvaluationTable";
import { FocusRelationshipAdmin } from "./components/FocusRelationshipAdmin";
import { FocusSettingsAdmin } from "./components/FocusSettingsAdmin";
import { FocusPrintableForm } from "./components/FocusPrintableForm";
import { Icon } from "./components/Icon";
import { PerformanceChart } from "./components/PerformanceChart";
import { PositionIndicatorMetrics } from "./components/PositionIndicatorMetrics";
import axenLogoDark from "./assets/axen-capital-logo-dark.png";
import { useCatalog } from "./hooks/useCatalog";
import { useCollaboratorProfiles } from "./hooks/useCollaboratorProfiles";
import { useDocumentRegistry } from "./hooks/useDocumentRegistry";
import { useEvaluations } from "./hooks/useEvaluations";
import { useFocusRelationships } from "./hooks/useFocusRelationships";
import { useFocusSettings } from "./hooks/useFocusSettings";
import { useOperationalGoals } from "./hooks/useOperationalGoals";
import { usePositionIndicators } from "./hooks/usePositionIndicators";
import { useUnitConditionReviews } from "./hooks/useUnitConditionReviews";
import { FUNDACION_DANTE_UNIT_ID } from "./data/units/fundacionDante";
import { getFocusDailySource } from "./data/units/focusDailyOperationFormats";
import { getOperationalLevel, isPositionReady } from "./lib/catalog";
import { conditionFormula, getCollaboratorEvaluations, getEvaluationProfileKey, getEvaluationTrendScore } from "./lib/evaluation";
import { getIndividualTrendSeries } from "./lib/analytics";
import type { EvaluationResetRequest, EvaluationResetResult } from "./lib/evaluationReset";
import { getFocusFormula } from "./lib/focusDaily";
import { labelForOperationalLevel, MASTER_ACCESS_ID, roleForPosition } from "./lib/fundacionAccess";
import { buildFundacionHierarchy, flattenFundacionHierarchy, type FundacionHierarchyNode } from "./lib/fundacionHierarchy";
import { getNextDocumentFolio, normalizeDocumentFolio } from "./lib/folios";
import { formatGoalCadence, goalIsActiveOnDate, type UnitGoalIndicatorOption } from "./lib/goals";
import type { BusinessUnit, CollaboratorProfile, Evaluation, EvaluationDraft, FocusHierarchyRelationship, FocusSettings, FocusTrendCondition, OperationalCondition, PlatformRole, Position, WeeklyPositionIndicatorEvaluation } from "./types";

type View = "home" | "evaluate" | "indicators" | "followup" | "orgchart" | "records" | "admin";
type RecordsTab = "history" | "formats";
type AccessMode = "master" | "profile";

interface AccessContext {
  mode: AccessMode;
  businessUnitId: string;
  displayName: string;
  profileId?: string;
  positionId?: string;
  role: PlatformRole;
}

const navGroups: Array<{
  label: string;
  items: Array<{ id: View; label: string; helper: string; icon: Parameters<typeof Icon>[0]["name"] }>;
}> = [
  {
    label: "Trabajo",
    items: [
      { id: "home", label: "Inicio", helper: "Resumen", icon: "home" },
      { id: "evaluate", label: "Focus", helper: "Diario", icon: "plus" },
      { id: "indicators", label: "Indicadores y Metas", helper: "Semanal", icon: "clipboard" },
    ],
  },
  {
    label: "Control",
    items: [
      { id: "followup", label: "Seguimiento", helper: "Condiciones", icon: "chart" },
      { id: "orgchart", label: "Organigrama", helper: "Mapa operativo", icon: "people" },
      { id: "records", label: "Registros", helper: "Historial", icon: "archive" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "admin", label: "Administración", helper: "Configuración", icon: "shield" },
    ],
  },
];

const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
const compactNumberFormatter = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const ACCESS_SESSION_KEY = "axen-evaluation-access-v2";
const LEGACY_AUTH_KEY = "axen-evaluation-auth";
const ADMIN_LOGIN_UNIT_ID = "__platform-admin__";
const ADMIN_LOGIN_UNIT_NAME = "Administración";
const ADMIN_LOGIN_POSITION_NAME = "Administración general de la plataforma";

function masterAccess(businessUnitId = FUNDACION_DANTE_UNIT_ID): AccessContext {
  return {
    mode: "master",
    businessUnitId,
    displayName: ADMIN_LOGIN_POSITION_NAME,
    profileId: MASTER_ACCESS_ID,
    role: "Administrador",
  };
}

function profileAccess(profile: CollaboratorProfile, positions: Position[]): AccessContext {
  const position = positions.find((item) => item.id === profile.positionId);
  return {
    mode: "profile",
    businessUnitId: profile.businessUnitId,
    displayName: profile.name,
    profileId: profile.id,
    positionId: profile.positionId,
    role: roleForPosition(position),
  };
}

function loadAccessSession(): AccessContext | undefined {
  try {
    const stored = sessionStorage.getItem(ACCESS_SESSION_KEY);
    return stored ? JSON.parse(stored) as AccessContext : undefined;
  } catch {
    return undefined;
  }
}

function canSeeTeamAccess(access?: AccessContext) {
  return access?.mode === "master"
    || access?.role === "Director de Unidad"
    || access?.role === "Gerente"
    || access?.role === "Coordinador";
}

function accessAllowedViews(access?: AccessContext): View[] {
  if (!access) return [];
  if (access.mode === "master") return ["home", "evaluate", "indicators", "followup", "records", "admin"];
  if (canSeeTeamAccess(access)) return ["home", "evaluate", "indicators", "followup", "orgchart", "records"];
  return ["home", "evaluate", "followup", "orgchart", "records"];
}

function filterNavGroupsForAccess(access?: AccessContext) {
  const allowed = new Set(accessAllowedViews(access));
  return navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => allowed.has(item.id)) }))
    .filter((group) => group.items.length);
}

function findDirectorProfile(profiles: CollaboratorProfile[], positions: Position[], businessUnitId: string) {
  const directorPosition = positions.find((position) =>
    position.businessUnitId === businessUnitId
    && getOperationalLevel(position) === "Planeación"
  );
  return directorPosition ? profiles.find((profile) => profile.positionId === directorPosition.id) : undefined;
}

function getManagedProfileIds(rootProfileId: string | undefined, businessUnitId: string, profiles: CollaboratorProfile[], positions: Position[], relationships: FocusHierarchyRelationship[]) {
  if (!rootProfileId) return [];
  const root = buildFundacionHierarchy({
    businessUnitId,
    evaluations: [],
    positions,
    profiles,
    relationships,
    rootProfileId,
  });
  return flattenFundacionHierarchy(root).map((node) => node.profile.id);
}

function getVisibleProfileIdsForAccess(access: AccessContext | undefined, profiles: CollaboratorProfile[], positions: Position[], relationships: FocusHierarchyRelationship[]) {
  if (!access || access.mode === "master") return undefined;
  if (canSeeTeamAccess(access)) return getManagedProfileIds(access.profileId, access.businessUnitId, profiles, positions, relationships);
  return access.profileId ? [access.profileId] : [];
}

function getPositionIdsForProfiles(profileIds: string[] | undefined, profiles: CollaboratorProfile[]) {
  if (!profileIds) return undefined;
  const profileSet = new Set(profileIds);
  return profiles.filter((profile) => profileSet.has(profile.id)).map((profile) => profile.positionId);
}

function labelForAccess(access?: AccessContext, positions: Position[] = []) {
  if (!access) return "Sin sesión";
  if (access.mode === "master") return "Vista maestra";
  const position = positions.find((item) => item.id === access.positionId);
  const levelLabel = labelForOperationalLevel(position ? getOperationalLevel(position) : undefined);
  return levelLabel === access.role ? access.role : `${levelLabel} · ${access.role}`;
}

const normalizeLookupValue = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-MX").replace(/[^a-z0-9]+/g, " ").trim();

function optimizeProfilePhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const source = typeof reader.result === "string" ? reader.result : "";
      if (!source) {
        reject(new Error("No se pudo leer la imagen."));
        return;
      }
      const image = new Image();
      image.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      image.onload = () => {
        const maxSide = 420;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("No se pudo preparar la imagen."));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

function formatDisplayDate(value?: string) {
  if (!value) return "Sin fecha";
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function indicatorRecordDate(record?: WeeklyPositionIndicatorEvaluation) {
  return record?.createdAt || record?.weekStartDate || "";
}

function formatGoalAmount(value: number | undefined, valueKind: UnitGoalIndicatorOption["valueKind"] = "percentage") {
  if (!Number.isFinite(value)) return valueKind === "percentage" ? "0%" : "0";
  const formatted = compactNumberFormatter.format(Number(value));
  return valueKind === "percentage" ? `${formatted}%` : formatted;
}

function focusEvaluationDateLabel(evaluation?: Evaluation) {
  return formatDisplayDate(evaluation?.date);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getLatestProfileIndicatorRecord(records: WeeklyPositionIndicatorEvaluation[], profileId?: string, businessUnitId?: string) {
  if (!profileId) return undefined;
  return [...records]
    .filter((record) =>
      record.collaboratorProfileId === profileId
      && (!businessUnitId || record.businessUnitId === businessUnitId)
    )
    .sort((left, right) =>
      indicatorRecordDate(right).localeCompare(indicatorRecordDate(left))
      || right.updatedAt.localeCompare(left.updatedAt)
    )[0];
}

function getPositionSourceDetails(position?: Position) {
  if (!position) return undefined;
  const source = getFocusDailySource(position.businessUnitId);
  if (!source) return undefined;

  const positionName = normalizeLookupValue(position.name);
  const rep = normalizeLookupValue(position.rep);
  return source.positions.find((item) => normalizeLookupValue(item.positionName) === positionName || Boolean(rep && normalizeLookupValue(item.rep) === rep));
}

function ProfilePhotoControl({
  profile,
  onPhotoChange,
}: {
  profile?: CollaboratorProfile;
  onPhotoChange: (profileId: string, photoUrl: string) => void;
}) {
  const [photoError, setPhotoError] = useState("");
  if (!profile) return null;
  const currentProfile = profile;

  async function changePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Selecciona una imagen válida.");
      event.target.value = "";
      return;
    }
    setPhotoError("");
    try {
      const optimizedPhoto = await optimizeProfilePhoto(file);
      onPhotoChange(currentProfile.id, optimizedPhoto);
    } catch {
      setPhotoError("No se pudo cargar la foto. Intenta con otra imagen.");
    } finally {
      event.target.value = "";
    }
  }

  return <div className="profile-photo-control">
    <div className="profile-photo-avatar">
      {currentProfile.photoUrl ? <img src={currentProfile.photoUrl} alt={currentProfile.name} /> : <span>{initials(currentProfile.name)}</span>}
    </div>
    <div>
      <strong>{currentProfile.name}</strong>
      <label className="profile-photo-button">
        <Icon name="plus" size={13} />
        <span>{currentProfile.photoUrl ? "Cambiar foto" : "Agregar foto"}</span>
        <input accept="image/*" onChange={changePhoto} type="file" />
      </label>
      {photoError ? <small className="profile-photo-error">{photoError}</small> : null}
    </div>
  </div>;
}

function WorkspaceHeader({
  action,
  copy,
  eyebrow,
  title,
  tone,
}: {
  action?: React.ReactNode;
  copy: string;
  eyebrow: string;
  title: string;
  tone?: "focus";
}) {
  return <header className={`workspace-header ${tone === "focus" ? "is-focus" : ""}`}>
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
    {action ? <div className="workspace-header-action">{action}</div> : null}
  </header>;
}

function WorkspaceTabs<T extends string>({
  active,
  onChange,
  tabs,
}: {
  active: T;
  onChange: (value: T) => void;
  tabs: Array<{ id: T; label: string; helper: string; icon: Parameters<typeof Icon>[0]["name"] }>;
}) {
  return <div className="workspace-tabs" role="tablist">
    {tabs.map((tab) => <button aria-selected={active === tab.id} className={active === tab.id ? "is-active" : ""} key={tab.id} onClick={() => onChange(tab.id)} role="tab" type="button">
      <Icon name={tab.icon} size={17} />
      <span><b>{tab.label}</b><small>{tab.helper}</small></span>
    </button>)}
  </div>;
}

function UnitSelector({
  selectedUnitId,
  setSelectedUnitId,
  units,
}: {
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  units: BusinessUnit[];
}) {
  return <label className="unit-context-select">
    <span>Unidad</span>
    <select value={selectedUnitId} onChange={(event) => setSelectedUnitId(event.target.value)}>
      {units.filter((unit) => unit.status === "active").map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
    </select>
  </label>;
}

function normalizeConditionForGuide(condition?: OperationalCondition | FocusTrendCondition): OperationalCondition {
  if (!condition || condition === "Sin histórico suficiente") return "Inexistencia";
  return condition;
}

function formulaStepsForCondition(condition: OperationalCondition, focusSettings: FocusSettings) {
  const configuredSteps = getFocusFormula(condition, focusSettings.formulas);
  return configuredSteps.length ? configuredSteps : conditionFormula[condition];
}

function latestEvaluationForProfile(evaluations: Evaluation[], profileId?: string, businessUnitId?: string) {
  if (!profileId) return undefined;
  return getCollaboratorEvaluations(evaluations)
    .filter((evaluation) =>
      getEvaluationProfileKey(evaluation) === profileId
      && (!businessUnitId || evaluation.businessUnitId === businessUnitId)
    )
    .sort((left, right) =>
      left.date.localeCompare(right.date)
      || left.digitalCaptureDate.localeCompare(right.digitalCaptureDate)
    )
    .at(-1);
}

function ConditionFormulaGuide({
  condition,
  focusSettings,
}: {
  condition: OperationalCondition;
  focusSettings: FocusSettings;
}) {
  const steps = formulaStepsForCondition(condition, focusSettings);
  return <div className="condition-formula-card">
    <div>
      <p className="eyebrow">Fórmula actual</p>
      <h3>{condition}</h3>
    </div>
    <ol>
      {steps.map((step, index) => <li key={`${condition}-${index}`}>{step}</li>)}
    </ol>
  </div>;
}

function PersonalConditionSnapshot({
  access,
  evaluations,
  focusSettings,
  onEvaluate,
  onFollowup,
  positions,
  selectedUnit,
}: {
  access?: AccessContext;
  evaluations: Evaluation[];
  focusSettings: FocusSettings;
  onEvaluate: () => void;
  onFollowup: () => void;
  positions: Position[];
  selectedUnit?: BusinessUnit;
}) {
  const latestEvaluation = latestEvaluationForProfile(evaluations, access?.profileId, selectedUnit?.id);
  const condition = normalizeConditionForGuide(latestEvaluation?.focusDaily?.trendCondition ?? latestEvaluation?.condition);
  const score = latestEvaluation ? getEvaluationTrendScore(latestEvaluation) : 0;
  const position = positions.find((item) => item.id === access?.positionId);
  const periodLabel = latestEvaluation?.date || "Sin registro";
  const trendLabel = latestEvaluation?.trend ?? "Sin histórico";

  return <section className="home-condition-snapshot">
    <article className="condition-snapshot-card">
      <div className="condition-snapshot-heading">
        <div>
          <p className="eyebrow">Mi condición</p>
          <h2>{access?.displayName}</h2>
        </div>
        <ConditionBadge condition={condition} />
      </div>
      <div className="condition-score-row">
        <span>Índice actual</span>
        <strong>{score}%</strong>
      </div>
      <div className="condition-snapshot-grid">
        <div><span>Unidad</span><strong>{selectedUnit?.name ?? "Sin unidad"}</strong></div>
        <div><span>Puesto</span><strong>{position?.name ?? labelForAccess(access, positions)}</strong></div>
        <div><span>Última fecha</span><strong>{periodLabel}</strong></div>
        <div><span>Tendencia</span><strong>{trendLabel}</strong></div>
      </div>
      <div className="condition-snapshot-actions">
        <button className="primary-button" onClick={onEvaluate} type="button"><Icon name="plus" size={15} /> Capturar Focus</button>
        <button className="secondary-button" onClick={onFollowup} type="button"><Icon name="chart" size={15} /> Ver seguimiento</button>
      </div>
    </article>
    <ConditionFormulaGuide condition={condition} focusSettings={focusSettings} />
  </section>;
}

function GeneralHome({
  access,
  evaluations,
  focusSettings,
  onOpenView,
  positions,
  selectedUnitId,
  setSelectedUnitId,
  units,
}: {
  access?: AccessContext;
  evaluations: Evaluation[];
  focusSettings: FocusSettings;
  onOpenView: (view: View) => void;
  positions: Position[];
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  units: BusinessUnit[];
}) {
  const activeUnits = units.filter((unit) => unit.status === "active");
  const selectedUnit = activeUnits.find((unit) => unit.id === selectedUnitId) ?? activeUnits[0];
  const canSeeTeam = canSeeTeamAccess(access);
  const activePosition = access?.positionId ? positions.find((position) => position.id === access.positionId) : undefined;
  const activePositionSource = getPositionSourceDetails(activePosition);
  const activePositionObjective = activePositionSource?.objective?.trim() || "Objetivo pendiente de definir en Administración.";
  const activePositionRep = activePosition?.rep?.trim() || "REP pendiente de definir.";
  const activePositionProduct = activePosition?.rep?.trim() || "Producto pendiente de definir.";
  const hasSupervision = positions.some((position) =>
    selectedUnit
    && position.businessUnitId === selectedUnit.id
    && isPositionReady(position)
    && getOperationalLevel(position) === "Supervisión"
  );
  const workflow = [
    { number: "01", title: "Focus", copy: "Captura actividades diarias, avance real y bloqueos del colaborador.", icon: "plus" as const, action: "Capturar Focus", view: "evaluate" as const },
    { number: "02", title: "Indicadores y Metas", copy: "Evalúa semanalmente REP e indicadores fundamentales como fuente separada.", icon: "clipboard" as const, action: "Abrir indicadores y metas", view: "indicators" as const },
    { number: "03", title: canSeeTeam ? "Dirigir por condición" : "Mi condición", copy: canSeeTeam ? hasSupervision ? "Gerentes y directores reciben el resultado consolidado y registran acciones." : "Los directores reciben el resultado de Ejecución y registran acciones." : "Consulta tu condición actual, tendencia y fórmula vigente.", icon: "chart" as const, action: canSeeTeam ? "Abrir seguimiento" : "Ver mi seguimiento", view: "followup" as const },
    { number: "04", title: "Consultar registros", copy: "Busca evaluaciones, expedientes por folio y formatos listos para imprimir.", icon: "archive" as const, action: "Ver registros", view: "records" as const },
  ].filter((item) => accessAllowedViews(access).includes(item.view));

  return <>
    <section className="home-command">
      <div className="home-command-copy">
        <p className="eyebrow">Centro de información organizacional</p>
        <h1>{canSeeTeam ? "Dirigir con datos claros." : "Tu perfil operativo."}</h1>
        <p>{canSeeTeam
          ? "Elige el módulo de trabajo: captura Focus, administra indicadores, revisa seguimiento o consulta registros."
          : "Accede a tu Focus Diario, consulta tu condición actual y revisa tus registros sin módulos que no corresponden."}</p>
      </div>
      <div className="home-command-control">
        {access?.mode === "master" ? <UnitSelector selectedUnitId={selectedUnit?.id ?? ""} setSelectedUnitId={setSelectedUnitId} units={units} /> : <div className="home-unit-context"><span>Acceso activo</span><strong>{access?.displayName}</strong><p>{labelForAccess(access, positions)}</p></div>}
        <div className="home-unit-context">
          <span>Contexto activo</span>
          <strong>{selectedUnit?.name ?? "Sin unidad"}</strong>
          <p>{selectedUnit?.description}</p>
        </div>
      </div>
    </section>

    {activePosition ? <section className="home-position-brief" aria-label="Información estratégica del puesto">
      <div className="position-brief-heading">
        <div>
          <p className="eyebrow">Puesto activo</p>
          <h2>{activePosition.name}</h2>
        </div>
        <span>{getOperationalLevel(activePosition)} · {activePosition.area}</span>
      </div>
      <div className="position-brief-grid">
        <article>
          <span>Objetivo</span>
          <p>{activePositionObjective}</p>
        </article>
        <article>
          <span>REP</span>
          <p>{activePositionRep}</p>
        </article>
        <article>
          <span>Producto a entregar</span>
          <p>{activePositionProduct}</p>
        </article>
      </div>
    </section> : null}

    <section className="workflow-entry">
      <div className="section-intro">
        <div><p className="eyebrow">Proceso principal</p><h2>¿Qué necesitas hacer?</h2></div>
        <p>Cada módulo corresponde a una etapa distinta. No necesitas saltar entre pantallas para completar una misma tarea.</p>
      </div>
      <div className={`workflow-entry-grid${workflow.length >= 4 ? " has-four-items" : ""}`}>
        {workflow.map((item) => <article className={item.number === "01" ? "is-primary" : ""} key={item.number}>
          <div className="workflow-card-number">{item.number}</div>
          <div className="workflow-card-icon"><Icon name={item.icon} size={18} /></div>
          <h3>{item.title}</h3>
          <p>{item.copy}</p>
          <button className={item.number === "01" ? "primary-button" : "secondary-button"} onClick={() => onOpenView(item.view)} type="button">{item.action}</button>
        </article>)}
      </div>
    </section>

    {!canSeeTeam ? <PersonalConditionSnapshot access={access} evaluations={evaluations} focusSettings={focusSettings} onEvaluate={() => onOpenView("evaluate")} onFollowup={() => onOpenView("followup")} positions={positions} selectedUnit={selectedUnit} /> : null}
  </>;
}

function LoginScreen({
  onLogin,
  positions = [],
  profiles = [],
  units = [],
}: {
  onLogin: (access: AccessContext) => void;
  positions: Position[];
  profiles: CollaboratorProfile[];
  units: BusinessUnit[];
}) {
  const [credentials, setCredentials] = useState({ user: "", password: "" });
  const activeUnits = useMemo(() => units.filter((unit) => unit.status === "active"), [units]);
  const loginUnits = useMemo(() => [
    { id: ADMIN_LOGIN_UNIT_ID, name: ADMIN_LOGIN_UNIT_NAME },
    ...activeUnits.map((unit) => ({ id: unit.id, name: unit.name })),
  ], [activeUnits]);
  const defaultUnitId = ADMIN_LOGIN_UNIT_ID;
  const [selectedUnitId, setSelectedUnitId] = useState(defaultUnitId);
  const [selectedAccessId, setSelectedAccessId] = useState(MASTER_ACCESS_ID);
  const [error, setError] = useState("");
  const isAdminLogin = selectedUnitId === ADMIN_LOGIN_UNIT_ID;

  useEffect(() => {
    if (!loginUnits.length) return;
    if (!loginUnits.some((unit) => unit.id === selectedUnitId)) {
      setSelectedUnitId(ADMIN_LOGIN_UNIT_ID);
      setSelectedAccessId(MASTER_ACCESS_ID);
    }
  }, [loginUnits, selectedUnitId]);

  const profileOptions = profiles
    .filter((profile) => profile.businessUnitId === selectedUnitId && profile.status === "active")
    .map((profile) => {
      const position = positions.find((item) => item.id === profile.positionId);
      return { profile, position, level: position ? getOperationalLevel(position) : "Ejecución" };
    })
    .sort((left, right) => {
      const order = { "Planeación": 0, "Supervisión": 1, "Ejecución": 2 };
      return order[left.level] - order[right.level] || left.profile.name.localeCompare(right.profile.name, "es");
    });

  function firstProfileIdForUnit(unitId: string) {
    return profiles.find((profile) => profile.businessUnitId === unitId && profile.status === "active")?.id ?? "";
  }

  function selectUnit(unitId: string) {
    setError("");
    setSelectedUnitId(unitId);
    setSelectedAccessId(unitId === ADMIN_LOGIN_UNIT_ID ? MASTER_ACCESS_ID : firstProfileIdForUnit(unitId));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (credentials.user === "Admin" && credentials.password === "AxenCapital123") {
      if (isAdminLogin) {
        const access = masterAccess(activeUnits[0]?.id ?? FUNDACION_DANTE_UNIT_ID);
        sessionStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify(access));
        sessionStorage.removeItem(LEGACY_AUTH_KEY);
        onLogin(access);
        return;
      }
      const selectedProfile = profiles.find((profile) => profile.id === selectedAccessId);
      if (!selectedProfile || selectedProfile.businessUnitId !== selectedUnitId) {
        setError("Selecciona un perfil de trabajo válido.");
        return;
      }
      const access = profileAccess(selectedProfile, positions);
      sessionStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify(access));
      sessionStorage.removeItem(LEGACY_AUTH_KEY);
      onLogin(access);
      return;
    }
    setError("Usuario o contraseña incorrectos.");
  }

  return <main className="login-page">
    <section className="login-panel">
      <div className="login-copy">
        <img className="login-logo" src={axenLogoDark} alt="Axen Capital" />
        <p className="eyebrow">Axen Capital</p>
        <h1>Plataforma interna de evaluación</h1>
        <p>Acceso privado para Focus, indicadores y seguimiento operativo.</p>
      </div>
      <form className="login-form" onSubmit={submit}>
        <div><p className="eyebrow">Acceso interno</p><h2>Iniciar sesión</h2></div>
        <div className="login-access-fields">
          <label><span>Unidad de negocio</span><select value={selectedUnitId} onChange={(event) => selectUnit(event.target.value)}>
            {loginUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
          </select></label>
          <label><span>Perfil de trabajo</span><select value={selectedAccessId} onChange={(event) => { setError(""); setSelectedAccessId(event.target.value); }}>
            {isAdminLogin
              ? <option value={MASTER_ACCESS_ID}>{ADMIN_LOGIN_POSITION_NAME}</option>
              : profileOptions.map(({ profile }) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select></label>
        </div>
        <label><span>Usuario</span><input autoComplete="username" value={credentials.user} onChange={(event) => { setError(""); setCredentials((current) => ({ ...current, user: event.target.value })); }} /></label>
        <label><span>Contraseña</span><input autoComplete="current-password" type="password" value={credentials.password} onChange={(event) => { setError(""); setCredentials((current) => ({ ...current, password: event.target.value })); }} /></label>
        {error && <p className="login-error">{error}</p>}
        <button className="primary-button" type="submit"><Icon name="shield" size={16} /> Entrar</button>
      </form>
    </section>
  </main>;
}

function EvaluateWorkspace({
  access,
  evaluations,
  focusSettings,
  goalAssignments,
  onSubmitEvaluation,
  positions,
  profiles,
  selectedUnitId,
  setSelectedUnitId,
  units,
}: {
  access?: AccessContext;
  evaluations: Evaluation[];
  focusSettings: FocusSettings;
  goalAssignments: ReturnType<typeof useOperationalGoals>["goals"];
  onSubmitEvaluation: (draft: EvaluationDraft) => Evaluation;
  positions: Position[];
  profiles: CollaboratorProfile[];
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  units: BusinessUnit[];
}) {
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
  const lockedProfile = access?.mode === "profile" ? profiles.find((profile) => profile.id === access.profileId) : undefined;
  const lockedPosition = lockedProfile ? positions.find((position) => position.id === lockedProfile.positionId) : undefined;
  const canChangeUnit = access?.mode === "master" && units.filter((unit) => unit.status === "active").length > 1;
  return <>
    <WorkspaceHeader
      action={canChangeUnit ? <UnitSelector selectedUnitId={selectedUnitId} setSelectedUnitId={setSelectedUnitId} units={units} /> : undefined}
      copy={lockedProfile
        ? "Captura el Focus Diario de tu perfil. La plataforma conserva el histórico para comparar tu avance por día."
        : "Captura las actividades del día. El cumplimiento ponderado, semáforo y condición de tendencia se calculan en segundo plano."}
      eyebrow="Fuente 1 · Diaria"
      tone="focus"
      title={lockedProfile ? "Mi Focus Diario" : "Focus"}
    />
    {!lockedProfile ? <div className="workspace-context-line">
      <Icon name="grid" size={16} />
      <div><span>Unidad activa</span><strong>{selectedUnit?.name}</strong></div>
      <p>{selectedUnit?.description}</p>
    </div> : null}
    <EvaluationForm
      evaluations={evaluations}
      focusSettings={focusSettings}
      goalAssignments={goalAssignments}
      key={`${selectedUnitId}:${lockedProfile?.id ?? "master"}:${lockedPosition?.id ?? "unit"}`}
      lockedProfileId={lockedProfile?.id}
      lockedProfileName={lockedProfile?.name}
      lockedPositionId={lockedPosition?.id}
      lockedUnitId={selectedUnitId}
      onSubmit={onSubmitEvaluation}
      positions={positions}
      profiles={profiles}
      units={units}
    />
  </>;
}

function IndicatorsWorkspace({
  access,
  allowedProfileIds,
  goalStore,
  indicatorStore,
  positions,
  profiles,
  relationships,
  selectedUnitId,
  setSelectedUnitId,
  units,
}: {
  access?: AccessContext;
  allowedProfileIds?: string[];
  goalStore: ReturnType<typeof useOperationalGoals>;
  indicatorStore: ReturnType<typeof usePositionIndicators>;
  positions: Position[];
  profiles: CollaboratorProfile[];
  relationships: FocusHierarchyRelationship[];
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  units: BusinessUnit[];
}) {
  return <PositionIndicatorMetrics
    allowedProfileIds={allowedProfileIds}
    accessDisplayName={access?.displayName}
    accessMode={access?.mode}
    accessProfileId={access?.profileId}
    accessRole={access?.role}
    goalAssignments={goalStore.goals}
    profiles={profiles}
    positions={positions}
    records={indicatorStore.records}
    relationships={relationships}
    saveWeeklyEvaluation={indicatorStore.saveWeeklyEvaluation}
    selectedUnitId={selectedUnitId}
    setSelectedUnitId={setSelectedUnitId}
    units={units}
    upsertGoals={goalStore.upsertGoals}
  />;
}

function PersonalOrgSnapshot({
  access,
  evaluations,
  indicatorRecords,
  onSelectProfile,
  positions,
  profiles,
  relationships,
  selectedUnit,
}: {
  access?: AccessContext;
  evaluations: Evaluation[];
  indicatorRecords: WeeklyPositionIndicatorEvaluation[];
  onSelectProfile?: (profileId: string) => void;
  positions: Position[];
  profiles: CollaboratorProfile[];
  relationships: FocusHierarchyRelationship[];
  selectedUnit?: BusinessUnit;
}) {
  const profileId = access?.profileId ?? "";
  const directorProfile = selectedUnit ? findDirectorProfile(profiles, positions, selectedUnit.id) : undefined;
  const unitHierarchy = selectedUnit && directorProfile ? buildFundacionHierarchy({
    businessUnitId: selectedUnit.id,
    evaluations,
    positions,
    profiles,
    relationships,
    rootProfileId: directorProfile.id,
  }) : undefined;
  const unitNodes = flattenFundacionHierarchy(unitHierarchy);

  function renderOrgNode(node: FundacionHierarchyNode, depth = 0) {
    const isCurrent = node.profile.id === profileId;
    const level = node.position ? labelForOperationalLevel(getOperationalLevel(node.position)) : "Perfil";
    const focusCondition = node.ownFocusCondition ?? (node.ready ? node.consolidatedCondition : undefined);
    const latestIndicator = getLatestProfileIndicatorRecord(indicatorRecords, node.profile.id, selectedUnit?.id);
    const canOpen = Boolean(onSelectProfile) && (canSeeTeamAccess(access) || access?.mode === "master" || isCurrent);
    const rowContent = <>
      <div className="org-tree-person">
        <div className="initials">{initials(node.profile.name)}</div>
        <div>
          <b>{node.profile.name}</b>
          <span>{node.position?.name ?? "Puesto sin asignar"} · {level}</span>
        </div>
      </div>
      <div className="org-condition-strip">
        <div><span>Focus</span>{focusCondition ? <ConditionBadge condition={focusCondition} /> : <strong>Pendiente</strong>}</div>
        <div><span>Indicadores</span>{latestIndicator ? <ConditionBadge condition={latestIndicator.weeklyCondition} /> : <strong>Sin evaluación</strong>}</div>
      </div>
    </>;

    return <article className={`org-tree-row depth-${Math.min(depth, 3)} ${isCurrent ? "is-current" : ""}`} key={node.profile.id}>
      {canOpen
        ? <button className="org-tree-row-action" onClick={() => onSelectProfile?.(node.profile.id)} type="button">{rowContent}</button>
        : <div className="org-tree-row-action is-static">{rowContent}</div>}
      {node.children.length ? <div className="org-tree-children">{node.children.map((child) => renderOrgNode(child, depth + 1))}</div> : null}
    </article>;
  }

  return <section className="panel personal-org-panel">
    <div className="panel-heading">
      <div><p className="eyebrow">Mi organigrama</p><h2>Mapa descendente</h2></div>
      <span className="count-badge">{unitNodes.length ? `${unitNodes.length} perfiles` : "Sin estructura"}</span>
    </div>
    <div className="personal-org-tree">
      <div className="org-tree-heading">
        <h3>Estructura completa</h3>
        <p>Selecciona un perfil para abrir su seguimiento.</p>
      </div>
      <div className="org-tree-list">
        {unitHierarchy ? renderOrgNode(unitHierarchy) : <div className="empty-state"><Icon name="people" size={24} /><strong>Sin organigrama activo</strong><span>Configura relaciones de reporte para mostrar el mapa completo.</span></div>}
      </div>
    </div>
  </section>;
}

function OrgChartWorkspace({
  access,
  evaluations,
  indicatorRecords,
  onSelectProfile,
  positions,
  profiles,
  relationships,
  selectedUnitId,
  units,
}: {
  access?: AccessContext;
  evaluations: Evaluation[];
  indicatorRecords: WeeklyPositionIndicatorEvaluation[];
  onSelectProfile?: (profileId: string) => void;
  positions: Position[];
  profiles: CollaboratorProfile[];
  relationships: FocusHierarchyRelationship[];
  selectedUnitId: string;
  units: BusinessUnit[];
}) {
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
  return <>
    <WorkspaceHeader
      copy="Visualiza la estructura completa de la unidad y ubica tu puesto dentro del mapa operativo."
      eyebrow="Estructura"
      title="Organigrama"
    />
    <PersonalOrgSnapshot access={access} evaluations={evaluations} indicatorRecords={indicatorRecords} onSelectProfile={onSelectProfile} positions={positions} profiles={profiles} relationships={relationships} selectedUnit={selectedUnit} />
  </>;
}

function comparisonInterpretation({
  focusCondition,
  focusScore,
  indicatorCondition,
  indicatorScore,
}: {
  focusCondition?: FocusTrendCondition | OperationalCondition;
  focusScore?: number;
  indicatorCondition?: FocusTrendCondition;
  indicatorScore?: number;
}) {
  if (focusScore === undefined && indicatorScore === undefined) {
    return "Aún no hay suficientes registros para interpretar tu Focus contra una evaluación recibida.";
  }
  if (focusScore === undefined) {
    return "Ya existe una evaluación recibida, pero falta capturar Focus para contrastar desempeño personal contra lectura directiva.";
  }
  if (indicatorScore === undefined) {
    return "Tu Focus ya muestra una lectura propia; cuando recibas evaluación del responsable se podrá comparar contra ese criterio.";
  }
  const gap = Math.round((indicatorScore - focusScore) * 10) / 10;
  if (Math.abs(gap) <= 5) {
    return `La lectura está alineada: Focus y evaluación recibida se mueven casi al mismo nivel (${focusCondition ?? "sin condición"} vs ${indicatorCondition ?? "sin condición"}).`;
  }
  if (gap > 0) {
    return `La evaluación recibida está ${gap} puntos arriba de tu Focus; conviene revisar si tus actividades diarias ya están reflejando toda la producción que observa tu responsable.`;
  }
  return `Tu Focus está ${Math.abs(gap)} puntos arriba de la evaluación recibida; revisa comentarios del responsable para detectar qué evidencia o indicador no está cerrando igual.`;
}

function followupSummaryConclusion({
  evaluationCount,
  focusCondition,
  focusScore,
  indicatorScore,
  latestTrendDelta,
}: {
  evaluationCount: number;
  focusCondition?: FocusTrendCondition | OperationalCondition;
  focusScore?: number;
  indicatorScore?: number;
  latestTrendDelta?: number;
}) {
  if (!evaluationCount || focusScore === undefined) {
    return "Todavía no hay una línea de seguimiento suficiente. Captura tu Focus para crear la primera lectura y empezar a comparar tu avance.";
  }
  const conditionText = focusCondition ? ` en condición ${focusCondition}` : "";
  if (latestTrendDelta !== undefined && latestTrendDelta <= -10) {
    return `Tu última lectura está en ${focusScore}%${conditionText}, con una baja de ${Math.abs(latestTrendDelta)} puntos. Conviene revisar qué actividades quedaron abiertas y qué meta está perdiendo tracción.`;
  }
  if (latestTrendDelta !== undefined && latestTrendDelta >= 10) {
    return `Tu última lectura está en ${focusScore}%${conditionText}, con una mejora de ${latestTrendDelta} puntos. Mantén las acciones que están empujando la tendencia y documenta qué está funcionando.`;
  }
  if (indicatorScore !== undefined) {
    const gap = Math.round((indicatorScore - focusScore) * 10) / 10;
    if (Math.abs(gap) > 10) {
      return gap > 0
        ? `Tu evaluación recibida está por encima de tu Focus por ${gap} puntos. Puede haber producción visible para tu responsable que aún no está reflejada en tus actividades diarias.`
        : `Tu Focus está por encima de tu evaluación recibida por ${Math.abs(gap)} puntos. Revisa los comentarios de indicadores para alinear evidencia, alcance y cumplimiento.`;
    }
  }
  return `Tu lectura actual está en ${focusScore}%${conditionText}. La tendencia se mantiene cerca de la última referencia; usa los registros para sostener lo que funciona o corregir desvíos pequeños.`;
}

function PersonalFollowup({
  access,
  evaluations,
  focusSettings,
  indicatorRecords,
  positions,
  selectedUnit,
}: {
  access?: AccessContext;
  evaluations: Evaluation[];
  focusSettings: FocusSettings;
  indicatorRecords: WeeklyPositionIndicatorEvaluation[];
  positions: Position[];
  selectedUnit?: BusinessUnit;
}) {
  const [selectedReceivedDate, setSelectedReceivedDate] = useState("");
  const profileId = access?.profileId ?? "";
  const ownEvaluations = getCollaboratorEvaluations(evaluations)
    .filter((evaluation) => getEvaluationProfileKey(evaluation) === profileId)
    .sort((left, right) => left.date.localeCompare(right.date));
  const latest = ownEvaluations.at(-1);
  const latestTrend = profileId ? getIndividualTrendSeries(ownEvaluations, profileId, "week").at(-1) : undefined;
  const ownIndicatorRecords = indicatorRecords
    .filter((record) =>
      record.collaboratorProfileId === profileId
      && (!selectedUnit || record.businessUnitId === selectedUnit.id)
    )
    .sort((left, right) => left.weekStartDate.localeCompare(right.weekStartDate) || left.createdAt.localeCompare(right.createdAt));
  const receivedDateGroups = useMemo(() => {
    const groups = new Map<string, WeeklyPositionIndicatorEvaluation[]>();
    ownIndicatorRecords.forEach((record) => {
      const key = indicatorRecordDate(record).slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), record]);
    });
    return [...groups.entries()]
      .map(([dateKey, records]) => {
        const sorted = records.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
        const averageScore = Math.round(sorted.reduce((sum, record) => sum + record.weightedScore, 0) / sorted.length);
        return {
          averageScore,
          dateKey,
          label: formatDisplayDate(dateKey),
          latest: sorted.at(-1),
          records: sorted,
        };
      })
      .sort((left, right) => left.dateKey.localeCompare(right.dateKey));
  }, [ownIndicatorRecords]);
  const latestIndicatorGroup = receivedDateGroups.at(-1);
  const selectedIndicatorGroup = receivedDateGroups.find((group) => group.dateKey === selectedReceivedDate) ?? latestIndicatorGroup;
  const selectedIndicator = selectedIndicatorGroup?.latest;
  const position = access?.positionId ? positions.find((item) => item.id === access.positionId) : undefined;
  const focusScore = latest ? getEvaluationTrendScore(latest) : undefined;
  const focusCondition = latest?.focusDaily?.trendCondition ?? latest?.condition;
  const currentConditionForGuide = normalizeConditionForGuide(focusCondition);
  const indicatorScore = selectedIndicatorGroup?.averageScore;
  const scoreGap = focusScore !== undefined && indicatorScore !== undefined ? Math.round((indicatorScore - focusScore) * 10) / 10 : undefined;
  const interpretation = comparisonInterpretation({
    focusCondition,
    focusScore,
    indicatorCondition: selectedIndicator?.weeklyCondition,
    indicatorScore,
  });
  const summaryConclusion = followupSummaryConclusion({
    evaluationCount: ownEvaluations.length,
    focusCondition,
    focusScore,
    indicatorScore,
    latestTrendDelta: latestTrend?.delta,
  });

  return <div className="personal-followup">
    <section className="followup-summary-board personal-summary-board">
      <header>
        <div><p className="eyebrow">Mi seguimiento</p><h2>{access?.displayName}</h2></div>
        <p>{position?.name ?? "Perfil operativo"} · {selectedUnit?.name ?? "Unidad de negocio"}</p>
      </header>
      <div className="followup-summary-metrics">
        <article className="is-primary">
          <span>Condición actual</span>
          {focusCondition ? <div><strong>{getEvaluationTrendScore(latest!)}%</strong><ConditionBadge condition={focusCondition} /></div> : <strong className="pending-score">Sin captura</strong>}
          <small>{latest ? `Fecha ${focusEvaluationDateLabel(latest)}` : "Captura tu primer Focus para activar el seguimiento"}</small>
        </article>
        <article><span>Último avance</span><strong>{latest ? `${latest.finalScore}%` : "0%"}</strong><small>Focus Diario</small></article>
        <article><span>Registros</span><strong>{ownEvaluations.length}</strong><small>Capturas personales</small></article>
        <article><span>Tendencia semanal</span><strong>{latestTrend?.delta === undefined ? "Sin histórico" : `${latestTrend.delta > 0 ? "+" : ""}${latestTrend.delta} pts`}</strong><small>{latestTrend?.trend ?? "Primera línea base"}</small></article>
      </div>
      <p className="followup-summary-conclusion">{summaryConclusion}</p>
      <div className="personal-condition-guidance">
        <ConditionFormulaGuide condition={currentConditionForGuide} focusSettings={focusSettings} />
      </div>
    </section>

    <section className="panel personal-comparison-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">Comparativa de resultados</p><h2>Focus vs evaluación recibida</h2></div>
        <span className="count-badge">{ownIndicatorRecords.length} evaluaciones</span>
      </div>
      <div className="personal-result-comparison">
        <article>
          <span>Focus personal</span>
          <strong>{focusScore !== undefined ? `${focusScore}%` : "Sin captura"}</strong>
          {focusCondition ? <ConditionBadge condition={focusCondition} /> : null}
          <small>{latest ? `Fecha ${focusEvaluationDateLabel(latest)}` : "Sin registro Focus"}</small>
        </article>
        <article>
          <span>Evaluación directiva</span>
          <strong>{indicatorScore !== undefined ? `${indicatorScore}%` : "Sin evaluación"}</strong>
          {selectedIndicator ? <ConditionBadge condition={selectedIndicator.weeklyCondition} /> : null}
          <small>{selectedIndicatorGroup ? `Fecha ${selectedIndicatorGroup.label}${selectedIndicatorGroup.records.length > 1 ? ` · ${selectedIndicatorGroup.records.length} evaluaciones` : ""}` : "Pendiente de evaluación"}</small>
        </article>
        <article>
          <span>Diferencia</span>
          <strong>{scoreGap === undefined ? "Sin comparativa" : `${scoreGap > 0 ? "+" : ""}${scoreGap} pts`}</strong>
          <small>{scoreGap === undefined ? "Se activa con ambos resultados" : scoreGap === 0 ? "Resultados alineados" : scoreGap > 0 ? "Evaluación directiva por encima del Focus" : "Focus por encima de evaluación directiva"}</small>
        </article>
      </div>
      <p className="comparison-interpretation">{interpretation}</p>
    </section>

    <PerformanceChart evaluations={ownEvaluations} fixedProfileId={profileId} positions={positions} title="Mi tendencia Focus" units={selectedUnit ? [selectedUnit] : []} />

    <section className="panel condition-history-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">Evaluaciones recibidas</p><h2>Consultar por fecha</h2></div>
        <span className="count-badge">{receivedDateGroups.length} fechas</span>
      </div>
      {receivedDateGroups.length ? <div className="received-evaluation-list is-compact">
        <label className="received-date-picker">
          <span>Fecha</span>
          <select value={selectedIndicatorGroup?.dateKey ?? ""} onChange={(event) => setSelectedReceivedDate(event.target.value)}>
            {[...receivedDateGroups].reverse().map((group) => <option key={group.dateKey} value={group.dateKey}>{group.label}</option>)}
          </select>
        </label>
        {selectedIndicatorGroup && selectedIndicator ? <article>
          <header>
            <div><b>{selectedIndicatorGroup.label}</b><span>{selectedIndicatorGroup.records.length > 1 ? `${selectedIndicatorGroup.records.length} evaluaciones en esta fecha` : selectedIndicator.evaluatorName}</span></div>
            <strong>{selectedIndicatorGroup.averageScore}%</strong>
            <ConditionBadge condition={selectedIndicator.weeklyCondition} />
          </header>
          <details className="received-indicator-details">
            <summary>Ver indicadores de esta fecha</summary>
            <div className="received-record-stack">
              {[...selectedIndicatorGroup.records].reverse().map((record) => <section key={record.id}>
                <header><b>{record.evaluatorName}</b><span>{record.weightedScore}%</span></header>
                <div className="received-indicator-results">
                  {record.indicators.map((indicator) => <div key={`${record.id}-${indicator.indicatorId}`}>
                    <span>{indicator.indicatorName}</span>
                    <strong>{indicator.score}%</strong>
                    <small>{indicator.result || indicator.observations || "Sin observación"}</small>
                  </div>)}
                </div>
              </section>)}
            </div>
          </details>
        </article> : null}
      </div> : <div className="empty-state table-empty"><Icon name="clipboard" size={26} /><strong>Sin evaluaciones recibidas</strong><span>Cuando el director o el perfil maestro guarden una evaluación semanal de tu puesto, aparecerá aquí para compararla con tu Focus.</span></div>}
    </section>
  </div>;
}

function FollowupGoalsReadout({
  goalStore,
  positions,
  profiles,
  selectedUnit,
  visibleProfileIds,
}: {
  goalStore: ReturnType<typeof useOperationalGoals>;
  positions: Position[];
  profiles: CollaboratorProfile[];
  selectedUnit?: BusinessUnit;
  visibleProfileIds?: Set<string>;
}) {
  const today = todayIsoDate();
  const positionById = useMemo(() => new Map(positions.map((position) => [position.id, position])), [positions]);
  const activeGoals = goalStore.goals.filter((goal) =>
    goal.status === "active"
    && goal.businessUnitId === selectedUnit?.id
    && goal.scope === "profile"
    && goalIsActiveOnDate(goal, today)
  );
  const rows = profiles
    .filter((profile) =>
      profile.status === "active"
      && profile.businessUnitId === selectedUnit?.id
      && (!visibleProfileIds || visibleProfileIds.has(profile.id))
    )
    .map((profile) => {
      const position = positionById.get(profile.positionId);
      const goals = activeGoals
        .filter((goal) => goal.targetProfileId === profile.id)
        .sort((left, right) =>
          (left.unitIndicatorName ?? left.goalLabel).localeCompare(right.unitIndicatorName ?? right.goalLabel, "es-MX")
        );
      return { goals, position, profile };
    })
    .sort((left, right) =>
      (left.position?.name ?? left.profile.name).localeCompare(right.position?.name ?? right.profile.name, "es-MX")
    );
  const profilesWithGoals = rows.filter((row) => row.goals.length).length;

  return <details className="panel followup-readout-panel">
    <summary>
      <div>
        <p className="eyebrow">Metas vigentes</p>
        <h2>Metas de la unidad</h2>
      </div>
      <span className="count-badge">{profilesWithGoals}/{rows.length} con meta</span>
      <strong>Ver tabla</strong>
    </summary>
    <div className="followup-readout-table">
      <div className="followup-readout-head">
        <span>Puesto</span>
        <span>Metas asignadas</span>
      </div>
      {rows.length ? rows.map(({ goals, position, profile }) => <article className="followup-readout-row" key={profile.id}>
        <div className="followup-readout-person">
          <b>{position?.name ?? profile.name}</b>
          <span>{profile.name}</span>
        </div>
        <div className="followup-readout-goals">
          {goals.length ? goals.map((goal) => <div className="followup-readout-goal" key={goal.id}>
            <b>{goal.unitIndicatorName ?? goal.goalLabel}</b>
            <span>{formatGoalCadence(goal.cadence ?? "week")} · {formatGoalAmount(goal.targetValue, goal.valueKind ?? "percentage")}</span>
          </div>) : <span className="readout-empty-pill">Sin capturar</span>}
        </div>
      </article>) : <div className="empty-state table-empty"><Icon name="people" size={24} /><strong>Sin perfiles visibles</strong><span>Cuando existan puestos activos en esta unidad, aparecerán aquí sus metas vigentes.</span></div>}
    </div>
  </details>;
}

function FollowupWorkspace({
  access,
  evaluations,
  goalStore,
  indicatorRecords,
  positions,
  profiles,
  relationships,
  selectedProfileId,
  onSelectedProfileChange,
  selectedUnitId,
  setSelectedUnitId,
  units,
  focusSettings,
}: {
  access?: AccessContext;
  evaluations: Evaluation[];
  goalStore: ReturnType<typeof useOperationalGoals>;
  indicatorRecords: WeeklyPositionIndicatorEvaluation[];
  positions: Position[];
  profiles: CollaboratorProfile[];
  relationships: FocusHierarchyRelationship[];
  selectedProfileId: string;
  onSelectedProfileChange: (profileId: string) => void;
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  units: BusinessUnit[];
  focusSettings: FocusSettings;
}) {
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
  const canSeeTeam = canSeeTeamAccess(access);
  const peopleProfileIds = useMemo(() => {
    if (!access || access.mode === "master") return undefined;
    if (!canSeeTeamAccess(access)) return new Set(access.profileId ? [access.profileId] : []);
    return new Set(getManagedProfileIds(access.profileId, access.businessUnitId, profiles, positions, relationships));
  }, [access, positions, profiles, relationships]);
  const peopleEvaluations = evaluations.filter((item) =>
    item.businessUnitId === selectedUnitId
    && (!peopleProfileIds || peopleProfileIds.has(getEvaluationProfileKey(item)))
  );
  const trendProfileOptions = useMemo(() => {
    if (!selectedUnit) return [];
    const allowed = peopleProfileIds;
    return profiles
      .filter((profile) =>
        profile.businessUnitId === selectedUnit.id
        && profile.status === "active"
        && (!allowed || allowed.has(profile.id))
      )
      .map((profile) => ({
        id: profile.id,
        name: profile.name,
        positionName: positions.find((position) => position.id === profile.positionId)?.name ?? "Puesto",
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es-MX") || left.positionName.localeCompare(right.positionName, "es-MX"));
  }, [peopleProfileIds, positions, profiles, selectedUnit]);
  const selectedTrendProfileId = trendProfileOptions.some((profile) => profile.id === selectedProfileId)
    ? selectedProfileId
    : trendProfileOptions[0]?.id ?? "";

  useEffect(() => {
    if (!canSeeTeam) return;
    if (selectedTrendProfileId && selectedTrendProfileId !== selectedProfileId) {
      onSelectedProfileChange(selectedTrendProfileId);
    }
  }, [canSeeTeam, onSelectedProfileChange, selectedProfileId, selectedTrendProfileId]);

  if (!canSeeTeam) {
    return <>
      <WorkspaceHeader
        copy="Consulta tu condición actual, tu historial y la tendencia de tus cortes Focus."
        eyebrow="Control personal"
        title="Seguimiento"
      />
      <PersonalFollowup access={access} evaluations={evaluations} focusSettings={focusSettings} indicatorRecords={indicatorRecords} positions={positions} selectedUnit={selectedUnit} />
    </>;
  }

  return <>
    <WorkspaceHeader
      action={access?.mode === "master" ? <UnitSelector selectedUnitId={selectedUnitId} setSelectedUnitId={setSelectedUnitId} units={units} /> : undefined}
      copy="Asigna metas, revisa el cumplimiento y selecciona un perfil para ver su tendencia sin ruido adicional."
      eyebrow="Control"
      title="Seguimiento"
    />
    <div className="workspace-tab-content followup-clean-layout">
      <FollowupGoalsReadout goalStore={goalStore} positions={positions} profiles={profiles} selectedUnit={selectedUnit} visibleProfileIds={peopleProfileIds} />
      {selectedTrendProfileId
        ? <PerformanceChart evaluations={peopleEvaluations} fixedProfileId={selectedTrendProfileId} fixedProfileOptions={trendProfileOptions} includeAllOperationalLevels onFixedProfileChange={onSelectedProfileChange} positions={positions} title="Gráfica del colaborador" units={selectedUnit ? [selectedUnit] : units} />
        : <section className="panel empty-state"><Icon name="people" size={26} /><strong>Sin perfiles visibles</strong><span>Cuando exista un perfil activo en esta unidad, podrás ver aquí su tendencia.</span></section>}
    </div>
  </>;
}

function RecordsWorkspace({
  access,
  catalog,
  documentStore,
  evaluations,
  indicatorRecords,
  profiles,
  relationships,
  selectedUnitId,
}: {
  access?: AccessContext;
  catalog: ReturnType<typeof useCatalog>;
  documentStore: ReturnType<typeof useDocumentRegistry>;
  evaluations: Evaluation[];
  indicatorRecords: WeeklyPositionIndicatorEvaluation[];
  profiles: CollaboratorProfile[];
  relationships: FocusHierarchyRelationship[];
  selectedUnitId: string;
}) {
  const [tab, setTab] = useState<RecordsTab>("history");
  const visibleProfileIds = useMemo(() => getVisibleProfileIdsForAccess(access, profiles, catalog.positions, relationships), [access, catalog.positions, profiles, relationships]);
  const visibleProfileSet = visibleProfileIds ? new Set(visibleProfileIds) : undefined;
  const visiblePositionIds = useMemo(() => getPositionIdsForProfiles(visibleProfileIds, profiles), [profiles, visibleProfileIds]);
  const visiblePositionSet = visiblePositionIds ? new Set(visiblePositionIds) : undefined;
  const visibleEvaluations = useMemo(() => evaluations.filter((evaluation) =>
    !visibleProfileSet || visibleProfileSet.has(getEvaluationProfileKey(evaluation))
  ), [evaluations, visibleProfileSet]);
  const visibleEvaluationIds = useMemo(() => new Set(visibleEvaluations.map((evaluation) => evaluation.id)), [visibleEvaluations]);
  const visibleDocuments = useMemo(() => documentStore.documents.filter((document) => {
    if (!visibleProfileSet) return true;
    const documentProfileId = document.values?.collaboratorProfileId;
    return Boolean(
      (documentProfileId && visibleProfileSet.has(documentProfileId))
      || (document.linkedEvaluationId && visibleEvaluationIds.has(document.linkedEvaluationId))
      || (document.positionId && visiblePositionSet?.has(document.positionId))
    );
  }), [documentStore.documents, visibleEvaluationIds, visiblePositionSet, visibleProfileSet]);
  const visibleIndicatorRecords = useMemo(() => indicatorRecords.filter((record) =>
    !visibleProfileSet || visibleProfileSet.has(record.collaboratorProfileId)
  ), [indicatorRecords, visibleProfileSet]);
  const canEditRecords = access?.mode === "master";
  return <>
    <WorkspaceHeader
      copy="El historial concentra lo que ya ocurrió. Los formatos se imprimen en blanco como respaldo para evaluaciones manuales con trazabilidad por folio."
      eyebrow="Consulta"
      title="Registros y documentos"
    />
    <WorkspaceTabs active={tab} onChange={setTab} tabs={[
      { id: "history", label: "Historial", helper: "Evaluaciones y expedientes", icon: "archive" },
      { id: "formats", label: "Formatos", helper: "Previsualizar e imprimir", icon: "printer" },
    ]} />
    <div className="workspace-tab-content">
      {tab === "history"
        ? <EvaluationTable canEditDocuments={canEditRecords} documents={visibleDocuments} evaluations={visibleEvaluations} indicatorRecords={visibleIndicatorRecords} operationFormats={catalog.operationFormats} positions={catalog.positions} profiles={profiles} units={catalog.units} updateDocument={documentStore.updateDocument} />
        : <FocusPrintableForm allowedPositionIds={visiblePositionIds} createDocument={documentStore.createDocument} positions={catalog.positions} selectedUnitId={selectedUnitId} units={catalog.units} />}
    </div>
  </>;
}

function App() {
  const catalog = useCatalog();
  const evaluationStore = useEvaluations(catalog.positions, catalog.units);
  const collaboratorProfileStore = useCollaboratorProfiles(evaluationStore.evaluations, catalog.positions);
  const unitReviewStore = useUnitConditionReviews();
  const documentStore = useDocumentRegistry();
  const focusSettingsStore = useFocusSettings();
  const focusRelationshipStore = useFocusRelationships();
  const operationalGoalStore = useOperationalGoals();
  const positionIndicatorStore = usePositionIndicators();
  const [access, setAccess] = useState<AccessContext | undefined>(() => loadAccessSession() ?? (sessionStorage.getItem(LEGACY_AUTH_KEY) === "true" ? masterAccess() : undefined));
  const [view, setView] = useState<View>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitIdState] = useState(() => loadAccessSession()?.businessUnitId ?? FUNDACION_DANTE_UNIT_ID);
  const [selectedFollowupProfileId, setSelectedFollowupProfileId] = useState("");
  const visibleNavGroups = useMemo(() => filterNavGroupsForAccess(access), [access]);
  const visibleNavItems = useMemo(() => visibleNavGroups.flatMap((group) => group.items), [visibleNavGroups]);
  const allowedViews = useMemo(() => new Set(accessAllowedViews(access)), [access]);
  const currentTitle = useMemo(() => visibleNavItems.find((item) => item.id === view)?.label ?? "Inicio", [view, visibleNavItems]);
  const selectedUnit = catalog.units.find((unit) => unit.id === selectedUnitId);
  const activeProfile = access?.mode === "profile" ? collaboratorProfileStore.profiles.find((profile) => profile.id === access.profileId) : undefined;
  const managedProfileIds = useMemo(() => {
    if (!access || access.mode === "master") return undefined;
    return getManagedProfileIds(access.profileId, access.businessUnitId, collaboratorProfileStore.profiles, catalog.positions, focusRelationshipStore.relationships)
      .filter((profileId) => profileId !== access.profileId);
  }, [access, catalog.positions, collaboratorProfileStore.profiles, focusRelationshipStore.relationships]);

  useEffect(() => {
    if (!access) return;
    setSelectedUnitIdState(access.businessUnitId);
    if (!allowedViews.has(view)) {
      setView(accessAllowedViews(access)[0] ?? "home");
    }
  }, [access, allowedViews, view]);

  function goTo(next: View) {
    if (!allowedViews.has(next)) return;
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setSelectedUnitId(value: string) {
    if (access?.mode === "profile") return;
    setSelectedUnitIdState(value);
    setSelectedFollowupProfileId("");
  }

  function openFollowupProfile(profileId: string) {
    if (!profileId) return;
    if (!canSeeTeamAccess(access) && access?.profileId !== profileId) return;
    setSelectedFollowupProfileId(profileId);
    goTo("followup");
  }

  function logout() {
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
    sessionStorage.removeItem(LEGACY_AUTH_KEY);
    setAccess(undefined);
    setView("home");
  }

  function evaluationDocumentValues(draft: EvaluationDraft, saved?: Evaluation) {
    return {
      collaboratorProfileId: saved?.collaboratorProfileId ?? draft.collaboratorProfileId ?? "",
      evaluatedPersonName: draft.evaluatedPersonName,
      evaluatorName: draft.evaluatorName,
      date: draft.date,
      period: draft.period,
      week: draft.week,
      month: draft.month,
      season: draft.season,
      subjectType: "Colaborador",
      productDefinition: draft.productDefinition,
      statistics: saved?.statistics?.map((item) => `${item.name}: ${item.currentSelection || `${item.currentValue} ${item.measurementUnit}`} (${item.targetAttainment}%)`).join(" | ") ?? "",
      activityGoals: saved?.statistics?.map((item) => item.goalLabel ? `${item.name}: ${item.goalLabel} (${item.goalTargetValue ?? 100}%)` : `${item.name}: sin meta`).join(" | ") ?? "",
      finalScore: saved ? String(saved.finalScore) : "",
      condition: saved?.condition ?? "",
      focusDailyTotalActivities: saved?.focusDaily ? String(saved.focusDaily.totalActivities) : "",
      focusDailyCompletedActivities: saved?.focusDaily ? String(saved.focusDaily.completedActivities) : "",
      focusDailyInProgressActivities: saved?.focusDaily ? String(saved.focusDaily.inProgressActivities) : "",
      focusDailyPendingActivities: saved?.focusDaily ? String(saved.focusDaily.pendingActivities) : "",
      focusDailyBlockedActivities: saved?.focusDaily ? String(saved.focusDaily.blockedActivities) : "",
      focusDailyGeneralStatus: saved?.focusDaily?.generalStatus ?? "",
      focusDailyTrendCondition: saved?.focusDaily?.trendCondition ?? "",
      problemStatement: draft.problemStatement,
      dataAnalysis: draft.dataAnalysis,
      solutionPlan: draft.solutionPlan,
      nextTarget: String(draft.nextTarget),
      observations: draft.observations,
      followUpDate: draft.followUpDate,
    };
  }

  function createEvaluationDocumentInput(draft: EvaluationDraft, saved: Evaluation, folio?: string) {
    const unit = catalog.units.find((item) => item.id === draft.businessUnitId);
    const position = catalog.positions.find((item) => item.id === draft.positionId);
    return {
      folio,
      type: "evaluation" as const,
      status: "digital" as const,
      businessUnitId: draft.businessUnitId,
      businessUnitName: unit?.name ?? draft.businessUnitId,
      positionId: saved.positionId,
      positionName: position?.name ?? saved.positionName,
      formatId: draft.physicalFormatId,
      formatCode: draft.physicalFormatCode,
      formatTitle: draft.physicalFormatTitle || "Evaluación de producto y condición",
      linkedEvaluationId: saved.id,
      values: evaluationDocumentValues(draft, saved),
    };
  }

  function submitEvaluationWithDocument(draft: EvaluationDraft) {
    const requestedFolio = normalizeDocumentFolio(draft.documentFolio ?? "");
    if (draft.captureSource === "Físico") {
      if (!requestedFolio) throw new Error("Captura el folio del formato impreso para guardar esta evaluación física.");
      const printedDocument = documentStore.getDocument(requestedFolio);
      if (!printedDocument) throw new Error(`No existe un documento impreso con folio ${requestedFolio}.`);
      if (printedDocument.type !== "evaluation") throw new Error(`El folio ${requestedFolio} pertenece a un formato operativo, no a una evaluación.`);
      if (printedDocument.formatId && draft.physicalFormatId && printedDocument.formatId !== draft.physicalFormatId) throw new Error(`El folio ${requestedFolio} no coincide con el formato seleccionado.`);
      const profile = collaboratorProfileStore.resolveProfile({
        id: draft.collaboratorProfileId,
        businessUnitId: draft.businessUnitId,
        positionId: draft.positionId,
        name: draft.evaluatedPersonName,
      });
      const linkedDraft = { ...draft, collaboratorProfileId: profile.id, evaluatedPersonName: profile.name, evaluatorName: profile.name, documentFolio: requestedFolio };
      const saved = evaluationStore.addEvaluation(linkedDraft);
      documentStore.updateDocument(requestedFolio, {
        status: "printed-digital",
        digitalCapturedAt: new Date().toISOString(),
        linkedEvaluationId: saved.id,
        values: evaluationDocumentValues(linkedDraft, saved),
      });
      return saved;
    }

    const nextFolio = getNextDocumentFolio("evaluation", documentStore.documents);
    const profile = collaboratorProfileStore.resolveProfile({
      id: draft.collaboratorProfileId,
      businessUnitId: draft.businessUnitId,
      positionId: draft.positionId,
      name: draft.evaluatedPersonName,
    });
    const linkedDraft = { ...draft, collaboratorProfileId: profile.id, evaluatedPersonName: profile.name, evaluatorName: profile.name, documentFolio: nextFolio };
    const saved = evaluationStore.addEvaluation(linkedDraft);
    documentStore.createDocument(createEvaluationDocumentInput(linkedDraft, saved, nextFolio));
    return saved;
  }

  function resetEvaluationPeriod(request: EvaluationResetRequest): EvaluationResetResult {
    const removed = evaluationStore.resetEvaluations(request);
    const evaluationIds = removed.map((evaluation) => evaluation.id);
    const documents = documentStore.removeDocumentsByReset(request, evaluationIds);
    const indicatorRecords = positionIndicatorStore.removeRecordsByReset(request);
    const goals = operationalGoalStore.removeGoalsByReset(request);
    const reviews = unitReviewStore.removeReviewsByReset(request, evaluationIds);
    return {
      evaluations: removed.length,
      documents,
      goals,
      indicatorRecords,
      reviews,
      total: removed.length + documents + indicatorRecords + goals + reviews,
    };
  }

  if (!access) return <LoginScreen onLogin={(nextAccess) => { setAccess(nextAccess); setSelectedUnitIdState(nextAccess.businessUnitId); }} positions={catalog.positions} profiles={collaboratorProfileStore.profiles} units={catalog.units} />;

  return <div className="app-shell app-shell-redesign">
    <aside className={`sidebar redesigned-sidebar ${menuOpen ? "is-open" : ""}`}>
      <div className="brand-block"><img className="brand-logo" src={axenLogoDark} alt="Axen Capital" /><span>Control de operación</span></div>
      <nav>{visibleNavGroups.map((group) => <section className="nav-group" key={group.label}>
        <span className="nav-group-label">{group.label}</span>
        {group.items.map((item) => <button className={view === item.id ? "active" : ""} key={item.id} onClick={() => goTo(item.id)} type="button">
          <Icon name={item.icon} size={17} />
          <span><b>{item.label}</b><small>{item.helper}</small></span>
        </button>)}
      </section>)}</nav>
      <div className="sidebar-context">
        <ProfilePhotoControl onPhotoChange={collaboratorProfileStore.updateProfilePhoto} profile={activeProfile} />
        <span>{labelForAccess(access, catalog.positions)}</span>
        <strong>{access.displayName}</strong>
        <small>{selectedUnit?.name ?? "Sin unidad"}</small>
      </div>
      <div className="sidebar-footer"><Icon name="shield" size={16} /><span>{access.role}<br /><button className="logout-button" onClick={logout} type="button">Cerrar sesión</button></span></div>
    </aside>
    {menuOpen && <button aria-label="Cerrar menú" className="sidebar-scrim" onClick={() => setMenuOpen(false)} type="button" />}
    <main className="main-content redesigned-content">
      <header className="topbar redesigned-topbar">
        <button aria-label="Abrir menú" className="mobile-menu" onClick={() => setMenuOpen(true)} type="button"><Icon name="menu" size={22} /></button>
        <div><span>Axen Capital · Control de operación</span><b>{currentTitle}</b></div>
        <div className="topbar-context"><Icon name="grid" size={14} /><span>{access.displayName}</span></div>
      </header>
      <div className="content-wrap">
        {view === "home" && <GeneralHome access={access} evaluations={evaluationStore.evaluations} focusSettings={focusSettingsStore.settings} onOpenView={goTo} positions={catalog.positions} selectedUnitId={selectedUnitId} setSelectedUnitId={setSelectedUnitId} units={catalog.units} />}
        {view === "evaluate" && <EvaluateWorkspace access={access} evaluations={evaluationStore.evaluations} focusSettings={focusSettingsStore.settings} goalAssignments={operationalGoalStore.goals} onSubmitEvaluation={submitEvaluationWithDocument} positions={catalog.positions} profiles={collaboratorProfileStore.profiles} selectedUnitId={selectedUnitId} setSelectedUnitId={setSelectedUnitId} units={catalog.units} />}
        {view === "indicators" && <IndicatorsWorkspace access={access} allowedProfileIds={managedProfileIds} goalStore={operationalGoalStore} indicatorStore={positionIndicatorStore} positions={catalog.positions} profiles={collaboratorProfileStore.profiles} relationships={focusRelationshipStore.relationships} selectedUnitId={selectedUnitId} setSelectedUnitId={setSelectedUnitId} units={catalog.units} />}
        {view === "followup" && <FollowupWorkspace access={access} evaluations={evaluationStore.evaluations} focusSettings={focusSettingsStore.settings} goalStore={operationalGoalStore} indicatorRecords={positionIndicatorStore.records} onSelectedProfileChange={setSelectedFollowupProfileId} positions={catalog.positions} profiles={collaboratorProfileStore.profiles} relationships={focusRelationshipStore.relationships} selectedProfileId={selectedFollowupProfileId} selectedUnitId={selectedUnitId} setSelectedUnitId={setSelectedUnitId} units={catalog.units} />}
        {view === "orgchart" && <OrgChartWorkspace access={access} evaluations={evaluationStore.evaluations} indicatorRecords={positionIndicatorStore.records} onSelectProfile={openFollowupProfile} positions={catalog.positions} profiles={collaboratorProfileStore.profiles} relationships={focusRelationshipStore.relationships} selectedUnitId={selectedUnitId} units={catalog.units} />}
        {view === "records" && <RecordsWorkspace access={access} catalog={catalog} documentStore={documentStore} evaluations={evaluationStore.evaluations} indicatorRecords={positionIndicatorStore.records} profiles={collaboratorProfileStore.profiles} relationships={focusRelationshipStore.relationships} selectedUnitId={selectedUnitId} />}
        {view === "admin" && <>
          <WorkspaceHeader copy="Modifica unidades, puestos, productos e indicadores que alimentan todo el proceso de evaluación." eyebrow="Sistema" title="Administración" />
          <CatalogAdmin addPosition={catalog.addPosition} addUnit={catalog.addUnit} positions={catalog.positions} restoreCatalog={catalog.restoreCatalog} units={catalog.units} updatePosition={catalog.updatePosition} updateUnit={catalog.updateUnit} />
          <FocusRelationshipAdmin deactivateRelationship={focusRelationshipStore.deactivateRelationship} deleteRelationship={focusRelationshipStore.deleteRelationship} positions={catalog.positions} profiles={collaboratorProfileStore.profiles} relationships={focusRelationshipStore.relationships} units={catalog.units} upsertRelationship={focusRelationshipStore.upsertRelationship} />
          <FocusSettingsAdmin onRestore={focusSettingsStore.restoreSettings} onSave={focusSettingsStore.saveSettings} settings={focusSettingsStore.settings} />
          <EvaluationResetPanel documents={documentStore.documents} evaluations={evaluationStore.evaluations} goals={operationalGoalStore.goals} indicatorRecords={positionIndicatorStore.records} initialUnitId={selectedUnitId} onReset={resetEvaluationPeriod} reviews={unitReviewStore.reviews} units={catalog.units} />
        </>}
      </div>
    </main>
  </div>;
}

export default App;

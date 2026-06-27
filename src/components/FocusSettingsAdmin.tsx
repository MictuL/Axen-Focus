import { useState } from "react";
import { DEFAULT_FOCUS_SETTINGS, normalizeFocusConfiguration } from "../lib/focusDaily";
import type { FocusSettings } from "../types";
import { Icon } from "./Icon";

export function FocusSettingsAdmin({
  settings,
  onSave,
  onRestore,
}: {
  settings: FocusSettings;
  onSave: (settings: FocusSettings) => void;
  onRestore: () => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [notice, setNotice] = useState("");

  function updateConfiguration(key: keyof FocusSettings["configuration"], value: string) {
    setNotice("");
    const parsed = Math.max(0, Number(value) || 0);
    const nextValue = key === "fallThreshold"
      ? DEFAULT_FOCUS_SETTINGS.configuration.fallThreshold
      : key === "riseThreshold"
        ? Math.max(DEFAULT_FOCUS_SETTINGS.configuration.riseThreshold, parsed)
        : parsed;
    setDraft((current) => ({
      ...current,
      configuration: { ...current.configuration, [key]: nextValue },
    }));
  }

  function updateFormula(index: number, value: string) {
    setNotice("");
    setDraft((current) => ({
      ...current,
      formulas: current.formulas.map((formula, formulaIndex) => formulaIndex === index
        ? { ...formula, steps: value.split("\n").map((step) => step.trim()).filter(Boolean), updatedAt: new Date().toISOString() }
        : formula),
    }));
  }

  function save() {
    const normalized = { ...draft, configuration: normalizeFocusConfiguration(draft.configuration) };
    setDraft(normalized);
    onSave(normalized);
    setNotice("Configuración FOCUS actualizada.");
  }

  function restore() {
    onRestore();
    setDraft(DEFAULT_FOCUS_SETTINGS);
    setNotice("Valores FOCUS restaurados.");
  }

  return <section className="panel focus-admin">
    <div className="panel-heading">
      <div>
        <p className="eyebrow">Metodología FOCUS</p>
        <h2>Tendencia semanal y fórmulas</h2>
        <p className="focus-admin-copy">La condición se determina únicamente al comparar la tendencia semanal. El porcentaje diario permanece como estadística operativa.</p>
      </div>
      <button className="secondary-button" onClick={restore} type="button"><Icon name="refresh" size={16} /> Restaurar valores</button>
    </div>

    <div className="focus-config-grid">
      <label><span>Subida pronunciada</span><input min={DEFAULT_FOCUS_SETTINGS.configuration.riseThreshold} type="number" value={draft.configuration.riseThreshold} onChange={(event) => updateConfiguration("riseThreshold", event.target.value)} /></label>
      <label><span>Caída fuerte</span><input max={DEFAULT_FOCUS_SETTINGS.configuration.fallThreshold} min={DEFAULT_FOCUS_SETTINGS.configuration.fallThreshold} type="number" value={draft.configuration.fallThreshold} onChange={(event) => updateConfiguration("fallThreshold", event.target.value)} /></label>
      <label><span>Tolerancia de estabilidad</span><input min="0" type="number" value={draft.configuration.flatTolerance} onChange={(event) => updateConfiguration("flatTolerance", event.target.value)} /></label>
      <label><span>Periodos para estancamiento</span><input min="2" type="number" value={draft.configuration.prolongedFlatPeriods} onChange={(event) => updateConfiguration("prolongedFlatPeriods", event.target.value)} /></label>
      <label><span>FOCUS mínimos por semana</span><input min="1" type="number" value={draft.configuration.minimumWeeklyEntries} onChange={(event) => updateConfiguration("minimumWeeklyEntries", event.target.value)} /></label>
      <label><span>Semanas mínimas para Poder</span><input min="2" type="number" value={draft.configuration.powerMinimumWeeks} onChange={(event) => updateConfiguration("powerMinimumWeeks", event.target.value)} /></label>
      <label><span>Meses sostenidos para Poder</span><input min="1" type="number" value={draft.configuration.powerMinimumMonths} onChange={(event) => updateConfiguration("powerMinimumMonths", event.target.value)} /></label>
    </div>

    <div className="focus-formula-grid">
      {draft.formulas.map((formula, index) => <label className={`focus-formula-editor condition-${formula.condition.toLocaleLowerCase("es-MX")}`} key={formula.condition}>
        <span>{formula.condition}</span>
        <small>Un paso por renglón. El primero prellena la siguiente acción del registro diario.</small>
        <textarea rows={Math.max(4, formula.steps.length)} value={formula.steps.join("\n")} onChange={(event) => updateFormula(index, event.target.value)} />
      </label>)}
    </div>

    {notice ? <p className="admin-notice">{notice}</p> : null}
    <div className="focus-admin-actions">
      <button className="primary-button" onClick={save} type="button"><Icon name="check" size={16} /> Guardar metodología FOCUS</button>
    </div>
  </section>;
}

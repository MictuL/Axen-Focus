import { useMemo, useState } from "react";
import axenLogo from "../assets/axen-capital-logo.png";
import {
  FOCUS_DAILY_COLUMN_INDEX,
  FOCUS_DAILY_COLUMNS,
  FOCUS_DAILY_ROW_COUNT_KEY,
  FOCUS_DAILY_TABLE_TITLE,
  focusDailyTableKey,
} from "../lib/focusDaily";
import { getOperationalLevel } from "../lib/catalog";
import type { BusinessUnit, DocumentRecord, DocumentRecordInput, Position } from "../types";
import { Icon } from "./Icon";

type FocusPrintableFormProps = {
  allowedPositionIds?: string[];
  createDocument: (input: DocumentRecordInput) => DocumentRecord;
  positions: Position[];
  selectedUnitId: string;
  units: BusinessUnit[];
};

const FOCUS_PRINT_ROWS = 10;

function blankFocusValues(unit: BusinessUnit | undefined, position: Position | undefined) {
  const values: Record<string, string> = {
    businessUnit: unit?.name ?? "",
    position: position?.name ?? "",
    format: "Focus Diario",
    frequency: "Diario",
    [FOCUS_DAILY_ROW_COUNT_KEY]: String(FOCUS_PRINT_ROWS),
  };
  Array.from({ length: FOCUS_PRINT_ROWS }).forEach((_, rowIndex) => {
    FOCUS_DAILY_COLUMNS.forEach((_, columnIndex) => {
      if (columnIndex === FOCUS_DAILY_COLUMN_INDEX.rowNumber) return;
      values[focusDailyTableKey(rowIndex, columnIndex)] = "";
    });
  });
  return values;
}

export function FocusPrintableForm({ allowedPositionIds, createDocument, positions, selectedUnitId, units }: FocusPrintableFormProps) {
  const allowedSet = allowedPositionIds ? new Set(allowedPositionIds) : undefined;
  const availablePositions = useMemo(() => positions
    .filter((position) => position.status === "active")
    .filter((position) => !allowedSet || allowedSet.has(position.id))
    .sort((left, right) => left.businessUnitId.localeCompare(right.businessUnitId, "es-MX") || left.name.localeCompare(right.name, "es-MX")),
  [allowedSet, positions]);
  const initialPosition = availablePositions.find((position) => position.businessUnitId === selectedUnitId) ?? availablePositions[0];
  const [positionId, setPositionId] = useState(initialPosition?.id ?? "");
  const [lastFolio, setLastFolio] = useState("");
  const position = availablePositions.find((item) => item.id === positionId) ?? availablePositions[0];
  const unit = units.find((item) => item.id === position?.businessUnitId) ?? units.find((item) => item.id === selectedUnitId);
  const positionsByUnit = units
    .filter((candidate) => availablePositions.some((positionItem) => positionItem.businessUnitId === candidate.id))
    .map((candidate) => ({
      unit: candidate,
      positions: availablePositions.filter((positionItem) => positionItem.businessUnitId === candidate.id),
    }));

  function printFocus() {
    if (!unit || !position) return;
    const record = createDocument({
      type: "operation",
      status: "printed",
      businessUnitId: unit.id,
      businessUnitName: unit.name,
      positionId: position.id,
      positionName: position.name,
      formatId: `focus-print::${position.id}`,
      formatCode: "OP",
      formatTitle: `Focus Diario · ${position.name}`,
      values: blankFocusValues(unit, position),
    });
    setLastFolio(record.folio);
    window.setTimeout(() => window.print(), 80);
  }

  return <div className="focus-print-layout">
    <section className="panel focus-print-control no-print">
      <div>
        <p className="eyebrow">Formato imprimible</p>
        <h2>Focus Diario</h2>
        <p>Imprime el respaldo manual en blanco. Cada impresión genera un folio y queda registrada en el historial documental.</p>
      </div>
      <label><span>Puesto</span><select value={position?.id ?? ""} onChange={(event) => { setPositionId(event.target.value); setLastFolio(""); }}>
        {positionsByUnit.map((group) => <optgroup key={group.unit.id} label={group.unit.name}>
          {group.positions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </optgroup>)}
      </select></label>
      <div className="focus-print-meta">
        <div><span>Unidad</span><strong>{unit?.name ?? "Sin unidad"}</strong></div>
        <div><span>Nivel</span><strong>{position ? getOperationalLevel(position) : "Sin puesto"}</strong></div>
        <div><span>Actividades</span><strong>{FOCUS_PRINT_ROWS}</strong></div>
      </div>
      {lastFolio ? <p className="document-notice"><Icon name="check" size={14} /> {lastFolio} registrado para impresión.</p> : null}
      <button className="primary-button" disabled={!position} onClick={printFocus} type="button"><Icon name="printer" size={16} /> Imprimir Focus</button>
    </section>

    <article className="focus-print-sheet print-sheet" aria-label="Formato Focus Diario imprimible">
      <header className="print-header">
        <img className="print-logo" src={axenLogo} alt="Axen Capital" />
        <div><p>Axen Capital · {unit?.name}</p><h2>Focus Diario</h2><p>{position?.name}</p></div>
        <span>{lastFolio || "OP_____26"}</span>
      </header>

      <div className="focus-print-fields">
        <label><b>Fecha</b><span /></label>
        <label><b>Colaborador</b><span /></label>
        <label><b>Puesto</b><span>{position?.name}</span></label>
      </div>

      <section className="focus-print-product">
        <b>Producto diario terminado</b>
        <p />
      </section>

      <section className="focus-print-table-section">
        <div className="operation-block-heading">
          <h3>{FOCUS_DAILY_TABLE_TITLE}</h3>
          <span>Marca estado, prioridad, deadline, avance y motivo si no se completa.</span>
        </div>
        <table className="focus-print-table">
          <thead><tr>{FOCUS_DAILY_COLUMNS.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{Array.from({ length: FOCUS_PRINT_ROWS }).map((_, rowIndex) => <tr key={rowIndex}>
            <td>{String(rowIndex + 1).padStart(2, "0")}</td>
            <td className="activity-cell" />
            <td className="choice-cell">□ No iniciado<br />□ En proceso<br />□ Completado</td>
            <td className="choice-cell">□ Crítica<br />□ Alta<br />□ Media<br />□ Baja</td>
            <td />
            <td className="choice-cell">□ Rojo<br />□ Amarillo<br />□ Verde</td>
            <td>_____%</td>
            <td className="reason-cell" />
          </tr>)}</tbody>
        </table>
      </section>

      <section className="focus-print-summary">
        <div><b>Cumplimiento diario</b><span>______%</span></div>
        <div><b>Semáforo general</b><span>□ Rojo □ Amarillo □ Verde</span></div>
        <div><b>Condición resultante</b><span>________________________</span></div>
      </section>

      <footer className="print-footer">Focus Diario manual · Axen Capital · Documento en blanco para captura física</footer>
    </article>
  </div>;
}

import type { BusinessUnit, OperationFormatSet, OperationTemplate } from "../types";

const emptyCell = "&nbsp;";

function escapeHtml(value: string | undefined) {
  return (value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char] ?? char);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function assetToDataUrl(src: string) {
  const response = await fetch(src);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function renderFieldGrid(title: string, fields: string[]) {
  if (!fields.length) return "";
  return `<section class="block"><h2>${escapeHtml(title)}</h2><div class="field-grid">${fields.map((field) => {
    const normalized = field.toLocaleLowerCase("es-MX");
    const isSemaphore = normalized.includes("semáforo") || normalized.includes("semaforo");
    const isCondition = normalized.includes("condición") || normalized.includes("condicion");
    const options = isSemaphore
      ? "☐ Rojo   ☐ Amarillo   ☐ Verde   ☐ Azul"
      : isCondition
        ? "☐ Inexistencia   ☐ Peligro   ☐ Emergencia   ☐ Normal   ☐ Afluencia"
        : "";
    return `<div><b>${escapeHtml(field)}</b><span>${options}</span></div>`;
  }).join("")}</div></section>`;
}

function renderQuestionGrid(questions: string[] | undefined) {
  if (!questions?.length) return "";
  return `<section class="block"><h2>Preguntas guía</h2><div class="question-grid">${questions.map((question) => `<div><b>${escapeHtml(question)}</b><span></span></div>`).join("")}</div></section>`;
}

function renderTable(table: OperationTemplate["tables"][number]) {
  const labelRows = table.rowLabels ?? [];
  const blankRows = Math.max(table.blankRows ?? 0, labelRows.length ? 0 : 3);
  const rows = [
    ...labelRows.map((label) => [label, ...Array.from({ length: Math.max(table.columns.length - 1, 0) }, () => "")]),
    ...Array.from({ length: blankRows }, () => Array.from({ length: table.columns.length }, () => "")),
  ];

  return `<section class="block table-block"><h2>${escapeHtml(table.title)}</h2><table><thead><tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${table.columns.map((_, index) => `<td>${row[index] ? escapeHtml(row[index]) : emptyCell}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`;
}

function buildTemplateHtml(template: OperationTemplate, operation: OperationFormatSet, unit: BusinessUnit | undefined, logoDataUrl: string) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(template.title)}</title>
<style>
  @page { size: letter landscape; margin: 0.35in; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #14213d; background: #eef4f9; font-family: "Aptos", "Segoe UI", sans-serif; }
  main { width: 100%; max-width: 11in; min-height: 8.1in; margin: 0 auto; padding: 28px; background: #fff; }
  header { display: flex; align-items: center; gap: 16px; padding-bottom: 15px; border-bottom: 3px solid #0071ce; }
  header img { width: 160px; height: auto; }
  header p { margin: 0 0 4px; color: #476172; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
  h1 { margin: 0; color: #061a33; font-size: 24px; line-height: 1.05; }
  .stamp { margin-left: auto; padding: 7px 9px; color: #fff; background: #061a33; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
  .meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding: 12px 0 4px; }
  .meta div, .field-grid div, .question-grid div { display: grid; gap: 6px; padding: 8px; background: #f6f9fc; border: 1px solid #d8e4ef; }
  b, th, h2 { color: #061a33; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; }
  .meta span, .field-grid span, .question-grid span { min-height: 30px; border-bottom: 1px solid #869292; }
  .block { padding-top: 12px; break-inside: avoid; }
  .block h2 { margin: 0 0 7px; }
  .field-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .context-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .context-grid div { padding: 8px; background: #f6f9fc; border: 1px solid #d8e4ef; }
  .context-grid p { margin: 5px 0 0; color: #334b5c; font-size: 8px; line-height: 1.3; }
  .question-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .question-grid span { min-height: 46px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; border-top: 1px solid #273c40; border-left: 1px solid #273c40; }
  th, td { min-height: 26px; padding: 5px; border-right: 1px solid #273c40; border-bottom: 1px solid #273c40; font-size: 8px; line-height: 1.22; vertical-align: top; }
  th { color: white; background: #061a33; text-align: left; }
  td:first-child { color: #14213d; font-weight: 700; }
  footer { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; padding-top: 34px; }
  footer div { display: grid; gap: 7px; text-align: center; }
  footer span { min-height: 28px; border-bottom: 1px solid #273c40; }
  @media print { body { background: #fff; } main { padding: 0; } }
</style>
</head>
<body>
<main>
  <header>
    <img src="${logoDataUrl}" alt="Axen Capital" />
    <div><p>Axen Capital · ${escapeHtml(unit?.name ?? "Fundación Dante Eludier")}</p><h1>${escapeHtml(template.title)}</h1><p>${escapeHtml(template.subtitle)}</p></div>
    <div class="stamp">Operación</div>
  </header>
  <section class="meta">
    <div><b>Unidad de negocio</b><span>${escapeHtml(unit?.name ?? "")}</span></div>
    <div><b>Puesto operativo</b><span>${escapeHtml(operation.positionName)}</span></div>
    <div><b>Área</b><span>${escapeHtml(operation.area ?? "")}</span></div>
    <div><b>Formato fuente</b><span>${escapeHtml(template.sourceFile)}</span></div>
  </section>
  ${renderFieldGrid("Control del formato", template.fields)}
  ${template.objective || template.description || template.rep ? `<section class="block context-block"><h2>Contexto operativo</h2><div class="context-grid">
    ${template.objective ? `<div><b>Objetivo</b><p>${escapeHtml(template.objective)}</p></div>` : ""}
    ${template.description ? `<div><b>Descripción</b><p>${escapeHtml(template.description)}</p></div>` : ""}
    ${template.rep ? `<div><b>REP</b><p>${escapeHtml(template.rep)}</p></div>` : ""}
    ${template.measurementRule ? `<div><b>Medición</b><p>${escapeHtml(template.measurementRule)}</p></div>` : ""}
  </div></section>` : ""}
  ${template.scoreSource !== "focus-daily" ? renderFieldGrid("Resumen operativo", template.summaryFields ?? []) : ""}
  ${renderQuestionGrid(template.questions)}
  ${template.tables.map(renderTable).join("")}
  ${template.scoreSource === "focus-daily" ? renderFieldGrid("Resumen operativo", template.summaryFields ?? []) : ""}
  <footer>
    <div><span></span><b>Elaboró</b></div>
    <div><span></span><b>Revisó</b></div>
    <div><span></span><b>Vo. Bo. Dirección</b></div>
    <div><span></span><b>Fecha de cierre</b></div>
    <div><span></span><b>Comentarios finales</b></div>
  </footer>
</main>
</body>
</html>`;
}

export async function downloadOperationTemplate(template: OperationTemplate, operation: OperationFormatSet, unit: BusinessUnit | undefined, logoSrc: string) {
  const logoDataUrl = await assetToDataUrl(logoSrc);
  const html = buildTemplateHtml(template, operation, unit, logoDataUrl);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(unit?.name ?? "fundacion-dante")}-${slugify(operation.positionName)}-${slugify(template.title)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

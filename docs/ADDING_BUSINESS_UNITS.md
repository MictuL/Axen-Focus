# Agregar unidades de negocio, puestos, REP y KPIs

La plataforma separa el nivel corporativo de Axen Capital de los catálogos especializados de cada unidad:

```text
Axen Capital
  Unidad de negocio
    Área
      Puesto
        REP
        KPI 1
        KPI 2
        KPI ...
        Formatos físicos por puesto o familia
```

Los puestos y KPIs de Halcones Fútbol Club pertenecen únicamente a `halcones-futbol-club`. No son indicadores generales de Axen Capital. La misma regla aplica a los formatos físicos: no se deben crear ni asignar formatos maestros de REP / KPI general; cada formato debe corresponder a un puesto, familia de puestos o función concreta.

## Opción 1: configuración desde la interfaz

1. Abre **Administración**.
2. En **Editar unidad**, modifica una unidad existente o agrega una nueva unidad.
3. En **Editar puesto, REP y KPIs**, selecciona esa unidad.
4. Captura el área y el nombre del puesto.
5. Captura el REP oficial.
6. Agrega los KPIs necesarios y captura nombre y descripción para cada uno.
7. Guarda el puesto.

Un puesto incompleto se guarda como `Pendiente de REP`. No puede evaluarse digitalmente hasta contar con REP y al menos un KPI con nombre y descripción. Si ya tiene un formato físico ligado, puede imprimirse para levantamiento manual, pero debe completarse el REP antes de capturarlo como evaluación digital oficial.

## Opción 2: incorporar una unidad al seed inicial

Para versionar una unidad nueva junto con el código:

1. Crea `src/data/units/<unidad>.ts`.
2. Exporta la unidad como `BusinessUnit`.
3. Exporta sus puestos como `Position[]`.
4. Usa `createPositionId(businessUnitId, localId)` para que cada ID quede namespaced.
5. Agrega la unidad a `src/data/businessUnits.ts`.
6. Agrega sus puestos al agregador `src/data/catalog.ts`.
7. Si requiere formatos físicos, crea `src/data/units/<unidad>ChecklistFormats.ts`.
8. Exporta esos formatos en `src/data/catalog.ts` como parte de `physicalChecklistFormats`.
9. Liga cada puesto con `physicalFormatIds`.

Ejemplo:

```ts
import { createPositionId } from "../../lib/catalog";
import type { BusinessUnit, Position } from "../../types";

export const EXAMPLE_UNIT_ID = "unidad-ejemplo";

export const exampleBusinessUnit: BusinessUnit = {
  id: EXAMPLE_UNIT_ID,
  name: "Unidad Ejemplo",
  description: "Descripción de la unidad.",
  status: "active",
  createdAt: "2026-06-02",
  responsible: "Dirección de unidad",
  observations: "",
};

export const examplePositions: Position[] = [
  {
    id: createPositionId(EXAMPLE_UNIT_ID, "puesto-ejemplo"),
    businessUnitId: EXAMPLE_UNIT_ID,
    area: "Operaciones",
    name: "Puesto Ejemplo",
    rep: "Resultado estratégico esperado.",
    kpis: [
      { name: "KPI 1", description: "Cómo se mide." },
      { name: "KPI 2", description: "Cómo se mide." },
    ],
    physicalFormatIds: ["unidad-ejemplo-f-02-operativo"],
    suggestedFrequency: "Mensual",
    suggestedEvidence: "Evidencia documental",
    suggestedEvaluator: "Responsable directo",
    status: "active",
    isEvaluable: true,
  },
];
```

## Crear formatos físicos

Un formato físico usa el contrato `PhysicalChecklistFormat`:

```ts
export const exampleChecklistFormats: PhysicalChecklistFormat[] = [
  {
    id: "unidad-ejemplo-f-02-operativo",
    businessUnitId: EXAMPLE_UNIT_ID,
    code: "F-02",
    title: "Evaluación operativa ejemplo",
    frequency: "Mensual",
    evaluator: "Responsable directo",
    appliesTo: ["Puesto Ejemplo"],
    repInstruction: "Usar el REP oficial del puesto seleccionado.",
    fields: ["Unidad de Negocio", "Área", "Puesto Evaluado", "Nombre del Evaluado", "Evaluador", "Periodo Evaluado", "Fecha de Evaluación", "Folio"],
    checklist: [
      { indicator: "KPI 1", aspect: "Aspecto observable a revisar.", evidence: "Reporte o evidencia documental" },
    ],
  },
];
```

El primer valor de `physicalFormatIds` en cada puesto es el formato sugerido para impresión. Puedes agregar IDs adicionales si el puesto tiene formatos alternativos, siempre que sean específicos del puesto, familia o función. No agregues formatos maestros de REP / KPI general como fallback.

## Evaluaciones dummy opcionales

Los nombres ficticios deben existir únicamente dentro de evaluaciones dummy, nunca en un catálogo de personas. Si una unidad necesita datos de demostración:

1. Crea `src/data/units/<unidad>Evaluations.ts`.
2. Exporta un arreglo `Evaluation[]`.
3. Agrégalo a `src/data/seed.ts`.

## Validaciones importantes

- Cada puesto debe conservar el `businessUnitId` de su unidad.
- Cada ID de puesto debe generarse con `createPositionId()`.
- El formulario exige nombre manual de persona evaluada, evaluador y fecha.
- Un puesto no se habilita sin REP oficial y al menos un KPI completo.
- Cada evaluación guarda snapshots de puesto, REP y KPIs para preservar el histórico.
- Los formatos físicos deben conservar el `businessUnitId` de la unidad correspondiente.
- No mezcles puestos ni checklists de una unidad con otra; Axen Capital solo agrega y compara unidades.
- No crees formatos maestros de REP / KPI general para nuevas unidades ni los asignes a puestos existentes.

# Axen Capital · Plataforma de evaluación por REP

MVP web local para evaluar rendimiento por unidad de negocio, área, puesto, REP y KPIs. La plataforma está a nombre de **Axen Capital**, arranca sin registros históricos y las primeras unidades configuradas son **Halcones Fútbol Club**, **Axen Mind School** y **Fundación Dante Eludier**.

## Ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Para validar:

```bash
npm test
npm run build
```

## Acceso local

El login temporal del MVP es:

- Usuario: `Admin`
- Contraseña: `AxenCapital123`

## Estructura

```text
src/
  components/
    CatalogAdmin.tsx        # Alta local de unidades y puestos
    EvaluationForm.tsx      # Captura manual con REP y KPIs
    EvaluationTable.tsx     # Histórico filtrable y CSV
    OverviewChart.tsx       # Evolución general por periodo
    PerformanceChart.tsx    # Dashboard individual por nombre capturado
    PositionCatalog.tsx     # Catálogo técnico de puestos, REP, KPIs y pendientes
    PrintableForm.tsx       # Formato físico tamaño carta
  data/
    businessUnits.ts        # Registro corporativo de unidades Axen
    catalog.ts              # Agregador general de puestos por unidad
    seed.ts                 # Agregador de evaluaciones dummy
    units/
      axenMind.ts           # Unidad, puestos, REPs y KPIs de Axen Mind
      axenMindChecklistFormats.ts # 3 formatos físicos oficiales de Axen Mind
      additionalEvaluationUnits.ts # Axen Energy, Health, Work, Up y Marca Dante
      evaluationDocumentFormats.ts # Formatos oficiales extraídos del ZIP de evaluación KPI
      fundacionDante.ts     # Unidad, puestos, REPs y KPIs de Fundación Dante
      fundacionDanteChecklistFormats.ts # 4 formatos físicos oficiales de Fundación Dante
      fundacionDanteOperationFormats.ts # 10 guías operativas de Fundación Dante
      halcones.ts           # Unidad, puestos, REPs y KPIs de Halcones
      halconesChecklistFormats.ts # 4 formatos físicos oficiales de Halcones
      halconesEvaluations.ts # 40 evaluaciones dummy de Halcones
  hooks/
    useCatalog.ts           # Persistencia local de configuración
    useEvaluations.ts       # Alta y persistencia local de evaluaciones
  lib/
    analytics.ts            # Series de gráficas y resumen de unidades
    catalog.ts              # IDs namespaced y validación de puestos
    evaluation.ts           # Fórmula, estatus, tendencia, promedios y alertas
    evaluation.test.ts      # Pruebas automatizadas
  types.ts                  # Contratos de datos
```

## Reglas implementadas

- Fórmula: KPIs `70%`, cumplimiento general `20%`, evidencia/incidencias `10%`.
- Semáforo automático: Excelente, Bueno, En observación, Riesgo y Crítico.
- Tendencia contra la evaluación anterior de la misma persona, puesto y unidad: `Mejora` si sube más de 3 puntos, `Baja` si cae más de 3 y `Estable` entre `-3` y `+3`.
- Nombre de persona evaluada capturado manualmente en cada evaluación.
- Sin catálogo precargado de personas.
- 26 puestos evaluables de Halcones con REP y KPIs oficiales configurables.
- 3 puestos pendientes de REP bloqueados para evaluación.
- 19 puestos evaluables de Axen Mind School con REP y KPIs oficiales configurables.
- 8 puestos evaluables de Fundación Dante Eludier y 2 puestos visibles pendientes de REP digital.
- 5 unidades nuevas integradas desde documentos de evaluación KPI: Axen Energy, Axen Health, Axen Work, Axen Up y Marca Dante Eludier.
- 24 formatos físicos oficiales de evaluación: 4 Halcones, 3 Axen Mind, 4 Fundación Dante y 13 para las unidades nuevas.
- Estado inicial en cero: las evaluaciones se crean únicamente desde la captura real del dashboard.
- Alertas por puntaje bajo, baja consecutiva, riesgo sostenido, KPI bajo, incidencia repetida, falta de evaluación reciente, promedio bajo y catálogos incompletos.
- Formatos operativos imprimibles por puesto, con previsualización, captura digital e impresión con los datos capturados o en blanco.
- Vista **Inicio** con consolidado general de la plataforma y accesos a cada unidad.
- Dashboards independientes por unidad de negocio.
- Gráficas lineales con controles para acercar, alejar y volver a ver todo.
- Analítica individual con filtros por periodo, año, temporada, unidad, área y puesto.
- Comparativa entre dos perfiles evaluados dentro del mismo filtro, útil cuando cambia el nombre capturado de una persona o se compara el desempeño de ocupantes del mismo puesto.
- Menú lateral con Inicio, Formatos de impresión, Dashboard, Administración, Analítica individual e Histórico y reportes.
- Checklist digital alimentado por el mismo formato físico sugerido del puesto; los aspectos a evaluar se mantienen sincronizados con impresión.

## Formatos físicos por unidad

La sección **Formatos de impresión** permite elegir entre formatos de evaluación y formatos de operación. Los formatos de evaluación imprimen el checklist REP/KPI asignado al puesto; los formatos de operación muestran su frecuencia de uso, el REP del puesto, una previsualización editable y controles para imprimir con los datos capturados hasta ese momento o sin llenar. Cuando el puesto tiene documentos fuente cargados, cada formato operativo también se puede descargar como plantilla homogénea de Axen Capital en blanco.

Los archivos `src/data/units/halconesChecklistFormats.ts`, `src/data/units/axenMindChecklistFormats.ts`, `src/data/units/fundacionDanteChecklistFormats.ts` y `src/data/units/additionalEvaluationUnits.ts` conectan los formatos físicos de evaluación por unidad. `src/data/units/evaluationDocumentFormats.ts` contiene los documentos oficiales extraídos de `files (10).zip`. No se incluyen formatos maestros de REP / KPI general, ni puestos CEO, Dueño o Patronato; cada formato debe pertenecer a un puesto, familia de puestos o función concreta de una unidad de negocio.

- `F-02` directiva.
- `F-03` familia especializada, comercial, académica, producción o procuración según unidad.
- `F-04` operación, finanzas, bienestar, responsabilidad social o jugadores según unidad.
- `F-05` operación administrativa/federativa, voluntariados o cierre de unidades con cinco formatos.

Cada puesto de `src/data/units/halcones.ts`, `src/data/units/axenMind.ts`, `src/data/units/fundacionDante.ts` y las unidades de `src/data/units/additionalEvaluationUnits.ts` tiene `physicalFormatIds`. El primer ID es el formato sugerido para imprimir; los siguientes son alternativas específicas del puesto o familia. No se debe usar un formato maestro universal como respaldo.

Los archivos `src/data/units/halconesOperationFormats.ts`, `src/data/units/axenMindOperationFormats.ts` y `src/data/units/fundacionDanteOperationFormats.ts` contienen los formatos de operación. Halcones incluye 29 guías operativas y empieza en `Director General UDN`; Axen Mind incluye 19 guías ligadas a sus puestos actuales; Fundación Dante incluye 9 guías operativas. Fundación Dante ya tiene 9 plantillas descargables ligadas a Director General UDN, Coordinador de Procuración de Fondos y Voluntariado de Procuración de Fondos.

## Agregar unidades y puestos

Desde **Administración** se puede agregar y editar una unidad de negocio, modificar puestos existentes, crear nuevos puestos y agregar o quitar KPIs. Si un puesto no tiene REP o al menos un KPI con nombre y descripción completa, se guarda como `Pendiente de REP` y no aparece como opción evaluable.

La captura operativa inicia desde **Inicio** o **Dashboard**: se selecciona unidad de negocio, se presiona **Comenzar evaluación**, se elige el puesto de la unidad y se califican los aspectos asociados al REP del puesto. Cada puesto carga el formato físico sugerido y usa ese mismo checklist como checklist digital.

La guía detallada para configurar nuevas unidades desde interfaz o código está en [`docs/ADDING_BUSINESS_UNITS.md`](docs/ADDING_BUSINESS_UNITS.md).

Cada `Position` se relaciona por `businessUnitId` y usa un ID namespaced. Así los KPIs de Halcones nunca se asumen como KPIs generales de Axen Capital.

## Persistencia

El MVP usa `localStorage` para trabajar sin infraestructura adicional. Para una etapa multiusuario, el siguiente paso natural es mover las mismas entidades a SQLite o Supabase, agregar autenticación, roles de acceso y bitácora de cambios.

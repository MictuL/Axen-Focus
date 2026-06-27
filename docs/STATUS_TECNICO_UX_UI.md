# Axen Focus - Documento tecnico de estatus para revision UX/UI

Actualizado: 26 de junio de 2026  
Proyecto local: `/Users/axenmkt/Documents/Formatos de evaluacion`  
Stack: React 18, TypeScript, Vite, Recharts, Vitest  
Persistencia actual: `localStorage` y `sessionStorage`, sin backend productivo

## 1. Objetivo del documento

Este documento resume como esta estructurada actualmente la plataforma Axen Focus / Control de Operacion, para que un especialista UX/UI pueda entender:

- Que problema operativo resuelve.
- Que modulos existen y como se conectan.
- Que informacion captura cada flujo.
- Como se calculan condiciones, metas, indicadores y seguimiento.
- Que restricciones o decisiones de producto ya estan vigentes.
- Que puntos conviene revisar en la reunion de UX/UI.

La plataforma esta en una etapa de prototipo funcional local. Varias reglas ya estan implementadas, pero la estructura visual y la experiencia siguen en proceso de depuracion.

## 2. Proposito del producto

Axen Focus es una herramienta interna de control operativo para Axen Capital. Su objetivo es conectar:

1. Las unidades de negocio.
2. Los puestos del organigrama.
3. El REP de cada puesto.
4. Los indicadores de puesto.
5. Las metas operativas asignadas.
6. Las actividades diarias del Focus.
7. Las evaluaciones semanales por indicadores.
8. La condicion resultante de cada colaborador, responsable y unidad.

La plataforma no busca ser un formulario aislado. La logica principal es que cada dato capturado tenga trazabilidad hacia el perfil, puesto, unidad, fecha, meta, indicador o relacion jerarquica que lo origina.

## 3. Estado actual de alcance

### Implementado

- Login local con unidad de negocio y perfil de trabajo.
- Acceso maestro desde la unidad "Administracion".
- Perfiles generados automaticamente desde puestos del catalogo.
- Foto de perfil local por puesto/perfil.
- Navegacion lateral por modulos.
- Captura diaria de Focus.
- Captura semanal de indicadores y metas.
- Asignacion de metas por unidad y por perfil.
- Metas semanales, mensuales y anuales.
- Metas por porcentaje y por cantidad.
- Reparto de metas de cantidad entre varios perfiles.
- Calculo de cumplimiento diario del Focus.
- Calculo de condicion por tendencia.
- Formulas por condicion.
- Seguimiento personal y de equipo.
- Organigrama operativo con condiciones.
- Registros historicos de Focus, indicadores y documentos.
- Formatos imprimibles de Focus.
- Administracion de catalogo, relaciones, metodologia Focus y reset.

### En proceso o sensible a revision UX/UI

- Jerarquia visual del Focus y de la captura de indicadores.
- Limpieza de campos redundantes.
- Claridad entre "Focus diario" y "Evaluacion por indicadores".
- Lectura de metas contra actividades sin saturar la captura.
- Seguimiento directivo: tabla informativa, grafica y drill-down.
- Evitar scroll horizontal en tablas.
- Proporciones entre bloques de contexto, captura y resultado.
- Estado visual de condiciones y graficas.
- Separacion clara entre datos editables, datos informativos y resultados calculados.

## 4. Arquitectura tecnica general

La aplicacion es una SPA local montada en React.

```text
src/
  App.tsx                         Shell principal, login, navegacion y armado de vistas
  styles.css                      Sistema visual global y layout
  types.ts                        Contratos de datos principales
  components/                     Vistas y componentes operativos
  hooks/                          Persistencia local y stores por entidad
  lib/                            Logica de calculo, tendencias, metas, jerarquia y folios
  data/                           Catalogos base de unidades, puestos, formatos y guias
  assets/                         Logos y recursos visuales
docs/
  PRODUCT_ARCHITECTURE.md         Documento anterior de arquitectura
  ADDING_BUSINESS_UNITS.md        Guia para agregar unidades
  STATUS_TECNICO_UX_UI.md         Este documento
```

## 5. Modulos visibles en la plataforma

| Modulo | Objetivo | Usuario principal | Componente base |
| --- | --- | --- | --- |
| Inicio | Mostrar contexto operativo y accesos principales | Todos | `GeneralHome` en `src/App.tsx` |
| Focus | Capturar actividades diarias del perfil | Colaborador, responsable, maestro | `src/components/EvaluationForm.tsx` |
| Indicadores y Metas | Definir metas y evaluar indicadores del puesto | Director, coordinador, gerente, maestro | `src/components/PositionIndicatorMetrics.tsx` |
| Seguimiento | Consultar condicion, metas y graficas | Todos, con alcance segun rol | `FollowupWorkspace` en `src/App.tsx` |
| Organigrama | Ver mapa operativo y condiciones por perfil | Todos, con alcance segun rol | `OrgChartWorkspace` en `src/App.tsx` |
| Registros | Consultar historiales y formatos imprimibles | Todos, edicion solo maestro | `RecordsWorkspace` y `src/components/EvaluationTable.tsx` |
| Administracion | Catalogo, relaciones, formulas, reset | Maestro | `CatalogAdmin`, `FocusRelationshipAdmin`, `FocusSettingsAdmin`, `EvaluationResetPanel` |

## 6. Login, roles y permisos

El login actual es temporal y local:

- Usuario: `Admin`
- Contrasena: `AxenCapital123`

El usuario primero selecciona una unidad de negocio. Si selecciona "Administracion", accede al perfil maestro: "Administracion general de la plataforma".

Si selecciona una unidad operativa, el login muestra los perfiles disponibles de esa unidad. Los perfiles se derivan de puestos activos, no de personas creadas manualmente.

| Tipo de acceso | Alcance esperado |
| --- | --- |
| Colaborador | Ve su Focus, su seguimiento, sus registros y su lugar en el organigrama. |
| Coordinador / Gerente | Ve su Focus, su equipo directo, metas/evaluaciones que puede gestionar y seguimiento de perfiles a cargo. |
| Director de Unidad | Ve la unidad, responsables, colaboradores, metas, indicadores y condicion de la UDN. |
| Maestro | Ve todas las unidades activas, puede resetear, administrar catalogo, relaciones y registros. |

Regla UX importante: el colaborador no debe ver informacion de otros perfiles salvo organigrama contextual y condicion general de la unidad. Los responsables y el maestro si necesitan vistas comparativas y trazabilidad.

## 7. Unidades activas actualmente

Aunque el repositorio conserva archivos historicos de varias unidades, el hook de catalogo filtra actualmente las unidades activas para trabajo operativo:

- Fundacion Dante Eludier.
- Axen Energy.
- Axen Health.

Esto ocurre en `src/hooks/useCatalog.ts`, donde se define `activeUnitIds`.

Existen archivos de datos para otras unidades o etapas anteriores, como Halcones, Axen Mind, Axen Work, Axen Up, Marca Dante, Axen Life y Axen Broker. No todas estan activas en el catalogo operativo actual.

## 8. Modelo conceptual vigente

```text
Unidad de negocio
  Puesto
    Perfil operativo
      Focus diario
        Actividades
      Indicadores del puesto
        Evaluaciones semanales
      Metas asignadas
        Semanales / mensuales / anuales
      Condicion
        Por tendencia historica
```

### Entidades clave

| Entidad | Donde vive | Comentario UX |
| --- | --- | --- |
| `BusinessUnit` | `src/types.ts`, `src/data/businessUnits.ts` | Unidad de negocio seleccionada en login y contexto. |
| `Position` | `src/types.ts`, `src/data/units/*` | Puesto del organigrama; contiene REP, indicadores y links a indicadores generales. |
| `CollaboratorProfile` | `src/types.ts`, `useCollaboratorProfiles` | Perfil generado desde puesto. No se crea libremente durante captura. |
| `Evaluation` | `src/types.ts`, `useEvaluations` | Registro principal del Focus diario. |
| `OperationalGoalAssignment` | `src/types.ts`, `useOperationalGoals` | Meta asignada por unidad o perfil. |
| `WeeklyPositionIndicatorEvaluation` | `src/types.ts`, `usePositionIndicators` | Evaluacion semanal por indicadores del puesto. |
| `FocusHierarchyRelationship` | `src/types.ts`, `useFocusRelationships` | Relacion de reporte entre perfiles. |
| `DocumentRecord` | `src/types.ts`, `useDocumentRegistry` | Historial documental y folios. |

## 9. Flujo actual del Focus diario

El Focus se encuentra en `src/components/EvaluationForm.tsx`.

### Paso 1 - Perfil y fecha

El usuario define:

- Unidad, si su acceso lo permite.
- Puesto/perfil, si su acceso lo permite.
- Fecha de llenado.

El sistema muestra automaticamente:

- Perfil vinculado.
- Fecha clasificada.
- REP del puesto.
- Indicadores del puesto.
- Metas asignadas, si existen.

### Paso 2 - Actividades

La captura usa una tabla tipo tablero con:

- Actividad.
- Estado: No iniciado, En proceso, Completado.
- Prioridad.
- Deadline.
- Avance porcentual.
- Motivo / avance, requerido cuando aplica.

El bloque de actividades debe ser el protagonista de la captura. La grafica ya no debe vivir dentro de este paso para evitar que el usuario manipule datos buscando mejorar visualmente la tendencia.

### Paso 3 - Condicion

Muestra:

- Indice anterior.
- Indice actual.
- Lectura final.
- Metas del puesto como referencia compacta.
- Grafica resultante.
- Formula a seguir segun la condicion obtenida.

La condicion y la formula deben ser el cierre del flujo, no informacion mezclada con la captura.

## 10. Calculo del Focus

La logica base esta en `src/lib/focusDaily.ts`.

La captura diaria se calcula por actividades, avance y prioridad. La meta no altera la condicion del Focus; se muestra como referencia comparativa para que el colaborador sepa hacia donde enfocar su trabajo.

Estados actuales:

- No iniciado.
- En proceso.
- Completado.

Prioridades internas:

- Importante - urgente.
- Importante - no urgente.
- No importante - urgente.
- No importante - no urgente.

El score diario es un cumplimiento ponderado. La meta puede explicar el contexto, pero el resultado del Focus se obtiene desde la captura de actividades.

## 11. Logica de condiciones

La condicion no es una escala fija por porcentaje. Se determina por tendencia y comparacion historica.

Condiciones:

- Inexistencia.
- Peligro.
- Emergencia.
- Normal.
- Afluencia.
- Poder.

Configuracion vigente en `DEFAULT_FOCUS_CONFIGURATION`:

| Parametro | Valor actual |
| --- | --- |
| Subida fuerte para Afluencia | `+40` puntos |
| Caida fuerte para Peligro | `-25` puntos |
| Tolerancia de estabilidad | `1` punto |
| Periodos de estancamiento prolongado | `3` |
| Racha de Poder | Regla de sostenimiento y rachas al 100 |

Reglas importantes de producto:

- Primera captura no debe leerse como exito consolidado.
- Una caida fuerte es Peligro, aunque el resultado absoluto siga alto.
- Un 0 debe leerse como Peligro o situacion critica segun contexto de tendencia.
- Afluencia exige subida marcada.
- Poder requiere sostener productividad alta o racha.
- La grafica puede mostrar 100 como limite visual, pero la logica debe conservar memoria de rachas o sobrecumplimiento cuando aplique.

## 12. Metas e indicadores

La seccion esta en `src/components/PositionIndicatorMetrics.tsx`.

Existen dos niveles conceptuales:

1. Metas generales de la unidad.
2. Metas asignadas a perfiles segun los indicadores de su puesto.

### Metas generales

Las metas se basan en indicadores de unidad o indicadores relevantes para el puesto.

Pueden ser:

- Porcentaje: normalmente meta fija de 100.
- Cantidad: valor numerico a alcanzar.

Pueden tener frecuencia:

- Semanal.
- Mensual.
- Anual.

Cuando una meta es de cantidad y afecta a varios perfiles, se permite repartir la cantidad entre perfiles. El total del reparto debe cubrir el 100% de la cantidad.

### Evaluacion semanal por indicadores

Los indicadores de puesto se capturan semanalmente. No deben confundirse con actividades diarias del Focus.

Campos relevantes:

- Indicador.
- Resultado: Cumplio, Medio Cumplio, No Cumplio.
- Valor real.
- Meta.
- Score.
- Comentario.

Regla UX importante: si el indicador es de cantidad, se captura cantidad. Si es porcentaje, se captura porcentaje. La interfaz debe evitar mostrar `%` en metas de cantidad.

## 13. Jerarquia y rollups

La jerarquia esta definida por relaciones `FocusHierarchyRelationship`.

Archivo base: `src/lib/fundacionAccess.ts`  
Calculo jerarquico: `src/lib/fundacionHierarchy.ts` y `src/lib/focusConsolidation.ts`

Logica conceptual:

- Colaborador: condicion desde su propio Focus.
- Coordinador/Gerente: condicion derivada de perfiles que le reportan, mas su contexto propio cuando la vista lo requiere.
- Director: condicion derivada de coordinadores/gerentes y su propio Focus.
- Unidad: condicion derivada desde la lectura del director.

Regla UX importante: cualquier condicion consolidada debe poder explicar "de donde viene". La vista directiva necesita drill-down para ver perfiles, scores, metas, actividades y registros que alimentan el promedio.

## 14. Seguimiento y organigrama

### Seguimiento

Debe funcionar como vista de lectura y analisis. No debe convertirse en otro lugar de captura.

Para colaborador:

- Condicion actual.
- Grafica personal.
- Comparativa Focus vs evaluaciones recibidas.
- Resultados y conclusiones breves.

Para director/coordinador/gerente:

- Tabla informativa de metas por puesto/perfil.
- Grafica del perfil seleccionado.
- Lectura del equipo a cargo.
- Drill-down hacia registros.

### Organigrama

Debe mostrar el mapa descendente, no solo el responsable directo. El colaborador necesita entender donde esta ubicado, pero no debe ver condiciones privadas de responsables.

Para responsables y maestro:

- Condicion actual por perfil.
- Ultima evaluacion por indicadores.
- Click hacia seguimiento del perfil.

## 15. Registros, folios y formatos

La plataforma tiene un registro documental en `useDocumentRegistry`.

Folios:

- `EV` para evaluacion.
- Folio incremental con ano.
- Se guarda historial de documentos impresos y digitales.

Registros esperados:

- Focus guardados.
- Evaluaciones por indicadores.
- Documentos impresos.
- Documentos completados digitalmente.

Regla UX importante: Registros debe ser la vista para consultar historico detallado. Seguimiento no debe mostrar historiales largos si ya existe Registros.

## 16. Persistencia actual

La plataforma usa almacenamiento local.

| Store | Llave |
| --- | --- |
| Sesion | `axen-evaluation-access-v2` en `sessionStorage` |
| Catalogo de unidades | `axen-performance-units-v2` |
| Catalogo de puestos | `axen-performance-positions-v2` |
| Perfiles | `axen-collaborator-profiles-v1` |
| Evaluaciones Focus | `axen-performance-evaluations-v9` |
| Relaciones | `axen-focus-hierarchy-relationships-v1` |
| Configuracion Focus | `axen-focus-settings-v2` |
| Metas | `axen-operational-goals-v1` |
| Indicadores - activaciones | `axen-position-indicator-activations-v1` |
| Indicadores - registros | `axen-position-indicator-records-v1` |
| Documentos | `axen-document-registry-v1` |
| Revisiones de unidad | `axen-unit-condition-reviews-v2` |

Limitacion tecnica: al no existir backend, los datos son locales al navegador. Para una version productiva se necesitara autenticacion real, base de datos, bitacora, permisos persistentes y estrategia de migracion.

## 17. Estado visual y lineamientos ya definidos

Principios actuales de UX:

- Captura primero, explicacion despues.
- No duplicar datos que ya se conocen por login, unidad o perfil.
- No usar campos deshabilitados si no aportan valor.
- Evitar tarjetas innecesarias.
- Mantener tablas sin scroll horizontal.
- Alinear todos los controles de captura.
- Separar captura, resultado y accion.
- Las graficas deben iniciar desde 0.
- La condicion debe explicar la formula a seguir.
- Los botones y estados deben conservar proporciones y lenguaje visual consistente.

Identidad visual:

- Plataforma Axen Capital.
- Logo oficial en assets.
- Azul profundo como base del panel lateral y bloques de alto contraste.
- Acento azul Axen para acciones primarias.
- Estados por color, siempre acompanados de texto.

## 18. Puntos sensibles para la reunion UX/UI

### Navegacion

- Validar si los modulos actuales son suficientes: Inicio, Focus, Indicadores y Metas, Seguimiento, Organigrama, Registros, Administracion.
- Revisar si "Indicadores y Metas" debe dividirse visualmente o mantenerse unido.
- Confirmar si Inicio para directores debe quedarse solo con proceso principal y accesos.

### Captura Focus

- El paso de actividades debe ser el centro de la experiencia.
- La grafica debe aparecer solo como resultado.
- Las metas deben ser referencia, no ruido.
- El aviso de primera evaluacion debe ser discreto.
- Campos y tabla deben estar alineados.

### Indicadores y Metas

- Reducir saturacion cuando hay muchas metas.
- Separar claramente metas generales, metas asignadas y evaluacion semanal.
- Revisar como mostrar reparto de cantidades sin abrumar.
- Confirmar copy para "cantidad", "porcentaje", "score", "valor real" y "meta".

### Seguimiento

- Debe ser lectura, no captura.
- Debe explicar resultados con texto breve.
- Debe evitar historiales largos; eso vive en Registros.
- Necesita drill-down claro desde condicion consolidada hacia fuente.

### Organigrama

- Debe mostrar estructura descendente completa.
- Debe senalar el perfil actual.
- Debe evitar exponer informacion privada innecesaria a colaboradores.
- Para directores, cada fila debe permitir ir al seguimiento del perfil.

### Registros

- Debe ser el lugar de detalle historico.
- Debe permitir consultar por fecha, folio, perfil y fuente.
- La edicion debe seguir limitada al perfil maestro.

## 19. Riesgos tecnicos actuales

- `App.tsx` concentra demasiada logica de vistas, permisos y layout.
- La persistencia en `localStorage` puede romperse por datos pesados o cuota del navegador.
- El login es temporal y no representa seguridad real.
- No hay backend ni sincronizacion multiusuario.
- Hay documentacion previa con reglas antiguas; este documento debe tomarse como estatus vigente.
- Existen archivos de unidades historicas que no estan activas en el catalogo actual.
- La distincion entre Focus, metas e indicadores aun requiere cuidado visual para no confundir al usuario.

## 20. Archivos clave para revision

| Archivo | Uso |
| --- | --- |
| `src/App.tsx` | Shell, login, roles, navegacion y composicion de vistas. |
| `src/components/EvaluationForm.tsx` | Flujo de captura Focus. |
| `src/components/PositionIndicatorMetrics.tsx` | Metas, reparto y evaluacion semanal por indicadores. |
| `src/components/EvaluationTable.tsx` | Registros, historiales y documentos. |
| `src/components/FocusPrintableForm.tsx` | Formato imprimible del Focus. |
| `src/styles.css` | Indice de estilos globales; importa las capas de `src/styles/`. |
| `src/styles/tailwind.css` | Capa Tailwind utilities-only, sin Preflight. |
| `src/styles/base.css` | Tokens, reset, tipografia y base visual. |
| `src/styles/layout.css` | Shell, login, navegacion, vistas principales y responsive. |
| `src/styles/components.css` | Paneles, tarjetas, tablas informativas y componentes de producto. |
| `src/styles/forms.css` | Inputs, selects, botones heredados y tablas de captura. |
| `src/styles/charts.css` | Graficas, leyendas y lectura visual de datos. |
| `src/styles/print.css` | Formatos imprimibles y reglas de impresion. |
| `src/components/ConditionBadge.tsx` | Badge de condicion migrado a Tailwind. |
| `src/components/ui/Button.tsx` | Boton base reutilizable en Tailwind. |
| `src/components/ui/Panel.tsx` | Panel base reutilizable en Tailwind. |
| `src/components/ChartZoomControls.tsx` | Controles de acercar/alejar migrados sobre el boton base. |
| `vite.config.ts` | Configuracion Vite con React y plugin de Tailwind. |
| `src/types.ts` | Modelo de datos. |
| `src/lib/focusDaily.ts` | Calculo Focus, condiciones y formulas. |
| `src/lib/goals.ts` | Fechas, cadencias y metas. |
| `src/lib/fundacionAccess.ts` | Perfiles derivados de puestos y relaciones base. |
| `src/hooks/useCatalog.ts` | Unidades activas y catalogo local. |
| `src/hooks/useEvaluations.ts` | Persistencia y normalizacion de Focus. |
| `src/hooks/useOperationalGoals.ts` | Persistencia de metas. |
| `src/hooks/usePositionIndicators.ts` | Persistencia de indicadores semanales. |

## 21. Como ejecutar la plataforma

```bash
npm install
npm run dev
```

Abrir:

```text
http://127.0.0.1:5173/
```

Validar:

```bash
npm test
npm run build
```

## 22. Preguntas recomendadas para el experto UX/UI

1. Como debe organizarse la navegacion para diferenciar captura diaria, evaluacion semanal y seguimiento?
2. Cual es la forma mas limpia de mostrar metas activas dentro del Focus sin distraer de la captura?
3. Como debe verse una condicion consolidada para que sea entendible y trazable?
4. Que informacion debe vivir en Seguimiento y que informacion debe mandarse a Registros?
5. Como deberia visualizarse el organigrama para colaboradores vs directores?
6. Como reducir el ruido en Indicadores y Metas cuando hay metas compartidas?
7. Que componentes deben estandarizarse primero: tablas, pildoras de estado, botones, formularios, graficas o cards?

## 23. Resumen ejecutivo para la reunion

La plataforma ya tiene una logica funcional avanzada: perfiles por puesto, Focus diario, indicadores semanales, metas, condiciones por tendencia, organigrama, registros y administracion local. El reto principal ya no es solo tecnico, sino de arquitectura de informacion y limpieza visual.

La revision UX/UI deberia concentrarse en:

- Clarificar jerarquia entre captura, resultado y seguimiento.
- Reducir campos redundantes.
- Separar informacion editable de informacion calculada.
- Dar trazabilidad sin saturar.
- Hacer que directores y colaboradores vean solo lo que necesitan para actuar.

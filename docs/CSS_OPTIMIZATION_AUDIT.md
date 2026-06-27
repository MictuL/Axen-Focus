# Auditoria de optimizacion CSS

Fecha: 26/06/2026

## Estado actual

La plataforma ya no depende de un CSS monolitico. `src/styles.css` funciona como archivo indice y carga el sistema visual por capas:

- `src/styles/base.css`: tokens, reset, tipografia y reglas base.
- `src/styles/layout.css`: shell, login, vistas principales y estructura responsive.
- `src/styles/components.css`: tarjetas, paneles, tablas informativas y componentes de producto.
- `src/styles/forms.css`: inputs, selects, botones globales heredados y tablas de captura.
- `src/styles/charts.css`: graficas, leyendas, herramientas y lectura visual de datos.
- `src/styles/print.css`: formatos de impresion y reglas `@media print`.
- `src/styles/tailwind.css`: utilidades Tailwind sin Preflight.

Lectura del auditor tras la integracion de Tailwind:

- Lineas CSS fuente: 15,149
- Clases unicas detectadas: 739
- Clases con uso literal en `src`: 357
- Clases posiblemente dinamicas: 98
- Clases candidatas a revision: 284
- Variables CSS sin uso detectado: ninguna
- Keyframes sin uso detectados: ninguno

El diagnostico puede repetirse con:

```bash
npm run audit:css
```

## Lectura del problema

El problema principal no es solo el tamano del archivo, sino que el CSS mezcla varias capas:

- Tokens de marca y tema.
- Layout general de la aplicacion.
- Componentes vivos.
- Componentes historicos que ya fueron eliminados o reducidos.
- Estilos de impresion.
- Estados dinamicos generados desde React.

Esto hace dificil saber que borrar sin romper pantallas. Por eso la limpieza debe hacerse en fases, no con una migracion completa inmediata.

## Recomendacion tecnica

No conviene migrar todo a Tailwind de golpe. Es una migracion grande y de alto riesgo visual si se mezcla con el CSS historico sin revisar cada pantalla.

Ruta recomendada:

1. Mantener tokens globales en CSS:
   - Color
   - Tipografia
   - Radios
   - Sombras
   - Estados
   - Espaciado base

2. Eliminar CSS muerto con una lista revisable:
   - Empezar por clases asociadas a componentes eliminados.
   - Revisar candidatas del comando `npm run audit:css`.
   - Validar con build y navegador despues de cada bloque.

3. Mantener la division por capas ya aplicada:
   - Las nuevas reglas globales deben entrar en la capa correcta.
   - Si una regla pertenece a un componente estable y reutilizable, considerar Tailwind.
   - Evitar duplicar estilos entre CSS global y componente encapsulado.

4. Migrar a Tailwind solo donde aporte:
   - Formularios reutilizables.
   - Botones.
   - Badges de condicion.
   - Tablas de captura.
   - Paneles de seguimiento.

5. Si se usa Tailwind, hacerlo incremental:
   - No migrar pantallas completas de entrada.
   - Comenzar por componentes pequenos y estables.
   - Mantener los tokens CSS como fuente de verdad para no perder identidad visual.
   - Evitar `preflight` mientras exista una base global propia.

## Candidatos iniciales de limpieza

El auditor detecto varias familias que parecen pertenecer a flujos antiguos o componentes eliminados:

- `leadership-*`
- `operation-*`
- `weekly-*`
- `digital-checklist-*`
- `condition-origin-*`
- `condition-overview-*`
- `focus-weekly-*`
- `evaluation-live-*`
- `dashboard-*`
- `team-tree-*`

Antes de borrar, cada familia debe validarse con busqueda en `src` y prueba visual.

## Criterio UX/UI

La limpieza debe respetar el criterio de producto actual:

- Captura primero, explicacion despues.
- Sin campos redundantes.
- Sin scroll horizontal.
- Estados consistentes.
- Contraste claro.
- Botones y tablas con el mismo vocabulario visual.
- No agregar complejidad visual solo por cambiar de tecnologia.

## Decision sobre Tailwind

Tailwind se incorporo en modo utilities-only:

- `vite.config.ts` carga `@tailwindcss/vite`.
- `src/styles/tailwind.css` importa solo `tailwindcss/utilities.css`, sin Preflight.
- `src/styles.css` importa la capa Tailwind antes de las capas globales existentes.
- `styled-components` se retiro del proyecto para no sumar otra capa de runtime.

Piezas migradas a Tailwind:

- `src/components/ConditionBadge.tsx`: colores, punto visual y tamanos de badges de condicion.
- `src/components/ui/Button.tsx`: boton base reutilizable con variantes `primary`, `secondary`, `text` y `danger`.
- `src/components/ui/Panel.tsx`: panel base para extraer vistas estables del CSS global sin remaquetar pantallas completas.
- `src/components/ChartZoomControls.tsx`: usa el boton base y utilidades Tailwind para el layout interno.

Resultado inicial:

- El CSS fuente aun no baja porque Tailwind se agrego como una capa nueva y todavia convive con el CSS global.
- El CSS compilado sube ligeramente por las utilidades generadas.
- El JS compilado baja al retirar `styled-components`.
- La reduccion fuerte de CSS llegara cuando se migren familias completas y se eliminen sus reglas globales equivalentes.

La regla de trabajo vigente es no migrar pantallas completas de golpe. Primero se debe elegir una pieza estable, extraerla, eliminar su CSS global equivalente y validar build, tests y navegador.

# Guía de edición visual — UX/UI

Este documento es para la persona de UX/UI que va a mejorar el frontend de
**Axen Focus**. Explica dónde vive cada cosa y cómo cambiarla sin romper la app.
Léelo antes de tocar el CSS.

---

## 1. Cómo está organizado el CSS

El estilo NO es un archivo monolítico. Está dividido en capas y se carga desde
un único índice: `src/styles.css`.

| Archivo | Qué controla |
|---|---|
| `src/styles/base.css` | **Tokens** (color, tipografía, radios, sombras, espaciado) + reset. **Empieza aquí.** |
| `src/styles/layout.css` | Estructura de la app: shell, sidebar, topbar, login, inicio, rejillas. |
| `src/styles/components.css` | Componentes vivos: tarjetas, paneles, alertas, tablas, semáforos. (El más grande.) |
| `src/styles/forms.css` | Inputs, selects, botones heredados, formularios, metas, captura. |
| `src/styles/charts.css` | Gráficas, leyendas, lectura de tendencias. |
| `src/styles/print.css` | Cómo se ve la **hoja impresa** (reglas `@media print`). |
| `src/styles/tailwind.css` | Utilidades Tailwind (sin Preflight). No editar aquí el tema. |

Cada archivo grande ahora tiene, al inicio, un **ÍNDICE** con sus secciones.

---

## 2. Cómo navegar dentro de un archivo

Cada archivo grande tiene secciones marcadas con un banner visible:

```
/* ▓▓▓▓▓▓▓▓▓▓  [components · 05]  PANELES Y ALERTAS  ▓▓▓▓▓▓▓▓▓▓
   Panel base, encabezados y lista de alertas. */
```

Para saltar a una sección, usa **Buscar (Cmd/Ctrl+F)** y escribe el marcador,
por ejemplo `[components · 05]`. El índice del inicio del archivo lista todos
los marcadores disponibles.

---

## 3. "Quiero cambiar X" → dónde editar

| Quiero cambiar… | Edita… |
|---|---|
| El **azul de marca** (botones, enlaces, acentos) | `base.css` → `--color-brand` y `--color-brand-strong` |
| El **color de texto** | `base.css` → `--ink` (principal), `--ink-deep` (títulos), `--muted` (secundario) |
| El **fondo de tarjetas/paneles** | `base.css` → `--paper`, `--paper-2`, escala `--surface-1..4` |
| Los **bordes y separadores** | `base.css` → `--line` |
| Los **colores de semáforo** (ok / alerta / error) | `base.css` → `--green`, `--gold`, `--red` |
| La **tipografía** de toda la app | `base.css` → `--body-font` (cuerpo) y `--display-font` (títulos) |
| El **redondeo** de esquinas | `base.css` → `--radius-sm`, `--radius-md` |
| El **alto de inputs y botones** | `base.css` → `--control-height` |
| Las **sombras** de elevación | `base.css` → `--shadow`, `--subtle-shadow`, `--raised-shadow` |
| Las **animaciones** de entrada | `base.css` → bloque `@media screen` (keyframes + `--ease-out`) |
| El **layout del sidebar/topbar** | `layout.css` → `[layout · 03]` |
| El **tablero de inicio** (tarjetas de unidades) | `layout.css` → `[layout · 05]` |
| Una **tarjeta KPI** | `components.css` → `[components · 04]` |
| Los **badges de condición** | `src/components/ConditionBadge.tsx` (ya migrado a Tailwind) |
| El **botón base** nuevo | `src/components/ui/Button.tsx` (Tailwind) |
| Un **formulario de evaluación** | `forms.css` → `[forms · 03]` |
| Una **gráfica** | `charts.css` (el índice está al inicio) |
| La **hoja impresa** | `print.css` → `[print · 02]` |

---

## 4. Referencia rápida de tokens (en `base.css`)

**Marca**
- `--color-brand` `#0071ce` — azul Axen, acento primario
- `--color-brand-strong` `#004f9f` — azul oscuro, hover/énfasis

**Texto**
- `--ink` `#14213d` · `--ink-deep` `#061a33` · `--muted` `#65758b`

**Superficies** (de más claro a más teñido)
- `--paper` `#ffffff` · `--paper-2` `#f5f9fc`
- `--surface-1` → `--surface-4` (escala para unificar fondos)

**Estado**
- `--green` `#278461` · `--gold` `#b88418` · `--red` `#c94b4b`

**Espaciado** (escala de 4px, nueva)
- `--space-1`=4px … `--space-4`=16px … `--space-12`=48px

**Texto (escala, nueva)**
- `--text-xs` 12 · `--text-sm` 13 · `--text-base` 15 · `--text-md` 17 · `--text-lg` 22 · `--text-xl` 30

---

## 5. Dos cosas que debes saber antes de tocar nada

### 5.1 Nombres heredados engañosos
Por historia del proyecto, algunos tokens tienen nombre que NO corresponde a su
color. Se conservan para no romper el CSS viejo, pero **usa los nombres nuevos**:

| Nombre viejo | Color real | Usa este |
|---|---|---|
| `--orange` | azul | `--color-brand` |
| `--orange-deep` | azul oscuro | `--color-brand-strong` |
| `--lime` | azul claro | `--color-accent-soft` |

Viejos y nuevos apuntan al mismo valor, así que puedes migrar gradualmente.

### 5.2 Tres tokens reparados
`--body-font`, `--accent` y `--blue` se usaban en el CSS pero **nunca estaban
definidos** (caían a un valor por defecto). Ya están definidos correctamente.
Si notas que algún icono, texto o borde que antes se veía gris ahora se ve azul,
es porque por fin está tomando el acento de marca que le correspondía. Es el
comportamiento esperado; si en algún punto NO lo quieres, ajústalo en esa regla.

---

## 6. Reglas de oro (para no degradar el sistema)

1. **Cambia el color en `base.css`, no en cada regla.** Si necesitas un tono
   nuevo, créalo como token; no metas un `#hex` suelto dentro de
   `components.css` / `forms.css`.
2. **Reusa la escala de superficies.** Hoy conviven muchos azules pálidos casi
   idénticos. Al unificar, apunta todo a `--surface-1..4` y `--paper*`.
3. **No actives Preflight de Tailwind.** La base visual propia debe mandar.
4. **Migra a Tailwind solo piezas estables y pequeñas** (botón, badge, panel),
   y al hacerlo elimina su CSS global equivalente. No migres pantallas enteras
   de golpe.
5. **Valida después de cada bloque** con build + navegador. El criterio de
   producto es: captura primero, sin scroll horizontal, estados consistentes,
   contraste claro.

---

## 7. Herramientas del proyecto

- `npm run dev` — levanta el entorno de desarrollo.
- `npm run build` — compila (typecheck + Vite). Úsalo para validar.
- `npm run audit:css` — reporta clases usadas/dinámicas/candidatas a limpieza,
  tokens y keyframes sin uso. Útil antes de borrar CSS muerto.

Para el plan de limpieza de CSS muerto por fases, ver
`docs/CSS_OPTIMIZATION_AUDIT.md`.

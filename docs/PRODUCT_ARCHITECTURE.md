# Arquitectura de producto: plataforma de evaluación operativa Axen Capital

## 1. Principio rector

La plataforma opera con dos fuentes de medición separadas:

1. **Métricas por Focus**: operación diaria del colaborador mediante actividades tipo tablero.
2. **Métricas por Indicadores de Puesto**: evaluación semanal del REP y KPIs fundamentales del puesto.

No existe calificación global combinada entre ambas fuentes hasta que Axen Capital defina una fórmula explícita.

## 2. Módulos principales

| Módulo | Propósito | Frecuencia | Fuente |
| --- | --- | --- | --- |
| Focus Diario | Captura actividades, estado, prioridad, deadline, avance y bloqueo | Diaria | `focus-daily` |
| Indicadores de Puesto | Evalúa REP y KPIs del puesto por colaborador | Semanal | `position-indicators` |
| Seguimiento | Visualiza condición individual, consolidada y de unidad | Diario/semanal | Derivado |
| Relaciones Focus | Configura qué perfiles afectan a cada responsable | Configuración | Administración |
| Administración | Unidades, puestos, KPIs, fórmulas y reset | Configuración | Sistema |
| Registros | Historial, folios y formatos imprimibles | Consulta | Documentos |

## 3. Roles y permisos

| Rol | Puede hacer | No debe ver |
| --- | --- | --- |
| Colaborador | Registrar Focus propio, ver cumplimiento y semáforo propio | Pesos internos, relaciones jerárquicas, otros perfiles |
| Gerente / Coordinador | Registrar Focus propio, ver equipo relacionado y condición consolidada | Configuración global |
| Director de Unidad | Configurar relaciones, activar indicadores, evaluar KPIs semanales y ver unidad | Pesos internos matemáticos en vista operativa |
| Administrador | Gestionar unidades, puestos, KPIs, fórmulas, usuarios, permisos y auditoría | Sin restricciones operativas |

## 4. Modelo de datos sugerido

### `business_units`

- `id`
- `name`
- `description`
- `responsible`
- `status`
- `createdAt`

### `positions`

- `id`
- `businessUnitId`
- `area`
- `name`
- `operationalLevel`
- `rep`
- `kpis[]`
- `status`
- `isEvaluable`

### `collaborator_profiles`

- `id`
- `businessUnitId`
- `positionId`
- `name`
- `status`
- `createdAt`
- `updatedAt`

### `focus_daily_evaluations`

- `id`
- `collaboratorProfileId`
- `businessUnitId`
- `positionId`
- `date`
- `period`
- `activities[]`
- `weightedScore`
- `generalStatus`
- `trendCondition`
- `trendDeltaPP`
- `previousWeightedScore`
- `rollingAverageLast4`
- `rollingMinimumLast4`
- `isPowerCondition`

### `focus_daily_activities`

- `id`
- `evaluationId`
- `activity`
- `status`
- `priority`
- `deadline`
- `progress`
- `blockageReason`
- `calculatedSemaphore`
- `internalPriorityWeight`
- `internalWeightedValue`

Los dos últimos campos son internos y no se muestran al usuario final.

### `focus_hierarchy_relationships`

- `id`
- `businessUnitId`
- `sourceProfileId`
- `targetProfileId`
- `relationshipType`
- `weight`
- `startDate`
- `endDate`
- `status`
- `createdBy`
- `createdAt`
- `updatedAt`

### `consolidated_focus_conditions`

- `id`
- `userProfileId`
- `businessUnitId`
- `date`
- `ownFocusScore`
- `relatedScore`
- `consolidatedScore`
- `generalStatus`
- `trendCondition`
- `trendDeltaPP`
- `inputsUsed[]`
- `createdAt`
- `updatedAt`

### `position_indicator_activations`

- `id`
- `businessUnitId`
- `collaboratorProfileId`
- `positionId`
- `enabled`
- `evaluatorRole`
- `createdAt`
- `updatedAt`

### `weekly_position_indicator_evaluations`

- `id`
- `businessUnitId`
- `collaboratorProfileId`
- `evaluatorName`
- `positionId`
- `week`
- `weekStartDate`
- `weekEndDate`
- `indicators[]`
- `weightedScore`
- `weeklyCondition`
- `source`
- `createdAt`
- `updatedAt`

## 5. Flujo Focus Diario

1. Seleccionar unidad, puesto y colaborador.
2. Capturar actividades del día.
3. Por actividad: estado, prioridad Eisenhower, deadline, avance y motivo si aplica.
4. Calcular internamente peso y valor ponderado.
5. Calcular cumplimiento diario.
6. Calcular semáforo general.
7. Calcular condición por tendencia contra histórico del perfil.
8. Guardar histórico listo para gráficas.

## 6. Reglas Focus Diario

Pesos internos:

- Importante - urgente: `4`
- Importante - no urgente: `3`
- No importante - urgente: `2`
- No importante - no urgente: `1`

Formula:

```txt
cumplimiento = suma(valor ponderado obtenido) / suma(pesos posibles) * 100
```

Semáforo general:

- 80 a 100: Verde
- 50 a 79: Amarillo
- 0 a 49: Rojo

## 7. Flujo de tendencia

1. Sin actividades o score 0: Inexistencia.
2. Sin histórico: Sin histórico suficiente.
3. Revisar Poder con últimas 4 evaluaciones.
4. Si no aplica Poder, comparar variación en puntos porcentuales:
   - `<= -20`: Inexistencia
   - `<= -6`: Peligro
   - `<= 2`: Emergencia
   - `< 10`: Normal
   - `>= 10`: Afluencia

## 8. Condición consolidada

Cada responsable puede tener:

- Focus propio.
- Condiciones relacionadas de perfiles que le reportan.

Formula conceptual:

```txt
score consolidado = suma(score * peso) / suma(pesos)
```

Reglas:

- El Focus propio entra con peso default `1`.
- Cada relación entra con su peso configurado.
- Un mismo perfil no se cuenta dos veces para el mismo responsable.
- El director consolida gerentes/coordinadores y Focus propio.
- La unidad toma la condición consolidada del director, sin duplicar su Focus propio.

## 9. Indicadores de Puesto

Flujo:

1. Director o administrador activa indicadores para un colaborador.
2. El sistema toma los KPIs oficiales del puesto.
3. En corte semanal se captura resultado, score, observaciones y evidencia por indicador.
4. Se calcula promedio semanal 0-100.
5. Se calcula semáforo semanal.
6. Se calcula condición semanal por tendencia.
7. Se guarda histórico como fuente `position-indicators`.

## 10. Componentes de interfaz

| Vista | Componentes |
| --- | --- |
| Inicio | Selector de unidad, accesos a Focus, Indicadores, Seguimiento y Registros |
| Métricas por Focus | Wizard de sujeto, producto, tablero de actividades, decisión |
| Indicadores de Puesto | Activación, captura semanal por KPI, resultado semanal, histórico |
| Seguimiento | Unidad, personas, gráficas, condiciones consolidadas |
| Administración | Catálogos, relaciones jerárquicas, metodología Focus, reset |
| Registros | Historial, formatos imprimibles, folios |

## 11. Validaciones principales

- No guardar Focus sin actividades.
- No permitir avance menor a 0 ni mayor a 100.
- Si avance < 100, pedir motivo/bloqueo.
- Si estado = Bloqueado, pedir motivo/bloqueo.
- No duplicar evaluación de un mismo perfil en el mismo periodo.
- No crear relación jerárquica de un perfil hacia sí mismo.
- No duplicar relación activa origen/destino dentro de la misma unidad.
- No guardar indicadores semanales sin activación previa.
- No duplicar evaluación semanal del mismo colaborador/puesto/semana.

## 12. Estructura para gráficas

Todas las fuentes deben guardar:

- `date`
- `profileId`
- `businessUnitId`
- `positionId`
- `score`
- `semaphore`
- `trendCondition`
- `source`
- `period`

Gráficas recomendadas:

- Línea diaria de Focus individual.
- Línea consolidada por responsable.
- Línea de unidad por Focus.
- Línea semanal de Indicadores de Puesto.
- Distribución de condiciones por unidad.
- Ranking de perfiles que suben o bajan la condición.

## 13. Recomendaciones técnicas

- Mantener funciones de cálculo puras en `src/lib`.
- Mantener persistencia encapsulada en hooks.
- No calcular condiciones directamente dentro de componentes visuales.
- Guardar pesos internos, pero no renderizarlos en vistas operativas.
- Separar `focus-daily` y `position-indicators` en almacenamiento, consultas y gráficas.
- Preparar migración futura a backend con tablas equivalentes a los modelos descritos.

## 14. Roadmap

### Fase 1

- Focus Diario ponderado.
- Indicadores semanales independientes.
- Relaciones jerárquicas configurables.
- Históricos locales.

### Fase 2

- Usuarios reales y permisos por rol.
- Dashboard de consolidación por relación.
- Auditoría de cambios.
- Exportación de reportes.

### Fase 3

- Backend persistente.
- Autenticación formal.
- Gráficas avanzadas por fuente.
- Comparativas entre Focus e Indicadores sin mezclarlas en calificación única.

### Fase 4

- Automatización de alertas.
- Cierre de acciones por condición.
- Vistas específicas por rol.

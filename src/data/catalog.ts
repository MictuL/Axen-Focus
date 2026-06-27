import { additionalChecklistFormats, additionalPositions } from "./units/additionalEvaluationUnits";
import { axenMindChecklistFormats } from "./units/axenMindChecklistFormats";
import { axenMindPositions } from "./units/axenMind";
import { businessUnits } from "./businessUnits";
import { getFocusDailyOperationFormats } from "./units/focusDailyOperationFormats";
import { fundacionDanteChecklistFormats } from "./units/fundacionDanteChecklistFormats";
import { fundacionDantePositions } from "./units/fundacionDante";
import { halconesChecklistFormats } from "./units/halconesChecklistFormats";
import { halconesPositions } from "./units/halcones";

export { businessUnits };
export const positions = [...halconesPositions, ...axenMindPositions, ...fundacionDantePositions, ...additionalPositions];
export const physicalChecklistFormats = [...halconesChecklistFormats, ...axenMindChecklistFormats, ...fundacionDanteChecklistFormats, ...additionalChecklistFormats];
export const operationFormats = getFocusDailyOperationFormats(positions);

export const getBusinessUnit = (id: string) => businessUnits.find((unit) => unit.id === id);
export const getPosition = (id: string) => positions.find((item) => item.id === id);
export const getPhysicalChecklistFormat = (id: string) => physicalChecklistFormats.find((item) => item.id === id);
export const getOperationFormatsForUnit = (businessUnitId: string) => operationFormats.filter((item) => item.businessUnitId === businessUnitId);

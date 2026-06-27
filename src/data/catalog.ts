import { businessUnits } from "./businessUnits";
import { getFocusDailyOperationFormats } from "./units/focusDailyOperationFormats";
import { updatedChecklistFormats, updatedPositions } from "./units/updatedOperationalGuides";

export { businessUnits };
export const positions = updatedPositions;
export const physicalChecklistFormats = updatedChecklistFormats;
export const operationFormats = getFocusDailyOperationFormats(positions);

export const getBusinessUnit = (id: string) => businessUnits.find((unit) => unit.id === id);
export const getPosition = (id: string) => positions.find((item) => item.id === id);
export const getPhysicalChecklistFormat = (id: string) => physicalChecklistFormats.find((item) => item.id === id);
export const getOperationFormatsForUnit = (businessUnitId: string) => operationFormats.filter((item) => item.businessUnitId === businessUnitId);

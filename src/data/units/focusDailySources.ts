import { updatedFocusDailyUnitSources } from "./updatedOperationalGuides";

export type FocusDailySourcePosition = {
  positionName: string;
  objective: string;
  description: string;
  rep: string;
};

export type FocusDailyUnitSource = {
  unitId: string;
  unitName: string;
  sourceFile: string;
  positions: FocusDailySourcePosition[];
};

export const AXEN_LIFE_UNIT_ID = "axen-life";
export const VITAL_XTATION_UNIT_ID = "vital-xtation";

export const focusDailyUnitSources: FocusDailyUnitSource[] = updatedFocusDailyUnitSources;

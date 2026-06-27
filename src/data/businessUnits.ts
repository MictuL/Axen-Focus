import { additionalBusinessUnits } from "./units/additionalEvaluationUnits";
import { axenMindBusinessUnit } from "./units/axenMind";
import { fundacionDanteBusinessUnit } from "./units/fundacionDante";
import { halconesBusinessUnit } from "./units/halcones";

export const businessUnits = [halconesBusinessUnit, axenMindBusinessUnit, fundacionDanteBusinessUnit, ...additionalBusinessUnits];

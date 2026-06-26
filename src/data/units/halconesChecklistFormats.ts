import { getEvaluationDocumentFormats } from "./evaluationDocumentFormats";

const HALCONES_CHECKLIST_UNIT_ID = "halcones-futbol-club";
export const HALCONES_FORMAT_DIRECTIVE = "halcones-futbol-club-f-02-evaluacion-directiva";
export const HALCONES_FORMAT_TECHNICAL_STAFF = "halcones-futbol-club-f-03-evaluacion-cuerpo-tecnico-y-bienestar";
export const HALCONES_FORMAT_WELLNESS = HALCONES_FORMAT_TECHNICAL_STAFF;
export const HALCONES_FORMAT_PLAYERS = "halcones-futbol-club-f-04-evaluacion-de-jugadores";
export const HALCONES_FORMAT_OPERATIONS = "halcones-futbol-club-f-05-evaluacion-operativa-administrativa-y-federativa";
export const HALCONES_FORMAT_ADMIN = HALCONES_FORMAT_OPERATIONS;
export const HALCONES_FORMAT_COMMERCIAL = HALCONES_FORMAT_OPERATIONS;

export const halconesChecklistFormats = getEvaluationDocumentFormats(HALCONES_CHECKLIST_UNIT_ID);
export const getHalconesChecklistFormat = (id: string) => halconesChecklistFormats.find((format) => format.id === id);

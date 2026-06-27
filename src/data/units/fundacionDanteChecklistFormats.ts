import { getEvaluationDocumentFormats } from "./evaluationDocumentFormats";

const FUNDACION_DANTE_CHECKLIST_UNIT_ID = "fundacion-dante-eludier";
export const FUNDACION_DANTE_FORMAT_DIRECTIVE = "fundacion-dante-eludier-f-02-evaluacion-directiva-y-estrategica";
export const FUNDACION_DANTE_FORMAT_FUNDRAISING_ACTIVATIONS = "fundacion-dante-eludier-f-03-evaluacion-de-procuracion-de-fondos-y-activaciones";
export const FUNDACION_DANTE_FORMAT_MARKETING = FUNDACION_DANTE_FORMAT_FUNDRAISING_ACTIVATIONS;
export const FUNDACION_DANTE_FORMAT_SOCIAL_FINANCE = "fundacion-dante-eludier-f-04-evaluacion-de-responsabilidad-social-y-finanzas";
export const FUNDACION_DANTE_FORMAT_VOLUNTEERS = "fundacion-dante-eludier-f-05-evaluacion-de-voluntariados";

export const fundacionDanteChecklistFormats = getEvaluationDocumentFormats(FUNDACION_DANTE_CHECKLIST_UNIT_ID);
export const getFundacionDanteChecklistFormat = (id: string) => fundacionDanteChecklistFormats.find((format) => format.id === id);

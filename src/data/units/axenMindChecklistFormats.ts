import { getEvaluationDocumentFormats } from "./evaluationDocumentFormats";

const AXEN_MIND_CHECKLIST_UNIT_ID = "axen-mind-school";
export const AXEN_MIND_FORMAT_DIRECTIVE = "axen-mind-school-f-02-evaluacion-directiva";
export const AXEN_MIND_FORMAT_ACADEMIC = "axen-mind-school-f-03-evaluacion-academica-docentes-y-minders";
export const AXEN_MIND_FORMAT_WELLBEING = "axen-mind-school-f-04-evaluacion-bienestar-control-escolar-y-operativo";
export const AXEN_MIND_FORMAT_CONTROL_FINANCE = AXEN_MIND_FORMAT_WELLBEING;
export const AXEN_MIND_FORMAT_OPERATIONS = AXEN_MIND_FORMAT_WELLBEING;
export const AXEN_MIND_FORMAT_EXPERIENCE = AXEN_MIND_FORMAT_WELLBEING;
export const AXEN_MIND_FORMAT_COMMERCIAL = AXEN_MIND_FORMAT_WELLBEING;

export const axenMindChecklistFormats = getEvaluationDocumentFormats(AXEN_MIND_CHECKLIST_UNIT_ID);
export const getAxenMindChecklistFormat = (id: string) => axenMindChecklistFormats.find((format) => format.id === id);

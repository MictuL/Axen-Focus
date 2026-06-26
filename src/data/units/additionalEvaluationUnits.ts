import { getEvaluationDocumentFormats } from "./evaluationDocumentFormats";
import { businessUnitFromEvaluationDocument, positionsFromEvaluationDocuments } from "./evaluationPositionFactory";
import { getFocusOnlyBusinessUnits } from "./focusDailyOperationFormats";
import { axenLifeChecklistFormats, axenLifePositions } from "./axenLife";
import { axenBrokerBusinessUnit, axenBrokerChecklistFormats, axenBrokerPositions } from "./axenBroker";
import { AXEN_ENERGY_UNIT_ID, AXEN_HEALTH_UNIT_ID, axenEnergyBusinessUnit, axenEnergyPositions, axenHealthBusinessUnit, axenHealthPositions } from "./axenEnergyHealth";

export const AXEN_WORK_UNIT_ID = "axen-work";
export const AXEN_UP_UNIT_ID = "axen-up";
export const MARCA_DANTE_UNIT_ID = "marca-dante-eludier";

const axenEnergyFormats = getEvaluationDocumentFormats(AXEN_ENERGY_UNIT_ID);
const axenHealthFormats = getEvaluationDocumentFormats(AXEN_HEALTH_UNIT_ID);
const axenWorkFormats = getEvaluationDocumentFormats(AXEN_WORK_UNIT_ID);
const axenUpFormats = getEvaluationDocumentFormats(AXEN_UP_UNIT_ID);
const marcaDanteFormats = getEvaluationDocumentFormats(MARCA_DANTE_UNIT_ID);

export const additionalChecklistFormats = [
  ...axenEnergyFormats,
  ...axenHealthFormats,
  ...axenWorkFormats,
  ...axenUpFormats,
  ...marcaDanteFormats,
  ...axenLifeChecklistFormats,
  ...axenBrokerChecklistFormats,
];

export const additionalBusinessUnits = [
  axenEnergyBusinessUnit,
  axenHealthBusinessUnit,
  businessUnitFromEvaluationDocument({
    id: AXEN_WORK_UNIT_ID,
    name: "Axen Work",
    description: "Empresa inmobiliaria y de construcción de Axen Capital.",
    observations: "Unidad integrada desde 04_AxenWork_Evaluacion_v1.docx; solo se habilitaron formatos por puesto.",
  }),
  businessUnitFromEvaluationDocument({
    id: AXEN_UP_UNIT_ID,
    name: "Axen Up",
    description: "Gestión de capitales, trading algorítmico y manual de Axen Capital.",
    responsible: "Director General de Área",
    observations: "Unidad integrada desde 05_AxenUp_Evaluacion_v1.docx; solo se habilitaron formatos por puesto.",
  }),
  businessUnitFromEvaluationDocument({
    id: MARCA_DANTE_UNIT_ID,
    name: "Marca Dante Eludier",
    description: "Marca personal, libros, conferencias, podcast y experiencias de Dante Eludier.",
    observations: "Unidad integrada desde 08_MarcaDante_Evaluacion_v1.docx; solo se habilitaron formatos por puesto.",
  }),
  axenBrokerBusinessUnit,
  ...getFocusOnlyBusinessUnits(),
];

export const additionalPositions = [
  ...axenEnergyPositions,
  ...axenHealthPositions,
  ...positionsFromEvaluationDocuments(AXEN_WORK_UNIT_ID, axenWorkFormats),
  ...positionsFromEvaluationDocuments(AXEN_UP_UNIT_ID, axenUpFormats),
  ...positionsFromEvaluationDocuments(MARCA_DANTE_UNIT_ID, marcaDanteFormats),
  ...axenLifePositions,
  ...axenBrokerPositions,
];

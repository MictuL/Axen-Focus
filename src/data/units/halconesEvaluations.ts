import { createPositionId } from "../../lib/catalog";
import { calculateFinalScore, getPerformanceStatus, getTrend } from "../../lib/evaluation";
import type { Evaluation, Position } from "../../types";
import { HALCONES_UNIT_ID, halconesPositions } from "./halcones";

interface Profile {
  name: string;
  positionId: string;
  scores: [number, number, number, number, number][];
  incidents?: string[];
}

const periods = [
  { date: "2026-03-10", period: "Marzo", week: "11", month: "Marzo" },
  { date: "2026-04-10", period: "Abril", week: "15", month: "Abril" },
  { date: "2026-05-10", period: "Mayo", week: "19", month: "Mayo" },
  { date: "2026-06-02", period: "Junio", week: "23", month: "Junio" },
];

const profiles: Profile[] = [
  { name: "Sergio Valdés", positionId: "dt-premier", scores: [[4, 4, 4, 4, 4], [4, 4, 5, 4, 4], [5, 5, 4, 5, 4], [5, 5, 5, 5, 5]] },
  { name: "Rodrigo Lara", positionId: "jugadores", scores: [[4, 4, 4, 4, 4], [3, 3, 3, 3, 3], [3, 2, 2, 3, 2], [2, 2, 2, 2, 2]], incidents: ["", "Llegadas tardías a entrenamiento", "Llegadas tardías a entrenamiento", "Llegadas tardías a entrenamiento"] },
  { name: "Mariana Ríos", positionId: "fisioterapeuta", scores: [[4, 4, 4, 5, 4], [4, 5, 4, 5, 5], [5, 5, 4, 5, 5], [5, 5, 5, 5, 5]] },
  { name: "Alan Montes", positionId: "chofer", scores: [[3, 4, 3, 3, 4], [4, 3, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 5, 4, 4]] },
  { name: "Paola Herrera", positionId: "nutriologo", scores: [[4, 4, 5, 4, 5], [4, 5, 5, 5, 5], [5, 5, 5, 5, 5], [5, 5, 5, 5, 5]] },
  { name: "Iván Torres", positionId: "secretario-tdp-varonil", scores: [[4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [3, 4, 4, 4, 4], [4, 4, 4, 4, 4]] },
  { name: "Rocío Salinas", positionId: "experiencia-cliente", scores: [[3, 3, 4, 4, 3], [4, 4, 4, 4, 4], [5, 4, 4, 5, 4], [5, 5, 4, 5, 5]] },
  { name: "Miguel Zavala", positionId: "campero", scores: [[5, 4, 4, 4, 4], [5, 4, 5, 5, 4], [5, 5, 5, 5, 5], [5, 5, 5, 5, 5]] },
  { name: "Lucía Paredes", positionId: "doctor", scores: [[4, 4, 4, 4, 4], [4, 4, 3, 4, 4], [4, 4, 4, 4, 5], [4, 5, 4, 5, 5]] },
  { name: "Carmen Solís", positionId: "coordinador-administrativo", scores: [[3, 3, 3, 4, 3], [3, 4, 3, 4, 3], [4, 4, 3, 4, 4], [4, 4, 4, 4, 4]] },
];

function requirePosition(positionId: string): Position {
  const value = halconesPositions.find((item) => item.id === createPositionId(HALCONES_UNIT_ID, positionId));
  if (!value) throw new Error(`Puesto seed no encontrado: ${positionId}`);
  return value;
}

function makeEvaluation(profile: Profile, index: number, sequence: number, previous?: Evaluation): Evaluation {
  const position = requirePosition(profile.positionId);
  const [kpi1, kpi2, kpi3, generalComplianceScore, evidenceIncidentScore] = profile.scores[index];
  const finalScore = calculateFinalScore([kpi1, kpi2, kpi3], generalComplianceScore, evidenceIncidentScore);
  const period = periods[index];
  const incidents = profile.incidents?.[index] ?? "";
  return {
    id: `HAL-${String(sequence).padStart(3, "0")}`,
    businessUnitId: HALCONES_UNIT_ID,
    area: position.area,
    positionId: position.id,
    positionName: position.name,
    rep: position.rep,
    evaluatedPersonName: profile.name,
    evaluatorName: "Coordinación de Rendimiento",
    date: period.date,
    period: period.period,
    week: period.week,
    month: period.month,
    season: "2026 Apertura",
    evaluatedActivity: "Seguimiento operativo mensual",
    captureSource: index % 3 === 0 ? "Físico" : "Digital",
    kpis: [
      { ...position.kpis[0], score: kpi1 },
      { ...position.kpis[1], score: kpi2 },
      { ...position.kpis[2], score: kpi3 },
    ],
    generalComplianceScore,
    evidenceIncidentScore,
    observations: incidents ? "Requiere seguimiento puntual durante el siguiente periodo." : "Cumplimiento documentado conforme al seguimiento mensual.",
    incidents,
    improvementAction: incidents ? "Plan de mejora con revisión semanal." : "Mantener seguimiento mensual y evidencia operativa.",
    followUpDate: "2026-06-30",
    finalScore,
    status: getPerformanceStatus(finalScore),
    trend: getTrend(finalScore, previous?.finalScore),
    digitalCaptureDate: period.date,
  };
}

export const halconesSeedEvaluations: Evaluation[] = profiles.flatMap((profile, profileIndex) => {
  const series: Evaluation[] = [];
  periods.forEach((_, periodIndex) => series.push(makeEvaluation(profile, periodIndex, profileIndex * periods.length + periodIndex + 1, series.at(-1))));
  return series;
});

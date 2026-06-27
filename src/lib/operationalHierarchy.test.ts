import { describe, expect, it } from "vitest";
import type { Evaluation, Position, UnitConditionReview } from "../types";
import { getOperationalHierarchy, getOperationalTrendSeries } from "./operationalHierarchy";

const position = (id: string, name: string, area: string): Position => ({
  id,
  businessUnitId: "unit",
  name,
  area,
  rep: "Producto",
  kpis: [{ name: "KPI", description: "Descripción" }],
  suggestedFrequency: "Semanal",
  suggestedEvidence: "Evidencia",
  suggestedEvaluator: "Responsable",
  status: "active",
  isEvaluable: true,
});

const evaluation = (id: string, positionId: string, positionName: string, score: number): Evaluation => ({
  id,
  businessUnitId: "unit",
  area: "Ventas",
  positionId,
  positionName,
  rep: "Producto",
  evaluatedPersonName: id,
  evaluatorName: "Admin",
  date: "2026-06-13",
  period: "Semana 24 · Junio 2026",
  week: "24",
  month: "Junio",
  season: "2026",
  evaluatedActivity: "Evaluación",
  captureSource: "Digital",
  kpis: [],
  generalComplianceScore: 5,
  evidenceIncidentScore: 5,
  observations: "",
  incidents: "",
  improvementAction: "",
  followUpDate: "",
  finalScore: score,
  status: "Bueno",
  trend: "Sin histórico",
  digitalCaptureDate: "2026-06-13",
});

const review = (source: Evaluation[]): UnitConditionReview => ({
  id: "review-manager",
  businessUnitId: "unit",
  operationalLevel: "Supervisión",
  positionId: "manager",
  positionName: "Gerente Comercial",
  sourceLevel: "Ejecución",
  score: 80,
  condition: "Afluencia",
  evaluationIds: source.map((item) => item.id),
  sourceReviewIds: [],
  reviewerName: "Gerente",
  date: "2026-06-13",
  period: "Semana 24 · Junio 2026",
  finalComments: "Lectura",
  detectedCauses: "Causa",
  actionPlan: "Acción",
  followUpDate: "2026-06-20",
  createdAt: "2026-06-13T12:00:00.000Z",
});

describe("operational hierarchy", () => {
  const positions = [
    position("director", "Director General UDN", "Dirección"),
    position("manager", "Gerente Comercial", "Ventas"),
    position("seller", "Ejecutivo Comercial", "Ventas"),
  ];
  const evaluations = [
    evaluation("seller-a", "seller", "Ejecutivo Comercial", 60),
    evaluation("seller-b", "seller", "Ejecutivo Comercial", 100),
    evaluation("manager-old", "manager", "Gerente Comercial", 10),
  ];

  it("uses only execution evaluations and derives planning without freezing the result on pending actions", () => {
    const hierarchy = getOperationalHierarchy(evaluations, positions, [], "unit");

    expect(hierarchy.execution.score).toBe(80);
    expect(hierarchy.supervision[0].score).toBe(80);
    expect(hierarchy.planning[0]).toMatchObject({ score: 80, ready: true });
    expect(hierarchy.unit).toMatchObject({ score: 80, ready: true });
  });

  it("promotes the supervision result to planning and the unit after the manager review", () => {
    const execution = evaluations.filter((item) => item.positionId === "seller");
    const hierarchy = getOperationalHierarchy(evaluations, positions, [review(execution)], "unit");

    expect(hierarchy.supervision[0].reviewCurrent).toBe(true);
    expect(hierarchy.planning[0].score).toBe(80);
    expect(hierarchy.unit).toMatchObject({ score: 80, ready: true });
  });

  it("updates manager, director and unit trends from collaborator periods", () => {
    const older = {
      ...evaluation("seller-period-1", "seller", "Ejecutivo Comercial", 60),
      collaboratorProfileId: "seller-profile",
      evaluatedPersonName: "Colaborador",
      date: "2026-06-08",
      period: "Semana 24 · Junio 2026",
      performanceIndex: 60,
    };
    const current = {
      ...evaluation("seller-period-2", "seller", "Ejecutivo Comercial", 90),
      collaboratorProfileId: "seller-profile",
      evaluatedPersonName: "Colaborador",
      date: "2026-06-15",
      period: "Semana 25 · Junio 2026",
      performanceIndex: 90,
    };
    const history = [older, current];
    const hierarchy = getOperationalHierarchy([current], positions, [], "unit", history);

    expect(hierarchy.supervision[0]).toMatchObject({ score: 90, condition: "Normal" });
    expect(hierarchy.planning[0]).toMatchObject({ score: 90, condition: "Normal" });
    expect(hierarchy.unit).toMatchObject({ score: 90, condition: "Normal", ready: true });
    expect(getOperationalTrendSeries(history, positions, "unit", { level: "Supervisión", positionId: "manager" }).map((point) => point.score)).toEqual([60, 90]);
    expect(getOperationalTrendSeries(history, positions, "unit", { level: "Planeación", positionId: "director" }).map((point) => point.condition)).toEqual(["Inexistencia", "Normal"]);
    expect(getOperationalTrendSeries(history, positions, "unit", { level: "UDN" }).map((point) => point.score)).toEqual([60, 90]);
  });

  it("routes execution directly to planning when the unit has no managers", () => {
    const directPositions = [
      position("direct-director", "Director General UDN", "Dirección"),
      position("direct-seller", "Ejecutivo Comercial", "Ventas"),
    ];
    const older = {
      ...evaluation("direct-period-1", "direct-seller", "Ejecutivo Comercial", 55),
      collaboratorProfileId: "direct-profile",
      evaluatedPersonName: "Colaborador directo",
      date: "2026-06-08",
      period: "Semana 24 · Junio 2026",
      performanceIndex: 55,
    };
    const current = {
      ...evaluation("direct-period-2", "direct-seller", "Ejecutivo Comercial", 85),
      collaboratorProfileId: "direct-profile",
      evaluatedPersonName: "Colaborador directo",
      date: "2026-06-15",
      period: "Semana 25 · Junio 2026",
      performanceIndex: 85,
    };
    const history = [older, current];
    const hierarchy = getOperationalHierarchy([current], directPositions, [], "unit", history);

    expect(hierarchy.supervision).toEqual([]);
    expect(hierarchy.planning[0]).toMatchObject({
      sourceLevel: "Ejecución",
      score: 85,
      condition: "Normal",
      ready: true,
    });
    expect(hierarchy.unit).toMatchObject({ score: 85, condition: "Normal", ready: true });
    expect(getOperationalTrendSeries(history, directPositions, "unit", { level: "Planeación" }).map((point) => point.score)).toEqual([55, 85]);
    expect(getOperationalTrendSeries(history, directPositions, "unit", { level: "UDN" }).map((point) => point.score)).toEqual([55, 85]);
  });
});

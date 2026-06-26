import type { Evaluation, Position } from "../types";
import { getOperationalLevel, isPositionReady } from "./catalog";

export type WeeklyEvaluationStatus = "pending" | "overdue" | "upcoming";

export type WeeklyEvaluationItem = {
  position: Position;
  latestEvaluation?: Evaluation;
  dueDate: string;
  daysUntilDue: number;
  status: WeeklyEvaluationStatus;
};

function dateAtNoon(value: string) {
  return new Date(`${value}T12:00:00`);
}

function dateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function getIsoWeek(dateValue: string) {
  const date = dateAtNoon(dateValue);
  if (Number.isNaN(date.getTime())) return 0;
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getEvaluationPeriod(dateValue: string) {
  const date = dateAtNoon(dateValue);
  if (Number.isNaN(date.getTime())) return { period: "", week: "", month: "", season: "" };
  const year = date.getFullYear();
  const week = getIsoWeek(dateValue);
  const month = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(date).replace(/^./, (letter) => letter.toUpperCase());
  return {
    period: `Semana ${week} · ${month} ${year}`,
    week: String(week),
    month,
    season: String(year),
  };
}

export function getCurrentPeriodEvaluations(evaluations: Evaluation[], referenceDate: string) {
  const period = getEvaluationPeriod(referenceDate).period;
  return period ? evaluations.filter((evaluation) => evaluation.period === period) : [];
}

export function getWeeklyEvaluationSchedule(positions: Position[], evaluations: Evaluation[], businessUnitId: string, today = new Date()) {
  const todayString = dateString(today);
  const todayTime = dateAtNoon(todayString).getTime();
  const currentPeriod = getEvaluationPeriod(todayString).period;
  return positions
    .filter((position) => position.businessUnitId === businessUnitId && position.status === "active" && isPositionReady(position) && getOperationalLevel(position) === "Ejecución")
    .map((position): WeeklyEvaluationItem => {
      const positionEvaluations = evaluations
        .filter((evaluation) => evaluation.businessUnitId === businessUnitId && evaluation.positionId === position.id)
        .sort((a, b) => b.date.localeCompare(a.date));
      const latestEvaluation = positionEvaluations[0];
      if (!latestEvaluation) {
        return { position, latestEvaluation, dueDate: todayString, daysUntilDue: 0, status: "pending" };
      }
      const currentEvaluation = positionEvaluations.find((evaluation) => evaluation.period === currentPeriod);
      if (!currentEvaluation) {
        return { position, latestEvaluation, dueDate: todayString, daysUntilDue: 0, status: "overdue" };
      }
      const due = dateAtNoon(currentEvaluation.date);
      due.setDate(due.getDate() + 7);
      const dueDate = dateString(due);
      const daysUntilDue = Math.ceil((dateAtNoon(dueDate).getTime() - todayTime) / 86400000);
      return {
        position,
        latestEvaluation: currentEvaluation,
        dueDate,
        daysUntilDue,
        status: daysUntilDue <= 0 ? "overdue" : "upcoming",
      };
    })
    .sort((a, b) => {
      const priority = { pending: 0, overdue: 1, upcoming: 2 };
      return priority[a.status] - priority[b.status] || a.daysUntilDue - b.daysUntilDue || a.position.name.localeCompare(b.position.name, "es");
    });
}

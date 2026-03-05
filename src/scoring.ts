import type { AlertSeverity, DoctorStatus, MedicineStatus, PHCAlert } from "./types.js";

export interface ReadinessInputs {
  doctorStatus: DoctorStatus;
  queueCount: number;
  avgConsultMins: number;
  alerts: PHCAlert[];
  medicines: Record<string, MedicineStatus>;
}

export interface ReadinessBreakdown {
  queueScore: number;
  staffScore: number;
  medicinesScore: number;
  alertsScore: number;
  readinessScore: number;
  predictedWaitMins: number | null;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function staffAvailabilityScore(status: DoctorStatus): number {
  switch (status) {
    case "Available": return 100;
    case "Busy": return 60;
    case "Break": return 40;
    case "OffDuty": return 0;
    default: return 0;
  }
}

function medicineScore(meds: Record<string, MedicineStatus>): number {
  const values = Object.values(meds ?? {});
  if (values.length === 0) return 100; // if not provided, don't penalize in MVP
  const scoreOf = (s: MedicineStatus) => (s === "Available" ? 100 : s === "Low" ? 50 : 0);
  const sum = values.reduce((acc, s) => acc + scoreOf(s), 0);
  return clamp(Math.round(sum / values.length), 0, 100);
}

function severityPenalty(sev: AlertSeverity): number {
  // higher penalty => lower score
  switch (sev) {
    case "info": return 10;
    case "warning": return 25;
    case "critical": return 45;
    default: return 10;
  }
}

function alertsScore(alerts: { severity: AlertSeverity }[]): number {
  if (!alerts || alerts.length === 0) return 100;
  const totalPenalty = alerts.reduce((acc, a) => acc + severityPenalty(a.severity), 0);
  // cap penalty to avoid negative scores
  return clamp(100 - Math.min(80, totalPenalty), 0, 100);
}

export function predictedWaitMins(queueCount: number, avgConsultMins: number, doctorStatus: DoctorStatus): number | null {
  if (doctorStatus === "OffDuty") return null;
  const q = clamp(Math.floor(queueCount ?? 0), 0, 999);
  const avg = clamp(Math.round(avgConsultMins ?? 6), 1, 30);
  return clamp(q * avg, 0, 180);
}

export function computeReadiness(input: ReadinessInputs, opts?: { queueMax?: number }): ReadinessBreakdown {
  const queueMax = opts?.queueMax ?? 30;

  const queueCount = clamp(Math.floor(input.queueCount ?? 0), 0, 999);
  const queueScore = clamp(Math.round(100 - (queueCount / queueMax) * 100), 0, 100);

  const staffScore = staffAvailabilityScore(input.doctorStatus);
  const medicinesScore = medicineScore(input.medicines ?? {});
  const alertsScoreVal = alertsScore(input.alerts ?? []);

  const readinessScore = clamp(
    Math.round(0.4 * queueScore + 0.3 * staffScore + 0.2 * medicinesScore + 0.1 * alertsScoreVal),
    0,
    100
  );

  const wait = predictedWaitMins(queueCount, input.avgConsultMins ?? 6, input.doctorStatus);

  return {
    queueScore,
    staffScore,
    medicinesScore,
    alertsScore: alertsScoreVal,
    readinessScore,
    predictedWaitMins: wait
  };
}

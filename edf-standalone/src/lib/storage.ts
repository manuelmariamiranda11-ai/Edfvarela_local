import { computeEscalao } from "./event-config";

export interface Registration {
  id: number;
  name: string;
  birthYear: number;
  escalao: string;
  schoolYear: string;
  className: string;
  gender: "M" | "F";
  selectedActivities: string[];
  activityScores: Record<string, number | null>;
  absent: boolean;
  createdAt: string;
  average: number | null;
}

const REGISTRATIONS_KEY = "edf_registrations";
const SESSION_KEY = "edf_admin_session";
const ADMIN_USERNAME = "edfvarela026";
const ADMIN_PASSWORD = "varelaedf026";

function computeAverage(
  reg: Pick<Registration, "selectedActivities" | "activityScores">
): number | null {
  const scores = reg.selectedActivities
    .map((name) => reg.activityScores[name] ?? null)
    .filter((v): v is number => v !== null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function migrateReg(r: Record<string, unknown>): Registration {
  if (r.activityScores) {
    return {
      ...(r as unknown as Registration),
      escalao: (r.escalao as string) ?? computeEscalao(r.birthYear as number),
      gender: (r.gender as "M" | "F") ?? "M",
    };
  }
  const oldSel: number[] = (r.selectedActivities as number[]) ?? [1, 2, 3, 4, 5];
  const activityScores: Record<string, number | null> = {};
  oldSel.forEach((n) => {
    activityScores[`Atividade ${n}`] = (r[`activity${n}`] as number | null) ?? null;
  });
  return {
    id: r.id as number,
    name: r.name as string,
    birthYear: r.birthYear as number,
    escalao: computeEscalao(r.birthYear as number),
    schoolYear: r.schoolYear as string,
    className: r.className as string,
    gender: (r.gender as "M" | "F") ?? "M",
    selectedActivities: oldSel.map((n) => `Atividade ${n}`),
    activityScores,
    absent: (r.absent as boolean) ?? false,
    createdAt: r.createdAt as string,
    average: (r.average as number | null) ?? null,
  };
}

export function getRegistrations(): Registration[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    const regs = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    return regs.map(migrateReg);
  } catch {
    return [];
  }
}

function save(regs: Registration[]): void {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
}

export function createRegistration(data: {
  name: string;
  birthYear: number;
  schoolYear: string;
  className: string;
  gender: "M" | "F";
  selectedActivities: string[];
}): Registration {
  const regs = getRegistrations();
  const id = regs.length > 0 ? Math.max(...regs.map((r) => r.id)) + 1 : 1;
  const activityScores: Record<string, number | null> = {};
  data.selectedActivities.forEach((name) => { activityScores[name] = null; });
  const reg: Registration = {
    id,
    name: data.name,
    birthYear: data.birthYear,
    escalao: computeEscalao(data.birthYear),
    schoolYear: data.schoolYear,
    className: data.className,
    gender: data.gender,
    selectedActivities: data.selectedActivities,
    activityScores,
    absent: false,
    createdAt: new Date().toISOString(),
    average: null,
  };
  save([...regs, reg]);
  return reg;
}

export function deleteRegistration(id: number): void {
  save(getRegistrations().filter((r) => r.id !== id));
}

export function updateScores(
  id: number,
  activityScores: Record<string, number | null>
): Registration | null {
  const regs = getRegistrations();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated: Registration = { ...regs[idx], activityScores };
  updated.average = computeAverage(updated);
  regs[idx] = updated;
  save(regs);
  return updated;
}

export function toggleAbsent(id: number, absent: boolean): Registration | null {
  const regs = getRegistrations();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  regs[idx] = { ...regs[idx], absent };
  save(regs);
  return regs[idx];
}

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

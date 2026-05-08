export interface Registration {
  id: number;
  name: string;
  birthYear: number;
  schoolYear: string;
  className: string;
  activity1: number | null;
  activity2: number | null;
  activity3: number | null;
  activity4: number | null;
  activity5: number | null;
  absent: boolean;
  createdAt: string;
  average: number | null;
}

const REGISTRATIONS_KEY = "edf_registrations";
const SESSION_KEY = "edf_admin_session";
const ADMIN_USERNAME = "edfvarela026";
const ADMIN_PASSWORD = "varelaedf026";

function computeAverage(
  reg: Pick<Registration, "activity1" | "activity2" | "activity3" | "activity4" | "activity5">
): number | null {
  const scores = [reg.activity1, reg.activity2, reg.activity3, reg.activity4, reg.activity5].filter(
    (v): v is number => v !== null
  );
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function getRegistrations(): Registration[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    return raw ? (JSON.parse(raw) as Registration[]) : [];
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
}): Registration {
  const regs = getRegistrations();
  const id = regs.length > 0 ? Math.max(...regs.map((r) => r.id)) + 1 : 1;
  const reg: Registration = {
    id,
    name: data.name,
    birthYear: data.birthYear,
    schoolYear: data.schoolYear,
    className: data.className,
    activity1: null,
    activity2: null,
    activity3: null,
    activity4: null,
    activity5: null,
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
  scores: {
    activity1: number | null;
    activity2: number | null;
    activity3: number | null;
    activity4: number | null;
    activity5: number | null;
  }
): Registration | null {
  const regs = getRegistrations();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated: Registration = { ...regs[idx], ...scores };
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

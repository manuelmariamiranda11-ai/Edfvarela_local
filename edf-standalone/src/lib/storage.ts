import { computeEscalao } from "./event-config";

export interface Teacher {
  id: string;
  username: string;
  password: string;
  displayName: string;
}

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
  activityNA: Record<string, boolean>;
  activityEscaloes: Record<string, boolean>;
  absent: boolean;
  arbitro: boolean;
  createdAt: string;
  average: number | null;
  teacherId: string;
  teacherName: string;
}

const TEACHERS_KEY = "edf_teachers";
const REGISTRATIONS_KEY = "edf_registrations";
const SESSION_KEY = "edf_session_teacher";

// ─── Teachers ────────────────────────────────────────────────
export function getTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(TEACHERS_KEY);
    return raw ? (JSON.parse(raw) as Teacher[]) : [];
  } catch {
    return [];
  }
}

export function registerTeacher(data: {
  username: string;
  password: string;
  displayName: string;
}): Teacher | string {
  const teachers = getTeachers();
  if (teachers.find((t) => t.username === data.username)) {
    return "Nome de utilizador já existe.";
  }
  const teacher: Teacher = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...data,
  };
  localStorage.setItem(TEACHERS_KEY, JSON.stringify([...teachers, teacher]));
  return teacher;
}

export function adminLogin(username: string, password: string): boolean {
  const teacher = getTeachers().find(
    (t) => t.username === username && t.password === password
  );
  if (teacher) {
    sessionStorage.setItem(SESSION_KEY, teacher.id);
    return true;
  }
  return false;
}

export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getCurrentTeacher(): Teacher | null {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getTeachers().find((t) => t.id === id) ?? null;
}

export function isAdminLoggedIn(): boolean {
  return !!getCurrentTeacher();
}

// ─── Registrations ───────────────────────────────────────────
function computeAverage(
  reg: Pick<Registration, "selectedActivities" | "activityScores" | "activityNA">
): number | null {
  const scores = reg.selectedActivities
    .filter((name) => !reg.activityNA?.[name])
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
      arbitro: (r.arbitro as boolean) ?? false,
      activityNA: (r.activityNA as Record<string, boolean>) ?? {},
      activityEscaloes: (r.activityEscaloes as Record<string, boolean>) ?? {},
      teacherId: (r.teacherId as string) ?? "legacy",
      teacherName: (r.teacherName as string) ?? "—",
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
    activityNA: {},
    activityEscaloes: {},
    absent: (r.absent as boolean) ?? false,
    arbitro: (r.arbitro as boolean) ?? false,
    createdAt: r.createdAt as string,
    average: (r.average as number | null) ?? null,
    teacherId: (r.teacherId as string) ?? "legacy",
    teacherName: (r.teacherName as string) ?? "—",
  };
}

function getAllRegistrations(): Registration[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    const regs = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    return regs.map(migrateReg);
  } catch {
    return [];
  }
}

export function getRegistrations(): Registration[] {
  const teacher = getCurrentTeacher();
  if (!teacher) return [];
  return getAllRegistrations().filter((r) => r.teacherId === teacher.id);
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
  activityEscaloes?: Record<string, boolean>;
  teacherId: string;
  teacherName: string;
}): Registration {
  const all = getAllRegistrations();
  const id = all.length > 0 ? Math.max(...all.map((r) => r.id)) + 1 : 1;
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
    activityNA: {},
    activityEscaloes: data.activityEscaloes ?? {},
    absent: false,
    arbitro: false,
    createdAt: new Date().toISOString(),
    average: null,
    teacherId: data.teacherId,
    teacherName: data.teacherName,
  };
  save([...all, reg]);
  return reg;
}

export function importRegistrations(rows: {
  name: string;
  birthYear: number;
  schoolYear: string;
  className: string;
  gender: "M" | "F";
  selectedActivities?: string[];
  activityScores?: Record<string, number | null>;
}[], teacherId: string, teacherName: string): number {
  const all = getAllRegistrations();
  let nextId = all.length > 0 ? Math.max(...all.map((r) => r.id)) + 1 : 1;
  const newRegs: Registration[] = rows.map((row) => {
    const selectedActivities = row.selectedActivities ?? [];
    const activityScores = row.activityScores ?? {};
    const reg: Registration = {
      id: nextId++,
      name: row.name,
      birthYear: row.birthYear,
      escalao: computeEscalao(row.birthYear),
      schoolYear: row.schoolYear,
      className: row.className,
      gender: row.gender,
      selectedActivities,
      activityScores,
      activityNA: {},
      activityEscaloes: {},
      absent: false,
      arbitro: false,
      createdAt: new Date().toISOString(),
      average: computeAverage({ selectedActivities, activityScores, activityNA: {} }),
      teacherId,
      teacherName,
    };
    return reg;
  });
  save([...all, ...newRegs]);
  return newRegs.length;
}

export function toggleArbitro(id: number, arbitro: boolean): Registration | null {
  const all = getAllRegistrations();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], arbitro };
  save(all);
  return all[idx];
}

export function deleteRegistration(id: number): void {
  save(getAllRegistrations().filter((r) => r.id !== id));
}

export function updateScores(
  id: number,
  activityScores: Record<string, number | null>,
  activityNA?: Record<string, boolean>,
  selectedActivities?: string[]
): Registration | null {
  const all = getAllRegistrations();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated: Registration = {
    ...all[idx],
    activityScores,
    activityNA: activityNA ?? all[idx].activityNA ?? {},
    selectedActivities: selectedActivities ?? all[idx].selectedActivities,
  };
  updated.average = computeAverage(updated);
  all[idx] = updated;
  save(all);
  return updated;
}

export function deleteTeacher(teacherId: string): void {
  const teachers = getTeachers().filter((t) => t.id !== teacherId);
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
  if (sessionStorage.getItem(SESSION_KEY) === teacherId) {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function toggleAbsent(id: number, absent: boolean): Registration | null {
  const all = getAllRegistrations();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], absent };
  save(all);
  return all[idx];
}

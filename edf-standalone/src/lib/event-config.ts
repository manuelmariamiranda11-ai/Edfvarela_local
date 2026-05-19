export interface EventConfig {
  period: string;
  activities: string[];
  teacherId?: string;
  teacherName?: string;
}

export const PERIODS = ["1.º Período", "2.º Período", "3.º Período"];

export const PRESET_ACTIVITIES = [
  "Corta Mato",
  "Torneio Inter-Turmas",
  "Atletismo",
  "Natação",
  "Futebol",
  "Basquetebol",
  "Voleibol",
  "Badminton",
  "Ténis de Mesa",
  "Ginástica",
  "Andebol",
  "Rugby",
];

export const ESCALOES = ["Benjamins", "Traquinas", "Infantis", "Iniciados", "Juvenis"];

export function computeEscalao(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear;
  if (age <= 9) return "Benjamins";
  if (age <= 11) return "Traquinas";
  if (age <= 13) return "Infantis";
  if (age <= 15) return "Iniciados";
  return "Juvenis";
}

export function encodeEventConfig(config: EventConfig): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(config))));
}

export function decodeEventConfig(encoded: string): EventConfig | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded)))) as EventConfig;
  } catch {
    return null;
  }
}

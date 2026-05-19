export interface EventConfig {
  period: string;
  activities: string[];
  teacherId?: string;
  teacherName?: string;
}

export const PERIODS = ["1.º Período", "2.º Período", "3.º Período"];

export const PRESET_ACTIVITY_GROUPS: { group: string; activities: string[] }[] = [
  {
    group: "Atletismo",
    activities: ["Corta Mato Escolar"],
  },
  {
    group: "Megasprint Escolar",
    activities: [
      "Megasprint — Quilómetro",
      "Megasprint — Sprint 40m",
      "Megasprint — Lançamento",
      "Megasprint — Salto em Comprimento",
    ],
  },
  {
    group: "Desportos Coletivos",
    activities: [
      "Torneio Inter-Turmas",
      "Badminton",
      "Voleibol",
      "Basquetebol",
      "Corfebol",
      "Jogo do Queimado",
    ],
  },
  {
    group: "Outros",
    activities: ["Dia Internacional da Dança"],
  },
];

export const PRESET_ACTIVITIES = PRESET_ACTIVITY_GROUPS.flatMap((g) => g.activities);

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

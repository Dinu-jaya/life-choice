export type Stats = { skills: number; money: number; happiness: number };

export type SceneChoice = {
  text: string;
  effects: Stats;
  consequence: string;
};

export type Scene = {
  id: string;
  title: string;
  description: string;
  choices: SceneChoice[];
  imageUrl?: string;
  imageStatus: "loading" | "ready" | "failed";
};

export type HistoryEntry = { scene: string; choice: string };

export type Phase = "welcome" | "playing" | "ended";

export type EndingKey = "successful" | "balanced" | "burnout";

export type GameState = {
  version: number;
  phase: Phase;
  playerName: string;
  turn: number;
  totalTurns: number;
  stats: Stats;
  history: HistoryEntry[];
  currentScene: Scene | null;
  ending: { key: EndingKey; imageUrl?: string; imageStatus: "loading" | "ready" | "failed" } | null;
};

export const SAVE_VERSION = 2;
export const SAVE_KEY = "lds.save.v2";

export const INITIAL_STATS: Stats = { skills: 30, money: 30, happiness: 60 };

export function clampStat(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyEffects(stats: Stats, effects: Stats): Stats {
  return {
    skills: clampStat(stats.skills + effects.skills),
    money: clampStat(stats.money + effects.money),
    happiness: clampStat(stats.happiness + effects.happiness),
  };
}

export function computeEnding(stats: Stats): EndingKey {
  const { skills, money, happiness } = stats;
  if (skills >= 60 && money >= 55) return "successful";
  if (happiness >= 60 && skills >= 35) return "balanced";
  if (skills < 30 && money < 30 && happiness < 35) return "burnout";
  return happiness >= money ? "balanced" : "successful";
}

export const ENDINGS: Record<
  EndingKey,
  { title: string; blurb: string; vibe: string }
> = {
  successful: {
    title: "The Climb",
    blurb:
      "You traded sleep for momentum and it paid off. The job offer came through. People are starting to know your name. The view from up here is sharper, lonelier, and exactly what you wanted.",
    vibe: "young professional alone in a high-rise office at dusk, city lights, contemplative",
  },
  balanced: {
    title: "The Long Way Home",
    blurb:
      "You picked the people. Sunday dinners, a job that fits, someone who knows your coffee order. It's not a headline. It's a life — and most days, that's the better deal.",
    vibe: "warm intimate kitchen scene at golden hour, friends laughing around a table",
  },
  burnout: {
    title: "The Reset",
    blurb:
      "Something cracked open. You stopped, finally. The semester behind you is a blur, but you're still here — and that means there's a next chapter to write differently.",
    vibe: "lone figure on a quiet beach at dawn, soft fog, hopeful stillness",
  },
};
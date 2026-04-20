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
  { title: string; emoji: string; blurb: string; vibe: string }
> = {
  successful: {
    title: "Successful Developer",
    emoji: "🚀",
    blurb:
      "You shipped your first big project, your inbox is full of cheers, and your future is glowing.",
    vibe: "triumphant developer celebrating with confetti",
  },
  balanced: {
    title: "Balanced Life",
    emoji: "🌱",
    blurb:
      "You found your rhythm — work that fits, friends who matter, and weekends that feel like vacation.",
    vibe: "cozy picnic with friends in a sunny park",
  },
  burnout: {
    title: "Time to Reset",
    emoji: "🌅",
    blurb:
      "Things got wobbly, but you booked a tiny trip, took a long nap, and tomorrow looks bright.",
    vibe: "peaceful hammock by a calm lake at sunrise",
  },
};
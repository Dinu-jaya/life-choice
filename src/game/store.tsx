import * as React from "react";
import { generateScene, generateSceneImage } from "@/server/game.functions";
import {
  type GameState,
  type Scene,
  type SceneChoice,
  INITIAL_STATS,
  SAVE_KEY,
  SAVE_VERSION,
  applyEffects,
  computeEnding,
  ENDINGS,
} from "./types";

type Action =
  | { type: "start"; name: string }
  | { type: "scene_loading" }
  | { type: "scene_ready"; scene: Scene }
  | { type: "scene_image"; status: "loading" | "ready" | "failed"; url?: string }
  | { type: "choose"; choice: SceneChoice }
  | { type: "end"; ending: GameState["ending"] }
  | { type: "ending_image"; status: "loading" | "ready" | "failed"; url?: string }
  | { type: "reset" }
  | { type: "hydrate"; state: GameState };

const TOTAL_TURNS = 7;

function initialState(): GameState {
  return {
    version: SAVE_VERSION,
    phase: "welcome",
    playerName: "",
    turn: 0,
    totalTurns: TOTAL_TURNS,
    stats: { ...INITIAL_STATS },
    history: [],
    currentScene: null,
    ending: null,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start":
      return { ...initialState(), phase: "playing", playerName: action.name, turn: 1 };
    case "scene_loading":
      return { ...state, currentScene: null };
    case "scene_ready":
      return { ...state, currentScene: action.scene };
    case "scene_image":
      if (!state.currentScene) return state;
      return {
        ...state,
        currentScene: {
          ...state.currentScene,
          imageStatus: action.status,
          imageUrl: action.url ?? state.currentScene.imageUrl,
        },
      };
    case "choose": {
      const newStats = applyEffects(state.stats, action.choice.effects);
      const newHistory = [
        ...state.history,
        {
          scene: state.currentScene?.title ?? "",
          choice: action.choice.text,
        },
      ].slice(-10);
      return {
        ...state,
        stats: newStats,
        history: newHistory,
        turn: state.turn + 1,
        currentScene: null,
      };
    }
    case "end":
      return { ...state, phase: "ended", ending: action.ending };
    case "ending_image":
      if (!state.ending) return state;
      return {
        ...state,
        ending: {
          ...state.ending,
          imageStatus: action.status,
          imageUrl: action.url ?? state.ending.imageUrl,
        },
      };
    case "reset":
      return initialState();
    case "hydrate":
      return action.state;
    default:
      return state;
  }
}

type Ctx = {
  state: GameState;
  start: (name: string) => void;
  choose: (choice: SceneChoice) => void;
  reset: () => void;
  loadingScene: boolean;
  sceneError: string | null;
  retryScene: () => void;
};

const GameContext = React.createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialState);
  const [loadingScene, setLoadingScene] = React.useState(false);
  const [sceneError, setSceneError] = React.useState<string | null>(null);
  const hydratedRef = React.useRef(false);

  // Hydrate from localStorage
  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        if (parsed.version === SAVE_VERSION) {
          // Clear in-flight loading flags from save
          if (parsed.currentScene) {
            parsed.currentScene.imageStatus =
              parsed.currentScene.imageUrl ? "ready" : "failed";
          }
          dispatch({ type: "hydrate", state: parsed });
        } else {
          localStorage.removeItem(SAVE_KEY);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist
  React.useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const fetchScene = React.useCallback(async () => {
    if (state.phase !== "playing") return;
    if (state.currentScene) return;
    setLoadingScene(true);
    setSceneError(null);
    try {
      const scene = await generateScene({
        data: {
          playerName: state.playerName,
          turn: state.turn,
          stats: state.stats,
          history: state.history,
        },
      });
      const sceneWithImage: Scene = { ...scene, imageStatus: "loading" };
      dispatch({ type: "scene_ready", scene: sceneWithImage });
      // Kick off image in parallel
      generateSceneImage({
        data: {
          title: scene.title,
          description: scene.description,
          playerName: state.playerName,
        },
      })
        .then((r) => dispatch({ type: "scene_image", status: "ready", url: r.imageUrl }))
        .catch(() => dispatch({ type: "scene_image", status: "failed" }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load scene";
      setSceneError(msg);
    } finally {
      setLoadingScene(false);
    }
  }, [state.phase, state.currentScene, state.playerName, state.turn, state.stats, state.history]);

  // Auto-load scene when needed
  React.useEffect(() => {
    if (state.phase === "playing" && !state.currentScene && state.turn <= state.totalTurns) {
      void fetchScene();
    }
  }, [state.phase, state.currentScene, state.turn, state.totalTurns, fetchScene]);

  // Trigger ending
  React.useEffect(() => {
    if (state.phase === "playing" && state.turn > state.totalTurns && !state.ending) {
      const key = computeEnding(state.stats);
      dispatch({
        type: "end",
        ending: { key, imageStatus: "loading" },
      });
    }
  }, [state.phase, state.turn, state.totalTurns, state.stats, state.ending]);

  // Generate ending image once
  const endingImageStartedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (state.phase !== "ended" || !state.ending) return;
    if (state.ending.imageUrl) return;
    if (endingImageStartedRef.current === state.ending.key) return;
    endingImageStartedRef.current = state.ending.key;
    const e = ENDINGS[state.ending.key];
    generateSceneImage({
      data: {
        title: e.title,
        description: e.blurb,
        playerName: state.playerName || "the hero",
        vibe: e.vibe,
      },
    })
      .then((r) => dispatch({ type: "ending_image", status: "ready", url: r.imageUrl }))
      .catch(() => dispatch({ type: "ending_image", status: "failed" }));
  }, [state.phase, state.ending, state.playerName]);

  const value: Ctx = {
    state,
    start: (name) => dispatch({ type: "start", name }),
    choose: (choice) => dispatch({ type: "choose", choice }),
    reset: () => {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        // ignore
      }
      endingImageStartedRef.current = null;
      dispatch({ type: "reset" });
    },
    loadingScene,
    sceneError,
    retryScene: fetchScene,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
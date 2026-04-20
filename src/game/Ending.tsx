import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGame } from "./store";
import { ENDINGS } from "./types";
import { SceneImage } from "./SceneImage";

export function Ending() {
  const { state, reset } = useGame();
  if (!state.ending) return null;
  const e = ENDINGS[state.ending.key];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-4 py-10"
    >
      <Card className="overflow-hidden p-0 shadow-xl">
        <div className="p-4 sm:p-6">
          <SceneImage
            url={state.ending.imageUrl}
            status={state.ending.imageStatus}
            alt={e.title}
          />
        </div>
        <div className="px-6 pb-8 text-center sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Your story
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            {e.title} {e.emoji}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{e.blurb}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {(["skills", "money", "happiness"] as const).map((k) => (
              <div key={k} className="rounded-xl border bg-card p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{state.stats[k]}</p>
              </div>
            ))}
          </div>

          {state.history.length > 0 && (
            <div className="mt-6 text-left">
              <p className="mb-2 text-sm font-semibold text-foreground">Your journey</p>
              <ol className="space-y-1.5 text-sm text-muted-foreground">
                {state.history.map((h, i) => (
                  <li key={i} className="rounded-lg bg-muted/50 px-3 py-2">
                    <span className="font-medium text-foreground">{h.scene}</span>
                    <span className="text-muted-foreground"> — {h.choice}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Button
            onClick={reset}
            className="mt-8 h-12 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-base font-semibold text-white hover:opacity-95"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Play Again
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
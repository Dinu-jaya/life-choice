import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-2xl px-4 py-10"
    >
      <div className="glass grain relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="p-3 sm:p-4">
          <SceneImage
            url={state.ending.imageUrl}
            status={state.ending.imageStatus}
            alt={e.title}
          />
        </div>
        <div className="px-6 pb-9 pt-2 text-center sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500/80">
            Your story
          </p>
          <h1 className="mt-3 text-balance bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
            {e.title}
          </h1>
          <p className="mt-4 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">{e.blurb}</p>

          <div className="mt-7 grid grid-cols-3 gap-3">
            {(["skills", "money", "happiness"] as const).map((k) => (
              <div key={k} className="rounded-2xl border border-foreground/10 bg-card/40 p-4 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums">{state.stats[k]}</p>
              </div>
            ))}
          </div>

          {state.history.length > 0 && (
            <div className="mt-7 text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">The chapters</p>
              <ol className="space-y-1.5 text-sm">
                {state.history.map((h, i) => (
                  <li key={i} className="rounded-xl border border-foreground/5 bg-card/30 px-3.5 py-2.5">
                    <span className="font-medium text-foreground">{h.scene}</span>
                    <span className="text-muted-foreground"> — {h.choice}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Button
            onClick={reset}
            className="mt-8 h-13 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-base font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40"
            style={{ height: "3.25rem" }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Live another life
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
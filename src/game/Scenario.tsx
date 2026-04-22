import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "./store";
import { SceneImage } from "./SceneImage";

export function Scenario() {
  const { state, choose, loadingScene, sceneError, retryScene } = useGame();
  const scene = state.currentScene;

  if (sceneError && !scene) {
    return (
      <div className="glass rounded-3xl p-10 text-center shadow-xl">
        <p className="mb-5 text-sm text-destructive">{sceneError}</p>
        <Button onClick={retryScene} variant="outline" className="rounded-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  if (loadingScene || !scene) {
    return (
      <div className="glass flex flex-col items-center justify-center gap-3 rounded-3xl p-16 shadow-xl">
        <Loader2 className="h-6 w-6 animate-spin text-fuchsia-500" />
        <p className="text-sm tracking-wide text-muted-foreground">
          Writing your next moment…
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass grain relative overflow-hidden rounded-3xl shadow-2xl"
      >
        <div className="p-3 sm:p-4">
          <SceneImage url={scene.imageUrl} status={scene.imageStatus} alt={scene.title} />
        </div>
        <div className="px-6 pb-7 pt-2 sm:px-9 sm:pb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-500/80">
            Chapter {state.turn}
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {scene.title}
          </h2>
          <p className="mt-4 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            {scene.description}
          </p>

          <div className="mt-7 space-y-2.5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              What do you do?
            </p>
            {scene.choices.map((c, i) => (
              <motion.button
                key={`${scene.id}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => choose(c)}
                className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-foreground/10 bg-card/40 px-5 py-4 text-left backdrop-blur-md transition-all hover:border-fuchsia-500/40 hover:bg-card/70 hover:shadow-lg hover:shadow-fuchsia-500/10"
              >
                <span className="font-medium leading-snug text-foreground">
                  {c.text}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-fuchsia-500" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGame } from "./store";
import { SceneImage } from "./SceneImage";

export function Scenario() {
  const { state, choose, loadingScene, sceneError, retryScene } = useGame();
  const scene = state.currentScene;

  if (sceneError && !scene) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-sm text-destructive">{sceneError}</p>
        <Button onClick={retryScene} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </Card>
    );
  }

  if (loadingScene || !scene) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Spinning up your next moment…</p>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="overflow-hidden p-0 shadow-lg">
          <div className="p-4 sm:p-5">
            <SceneImage url={scene.imageUrl} status={scene.imageStatus} alt={scene.title} />
          </div>
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {scene.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {scene.description}
            </p>
            <div className="mt-6 grid gap-2.5">
              {scene.choices.map((c, i) => (
                <motion.button
                  key={`${scene.id}-${i}`}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => choose(c)}
                  className="group rounded-xl border bg-card px-4 py-3.5 text-left transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <span className="font-medium text-foreground">{c.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
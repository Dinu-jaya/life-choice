import { createFileRoute } from "@tanstack/react-router";
import { GameProvider, useGame } from "@/game/store";
import { Welcome } from "@/game/Welcome";
import { Scenario } from "@/game/Scenario";
import { Ending } from "@/game/Ending";
import { StatsPanel } from "@/game/StatsPanel";
import { ThemeToggle } from "@/game/ThemeToggle";
import { MusicToggle } from "@/game/MusicToggle";
import { Background3D } from "@/game/Background3D";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function GameShell() {
  const { state, reset } = useGame();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background3D />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 shadow-lg shadow-violet-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Life Decisions</span>
        </div>
        <div className="flex items-center gap-1">
          {state.phase !== "welcome" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="rounded-full"
              aria-label="Restart"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" /> Restart
            </Button>
          )}
          <MusicToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        {state.phase === "welcome" && <Welcome />}
        {state.phase === "playing" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="order-2 lg:order-1">
              <Scenario />
            </div>
            <aside className="order-1 lg:order-2 lg:sticky lg:top-4 lg:self-start">
              <StatsPanel
                stats={state.stats}
                turn={state.turn}
                totalTurns={state.totalTurns}
              />
            </aside>
          </div>
        )}
        {state.phase === "ended" && <Ending />}
      </main>
    </div>
  );
}

function Index() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
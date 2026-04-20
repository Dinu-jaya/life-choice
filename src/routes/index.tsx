import { createFileRoute } from "@tanstack/react-router";
import { GameProvider, useGame } from "@/game/store";
import { Welcome } from "@/game/Welcome";
import { Scenario } from "@/game/Scenario";
import { Ending } from "@/game/Ending";
import { StatsPanel } from "@/game/StatsPanel";
import { ThemeToggle } from "@/game/ThemeToggle";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function GameShell() {
  const { state, reset } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">Life Decisions</span>
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
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12">
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
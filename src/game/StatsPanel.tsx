import { motion } from "framer-motion";
import { Brain, Coins, Smile } from "lucide-react";
import type { Stats } from "./types";

const items: Array<{
  key: keyof Stats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  { key: "skills", label: "Skills", icon: Brain, color: "from-fuchsia-500 to-violet-500" },
  { key: "money", label: "Money", icon: Coins, color: "from-amber-400 to-orange-500" },
  { key: "happiness", label: "Happiness", icon: Smile, color: "from-emerald-400 to-teal-500" },
];

export function StatsPanel({ stats, turn, totalTurns }: { stats: Stats; turn: number; totalTurns: number }) {
  return (
    <div className="rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Your Life
        </h3>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Turn {Math.min(turn, totalTurns)} / {totalTurns}
        </span>
      </div>
      <div className="space-y-3">
        {items.map(({ key, label, icon: Icon, color }) => {
          const value = stats[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <motion.span
                  key={value}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-mono text-sm tabular-nums text-foreground"
                >
                  {value}
                </motion.span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
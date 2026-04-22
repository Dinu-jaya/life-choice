import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "./store";

export function Welcome() {
  const { start } = useGame();
  const [name, setName] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    start(n);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto flex min-h-[78vh] max-w-2xl flex-col items-center justify-center px-4 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card/40 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-md"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
        </span>
        An interactive coming-of-age story
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7 }}
        className="text-balance bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl"
      >
        Every choice<br />
        <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
          builds a life.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-5 max-w-md text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        You're a college student. Seven turns. Real decisions about love,
        money, ambition, and who you want to become.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        onSubmit={submit}
        className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <Input
          autoFocus
          placeholder="What should we call you?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="h-13 flex-1 rounded-2xl border-foreground/15 bg-card/50 px-5 text-base backdrop-blur-md focus-visible:ring-fuchsia-500/40"
          style={{ height: "3.25rem" }}
        />
        <Button
          type="submit"
          disabled={!name.trim()}
          className="h-13 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-50"
          style={{ height: "3.25rem" }}
        >
          Begin <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-6 text-xs text-muted-foreground/70"
      >
        Mature themes. No graphic content. Your story saves automatically.
      </motion.p>
    </motion.div>
  );
}
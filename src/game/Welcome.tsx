import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
      className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-4 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -6, 6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="mb-6 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 p-5 shadow-xl"
      >
        <Sparkles className="h-10 w-10 text-white" />
      </motion.div>
      <h1 className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
        Life Decisions
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Seven joyful turns. Many tiny choices. One delightful future.
      </p>
      <form onSubmit={submit} className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <Input
          autoFocus
          placeholder="What's your name?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="h-12 rounded-xl text-center text-lg"
        />
        <Button
          type="submit"
          disabled={!name.trim()}
          className="h-12 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-base font-semibold text-white hover:opacity-95"
        >
          Begin Adventure ✨
        </Button>
      </form>
    </motion.div>
  );
}
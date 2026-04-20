import { motion, AnimatePresence } from "framer-motion";
import { ImageOff } from "lucide-react";

export function SceneImage({
  url,
  status,
  alt,
}: {
  url?: string;
  status: "loading" | "ready" | "failed";
  alt: string;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-fuchsia-200/40 via-amber-200/40 to-emerald-200/40 dark:from-fuchsia-900/30 dark:via-amber-900/30 dark:to-emerald-900/30" />
            <div className="shimmer absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium tracking-wide text-muted-foreground">
                Painting your scene…
              </span>
            </div>
          </motion.div>
        )}
        {status === "ready" && url && (
          <motion.img
            key={url}
            src={url}
            alt={alt}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {status === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground"
          >
            <ImageOff className="h-6 w-6" />
            <span className="text-xs">Picture unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
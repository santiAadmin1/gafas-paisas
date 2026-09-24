"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";

export function Landing({ onActivate }: { onActivate: () => void }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-brand-black px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(11,95,219,0.35),transparent_60%)]" />

      <div />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <Logo variant="full" theme="dark" className="scale-125" />
        <p className="max-w-xs text-balance text-lg text-white/80">
          Prueba cómo se ven tus gafas antes de comprarlas
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        whileTap={{ scale: 0.96 }}
        onClick={onActivate}
        className="relative z-10 w-full max-w-xs rounded-full bg-brand-blue px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_8px_30px_rgba(11,95,219,0.5)] active:brightness-90"
      >
        Activar cámara
      </motion.button>
    </div>
  );
}

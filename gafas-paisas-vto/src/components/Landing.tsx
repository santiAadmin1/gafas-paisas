"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { ModelPicker } from "./ModelPicker";
import type { CatalogModel } from "@/lib/catalog";

type Props = {
  /** Modelos activos del catálogo para la galería. */
  catalog: CatalogModel[];
  selectedId: string | null;
  /** Entra al probador. Si llega un id, ese modelo queda preseleccionado. */
  onActivate: (modelId?: string) => void;
};

export function Landing({ catalog, selectedId, onActivate }: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-y-auto bg-brand-black px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(11,95,219,0.35),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-5 pt-6"
      >
        <Logo variant="full" theme="dark" className="scale-110" />
        <p className="max-w-xs text-balance text-lg text-white/80">
          Prueba cómo se ven tus gafas antes de comprarlas
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onActivate(selectedId ?? undefined)}
        className="relative z-10 mt-7 w-full max-w-xs rounded-full bg-brand-blue px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_8px_30px_rgba(11,95,219,0.5)] active:brightness-90"
      >
        Activar cámara
      </motion.button>

      {catalog.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 mt-8 w-full max-w-md"
        >
          <h2 className="mb-3 text-sm font-medium text-white/60">
            Elige una montura para probártela
          </h2>
          <ModelPicker
            models={catalog}
            selectedId={selectedId}
            onSelect={(id) => onActivate(id)}
          />
        </motion.section>
      )}
    </div>
  );
}

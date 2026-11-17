"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CatalogModel } from "@/lib/catalog";
import { UiIcon } from "./UiIcon";

const PICKS = ["GP-002", "GP-027", "GP-071"];
const LABELS = ["Clásicas", "Deportivas", "Al aire"];

export function HeroShowcase({ models, onSelect }: { models: CatalogModel[]; onSelect: (id: string) => void }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const model = models.find((m) => m.id === PICKS[index]) ?? models[0];
  if (!model) return null;
  return (
    <aside className="gp-showcase" aria-label="Explora tu estilo">
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[.16em] text-[#40526a]">
        <span>Tu próxima mirada</span><span className="tabular-nums">0{index + 1} / 03</span>
      </div>
      <div className="relative grid min-h-[240px] place-items-center sm:min-h-[320px]">
        <span aria-hidden className="gp-showcase-orbit" />
        <span aria-hidden className="absolute text-[clamp(4rem,8vw,7rem)] font-display tracking-tight text-[#06162f]/[.035]">ACTITUD</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={model.id} initial={{ opacity: 0, y: reduced ? 0 : 14, rotate: reduced ? 0 : -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: reduced ? 0 : .22 }} className="relative w-full">
            <Image src={model.frontal} alt={`${model.tipo}, lente ${model.colorLente.toLowerCase()}`} width={1200} height={480} priority className="h-[190px] w-full object-contain sm:h-[250px]" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-end justify-between gap-3 border-b border-[#06162f]/15 pb-5" aria-live="polite">
        <div><p className="mb-1 font-mono text-[11px] tracking-wider text-[#627188]">{model.id}</p><h2 className="text-xl font-bold tracking-tight text-[#06162f]">{model.tipo}</h2><p className="mt-1 text-xs text-[#526078]">Lente {model.colorLente.toLowerCase()}</p></div>
        <button type="button" onClick={() => onSelect(model.id)} className="gp-product-try" aria-label={`Probar ${model.id}`}><UiIcon name="arrow-up-right" size={24} /></button>
      </div>
      <div className="mt-5 flex gap-2" role="group" aria-label="Estilos destacados">
        {LABELS.map((label, i) => <button type="button" key={label} aria-pressed={index === i} onClick={() => setIndex(i)} className={`min-h-11 flex-1 rounded-full px-2 text-xs font-semibold transition-colors duration-200 ${index === i ? "bg-[#06162f] text-white" : "bg-[#06162f]/[.05] text-[#40526a] hover:bg-[#06162f]/10"}`}>{label}</button>)}
      </div>
      <p className="mt-6 flex items-center justify-between gap-2 border-t border-[#06162f]/10 pt-4 text-[10px] font-semibold text-[#627188]"><span>01 · Elige</span><span>02 · Pruébatelas</span><span>03 · Pídelas</span></p>
    </aside>
  );
}

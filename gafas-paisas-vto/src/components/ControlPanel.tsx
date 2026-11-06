"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATALOG_URL } from "@/lib/constants";
import type { ProcessedGlasses } from "@/lib/glassesProcessor";
import { formatPrecio, type CatalogModel } from "@/lib/catalog";
import { UiIcon } from "./UiIcon";

type Props = {
  current: ProcessedGlasses | null;
  /** Modelo del catálogo que se está probando (null si es una foto subida). */
  model: CatalogModel | null;
  /** Posición dentro del catálogo completo. */
  position: { index: number; total: number } | null;
  canStep: boolean;
  processing: boolean;
  error?: string | null;
  onUpload: (file: File) => void;
  onUploadTemple: (file: File) => void;
  onPrev: () => void;
  onNext: () => void;
  onRemoveCurrent: () => void;
  onCapture: () => void;
  onOpenFavorites: () => void;
  onOpenAdjust: () => void;
  onOpenCatalog: () => void;
  /** URL de pedido por WhatsApp (código + nombre ya incorporados). */
  orderUrl: string;
  favoritesCount: number;
};

// El menú se cierra DESPUÉS de elegir el archivo: si se cerrara al tocar, el
// input se desmontaría antes de recibir la foto.
function FileOption({ onFile, processing, label, icon }: { onFile: (file: File) => void; processing: boolean; label: string; icon: "upload" | "layers" }) {
  return <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-white/10 ${processing ? "cursor-wait opacity-60" : ""}`}>
    <UiIcon name={icon} size={18} className="text-[#a0caff]"/><span>{label}</span>
    <input type="file" accept="image/png,image/jpeg,image/webp" disabled={processing} className="sr-only" aria-label={label} onChange={(event) => {const file = event.target.files?.[0];if (file) onFile(file);event.target.value = "";}} />
  </label>;
}

/**
 * Controles del probador. Solo tres acciones a la vista (cambiar de gafa,
 * foto, pedir); lo demás vive en "Más opciones" para no saturar la pantalla.
 */
export function ControlPanel({ current, model, position, canStep, processing, error, onUpload, onUploadTemple, onPrev, onNext, onRemoveCurrent, onCapture, onOpenFavorites, onOpenAdjust, onOpenCatalog, orderUrl, favoritesCount }: Props) {
  const [showMore, setShowMore] = useState(false);
  const title = model?.tipo ?? current?.name ?? "Elige tus gafas";
  const subtitle = model
    ? `Lente ${model.colorLente.toLowerCase()} · ${model.id}`
    : current ? "Tu foto subida" : "Toca el catálogo para empezar";

  return <section className="mx-auto w-full max-w-[1200px] px-4 pb-[max(env(safe-area-inset-bottom),.9rem)] pt-3 text-white sm:px-7 sm:pt-4" aria-label="Controles del probador virtual">
    {error && <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-100"><UiIcon name="info" size={17}/>{error}</div>}

    {/* Gafa actual: las flechas recorren TODO el catálogo. */}
    <div className="mb-3 flex min-h-[62px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[.06] p-2 sm:gap-3">
      <button type="button" onClick={onPrev} disabled={!canStep || processing} aria-label="Montura anterior" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-30"><UiIcon name="chevron-left"/></button>
      <button type="button" onClick={onOpenCatalog} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1 text-left" aria-label="Abrir el catálogo">
        {current ? <img src={current.thumbnail} alt="" className="h-11 w-14 shrink-0 rounded-lg border border-white/15 bg-white/90 object-contain" />
          : <span className="grid h-11 w-14 shrink-0 place-items-center rounded-lg bg-white/10 text-[#a0caff]"><UiIcon name="shopping-bag" size={20}/></span>}
        <span className="min-w-0 flex-1">
          {/* El nombre entra con un fundido corto al cambiar de gafa. Sin animación de
              salida a propósito: el texto siempre es el de la gafa actual, aunque se toque rápido. */}
          <motion.span key={processing ? "cargando" : `${title}-${subtitle}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} className="block">
            <span className="block truncate text-sm font-bold">{processing ? "Cargando…" : title}</span>
            <span className="mt-0.5 block truncate text-[11px] text-blue-100/60">{subtitle}</span>
          </motion.span>
        </span>
        <span className="shrink-0 text-right">
          {model?.precio ? <span className="block text-sm font-extrabold">{formatPrecio(model.precio)}</span> : null}
          {position && <span className="block text-[10px] text-blue-100/50">{position.index}/{position.total}</span>}
        </span>
      </button>
      <button type="button" onClick={onNext} disabled={!canStep || processing} aria-label="Siguiente montura" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-30"><UiIcon name="chevron-right"/></button>
    </div>

    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <button type="button" onClick={onOpenCatalog} className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[.08] px-2 py-3 text-xs font-bold transition hover:bg-white/15 sm:text-sm"><UiIcon name="shopping-bag" size={18}/> Catálogo</button>
      <button type="button" onClick={onCapture} disabled={processing || !current} className="grid h-[64px] w-[64px] place-items-center rounded-full border-[4px] border-white bg-[#0669e6] text-white shadow-[0_10px_30px_rgba(0,100,224,.32)] transition hover:bg-[#0056c9] active:scale-95 disabled:opacity-40" aria-label="Tomar foto con las gafas" title="Tomar foto"><UiIcon name="camera" size={26}/></button>
      <a href={orderUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-[54px] items-center justify-center gap-1.5 rounded-2xl bg-brand-orange px-2 py-3 text-center text-xs font-extrabold leading-tight text-white shadow-[0_10px_26px_rgba(255,77,46,.28)] transition hover:bg-brand-orange-dark sm:text-sm"><UiIcon name="whatsapp" size={18}/> {current ? "Pedirla" : "WhatsApp"}</a>
    </div>

    <div className="mt-3 flex items-center justify-between gap-2 text-[12px]">
      <button type="button" onClick={onOpenFavorites} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-semibold text-blue-100/85 transition hover:bg-white/10"><UiIcon name="heart" size={16}/> Favoritas ({favoritesCount}/5)</button>
      <p className="hidden text-blue-100/55 sm:block">Pide antes de la 1 y hoy las tienes puestas.</p>
      <div className="relative">
        <button type="button" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-semibold text-blue-100/85 transition hover:bg-white/10"><UiIcon name="more" size={16}/> Más opciones</button>
        <AnimatePresence>
        {showMore && <motion.div key="mas" initial={{ opacity: 0, scale: .94, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 4 }} transition={{ duration: .18, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: "bottom right" }} className="absolute bottom-full right-0 z-30 mb-2 w-[260px] rounded-2xl border border-white/15 bg-[#0b2244] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,.45)]">
          <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer" onClick={() => setShowMore(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-white/10"><UiIcon name="external" size={18} className="text-[#a0caff]"/> Ver catálogo completo</a>
          {current && <button type="button" onClick={() => {setShowMore(false);onOpenAdjust();}} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/10"><UiIcon name="sliders" size={18} className="text-[#a0caff]"/> Ajustar cómo me quedan</button>}
          <FileOption onFile={(f) => {setShowMore(false);onUpload(f);}} processing={processing} label="Probar una foto mía de gafas" icon="upload" />
          {current && !model && <FileOption onFile={(f) => {setShowMore(false);onUploadTemple(f);}} processing={processing} label="Agregar la foto de lado" icon="layers" />}
          {current && <button type="button" onClick={() => {setShowMore(false);onRemoveCurrent();}} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-blue-100/80 hover:bg-white/10"><UiIcon name="close" size={16} className="text-[#a0caff]"/> Quitarme estas gafas</button>}
        </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  </section>;
}

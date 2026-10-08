"use client";

import { CATALOG_URL } from "@/lib/constants";
import type { ProcessedGlasses } from "@/lib/glassesProcessor";

type Props = {
  items: ProcessedGlasses[];
  current: ProcessedGlasses | null;
  processing: boolean;
  onUpload: (file: File) => void;
  onUploadTemple: (file: File) => void;
  onPrev: () => void;
  onNext: () => void;
  onRemoveCurrent: () => void;
  onCapture: () => void;
  onOpenFavorites: () => void;
  onOpenAdjust: () => void;
  favoritesCount: number;
};

export function ControlPanel({ items, current, processing, onUpload, onUploadTemple, onPrev, onNext, onRemoveCurrent, onCapture, onOpenFavorites, onOpenAdjust, favoritesCount }: Props) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1160px] flex-col gap-3 px-3 pb-[max(env(safe-area-inset-bottom),14px)] pt-3 text-white sm:gap-4 sm:px-6 sm:pt-4">
      <div className="flex min-h-[45px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 sm:gap-4">
        <button type="button" onClick={onPrev} disabled={items.length < 2} aria-label="Referencia anterior" className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white disabled:opacity-30 sm:px-4">‹ <span className="hidden sm:inline">Anterior</span></button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 text-center">
          {current ? <>
            <img src={current.thumbnail} alt={current.name} className="h-10 w-12 shrink-0 rounded-lg border border-white/20 bg-white/10 object-contain" />
            <div className="min-w-0 text-left"><p className="truncate text-xs font-semibold sm:text-sm">{current.name}</p><p className="text-[10px] text-white/55">{items.length} {items.length === 1 ? "referencia" : "referencias"} · activa</p></div>
          </> : <div className="min-w-0 text-center"><p className="text-xs font-semibold sm:text-sm">Aún no has subido gafas</p><p className="text-[10px] text-white/55">Carga una foto frontal de una montura</p></div>}
          {current?.possiblyUnsegmented && <span title="Fondo de la foto no identificado; usa ajuste manual." className="text-amber-300">⚠</span>}
        </div>
        <button type="button" onClick={onNext} disabled={items.length < 2} aria-label="Siguiente referencia" className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white disabled:opacity-30 sm:px-4"><span className="hidden sm:inline">Siguiente </span>›</button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-7">
        <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/10 px-2 py-3 text-center text-[11px] font-semibold transition hover:bg-white/20 sm:text-xs"><span className="text-xl">🛍️</span> Ver catálogo</a>
        <button type="button" onClick={onCapture} disabled={!current || processing} className="grid h-[68px] w-[68px] place-items-center rounded-full border-[5px] border-white bg-[#0064e0] text-[27px] shadow-[0_9px_25px_rgba(0,100,224,.38)] transition active:scale-95 disabled:opacity-40 sm:h-[77px] sm:w-[77px]" aria-label="Tomar una fotografía con las gafas">📸</button>
        <label className={`flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-2xl bg-[#0064e0] px-2 py-3 text-center text-[11px] font-semibold transition hover:bg-[#0b5fdb] sm:text-xs ${processing ? "cursor-wait opacity-70" : "cursor-pointer"}`}>
          <span className="text-xl" aria-hidden>{processing ? "⏳" : "👓"}</span>{processing ? "Procesando…" : "Subir montura"}
          <input type="file" accept="image/png,image/jpeg,image/webp" disabled={processing} className="sr-only" onChange={(event) => {const file = event.target.files?.[0]; if (file) onUpload(file); event.target.value = "";}} />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pb-1 text-xs">
        {current && <>
          <label className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/75 transition hover:bg-white/10">{current.temple ? "✓ Pata lateral" : "+ Foto de pata"}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={processing} onChange={(event) => {const file = event.target.files?.[0]; if (file) onUploadTemple(file); event.target.value = "";}} /></label>
          <button onClick={onOpenAdjust} className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/75 hover:bg-white/10">⚙ Ajustar</button>
          <button onClick={onRemoveCurrent} className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/60 hover:bg-white/10" aria-label="Quitar referencia actual">Quitar</button>
        </>}
        <button onClick={onOpenFavorites} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/85 hover:bg-white/10">☆ Mis favoritas ({favoritesCount}/5)</button>
      </div>
    </div>
  );
}

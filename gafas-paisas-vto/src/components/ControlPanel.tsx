"use client";

import { CATALOG_URL } from "@/lib/constants";
import type { ProcessedGlasses } from "@/lib/glassesProcessor";
import { InstagramLink } from "./InstagramLink";
import { UiIcon } from "./UiIcon";

type Props = {
  items: ProcessedGlasses[];
  current: ProcessedGlasses | null;
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
  favoritesCount: number;
};

function UploadControl({ onUpload, processing, label, secondary = false }: {
  onUpload: (file: File) => void; processing: boolean; label: string; secondary?: boolean;
}) {
  return <label className={`inline-flex min-h-[50px] cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-4 py-3 text-center text-xs font-bold transition sm:text-sm ${processing ? "cursor-wait opacity-60" : ""} ${secondary ? "border border-white/20 bg-white/10 text-white hover:bg-white/20" : "bg-[#0669e6] text-white shadow-[0_9px_25px_rgba(0,100,224,.24)] hover:bg-[#0056c7]"}`}>
    <UiIcon name="upload" size={19}/><span>{processing ? "Preparando montura…" : label}</span>
    <input type="file" accept="image/png,image/jpeg,image/webp" disabled={processing} className="sr-only" aria-label={label} onChange={(event) => {const file = event.target.files?.[0];if (file) onUpload(file);event.target.value = "";}} />
  </label>;
}

export function ControlPanel({ items, current, processing, error, onUpload, onUploadTemple, onPrev, onNext, onRemoveCurrent, onCapture, onOpenFavorites, onOpenAdjust, favoritesCount }: Props) {
  const currentPosition = current ? Math.max(1, items.findIndex(item => item.id === current.id) + 1) : 0;

  return <section className="mx-auto w-full max-w-[1200px] px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 text-white sm:px-7 sm:pt-5" aria-label="Controles del probador virtual">
    {error && <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-100"><UiIcon name="info" size={17}/>{error}</div>}

    {!current ? <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] font-bold tracking-[.17em] text-[#86beff]">SIGUIENTE PASO</p><h2 className="mt-1 text-lg font-extrabold leading-tight tracking-tight sm:text-xl">Elige tus gafas. Nosotros ponemos el espejo.</h2><p className="mt-1 text-xs leading-5 text-blue-100/65">Abre el catálogo o sube una foto frontal de la montura que quieras probar.</p></div>
        <div className="hidden sm:block"><InstagramLink variant="subtle" compact /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-[66px] items-center gap-3 rounded-2xl border border-white/20 bg-white/[.075] px-4 py-3 transition hover:bg-white/[.14]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#a0caff]"><UiIcon name="shopping-bag" size={21}/></span><span className="flex-1"><span className="block text-sm font-bold">1. Ver modelos disponibles</span><span className="mt-0.5 block text-[11px] text-blue-100/65">El catálogo se abrirá en otra pestaña</span></span><UiIcon name="arrow-up-right" size={18} className="text-blue-100/60"/></a>
        <UploadControl onUpload={onUpload} processing={processing} label="2. Subir foto de mis gafas" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-100/65"><span className="inline-flex items-center gap-1.5"><UiIcon name="info" size={15}/> Para mejores resultados: foto de frente, gafas completas y fondo sencillo.</span><button type="button" onClick={onOpenFavorites} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-semibold text-blue-100/85 transition hover:bg-white/10"><UiIcon name="heart" size={16}/> Favoritas ({favoritesCount}/5)</button></div>
    </> : <>
      <div className="mb-3 flex min-h-[64px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[.06] p-2 sm:gap-4">
        <button type="button" onClick={onPrev} disabled={items.length < 2} aria-label="Ver montura anterior" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-30"><UiIcon name="chevron-left"/></button>
        <img src={current.thumbnail} alt={`Imagen de ${current.name}`} className="h-12 w-16 shrink-0 rounded-xl border border-white/15 bg-white/10 object-contain sm:w-20" />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{current.name}</p><p className="mt-1 text-[11px] text-blue-100/60">Modelo {currentPosition} de {items.length} · listo para probar</p></div>
        {current.possiblyUnsegmented && <span className="hidden text-xs text-amber-200 sm:block" title="La imagen puede necesitar un ajuste manual">Revisa el recorte</span>}
        <button type="button" onClick={onNext} disabled={items.length < 2} aria-label="Ver siguiente montura" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-30"><UiIcon name="chevron-right"/></button>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[.08] px-2 py-3 text-xs font-bold transition hover:bg-white/15 sm:text-sm"><UiIcon name="shopping-bag" size={19}/><span className="hidden min-[380px]:inline">Más </span>modelos <UiIcon name="arrow-up-right" size={14}/></a>
        <button type="button" onClick={onCapture} disabled={processing} className="grid h-[65px] w-[65px] place-items-center rounded-full border-[4px] border-white bg-[#0669e6] text-white shadow-[0_10px_30px_rgba(0,100,224,.32)] transition hover:bg-[#0056c9] active:scale-95 disabled:opacity-40" aria-label="Tomar foto con las gafas" title="Tomar foto con las gafas"><UiIcon name="camera" size={27}/></button>
        <UploadControl onUpload={onUpload} processing={processing} label="Añadir otra montura" secondary />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:justify-between">
        <div className="flex flex-wrap justify-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-2 text-blue-100/85 transition hover:bg-white/10"><UiIcon name="layers" size={15}/>{current.temple ? "Patilla añadida" : "Añadir patilla"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={processing} className="sr-only" aria-label="Subir imagen lateral de la patilla" onChange={(event) => {const file = event.target.files?.[0];if (file) onUploadTemple(file);event.target.value = "";}} /></label>
          <button type="button" onClick={onOpenAdjust} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-2 text-blue-100/85 transition hover:bg-white/10"><UiIcon name="sliders" size={15}/> Ajustar</button>
          <button type="button" onClick={onRemoveCurrent} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-2 text-blue-100/70 transition hover:bg-white/10"><UiIcon name="close" size={14}/> Quitar</button>
        </div>
        <button type="button" onClick={onOpenFavorites} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-2 font-semibold text-blue-100/90 transition hover:bg-white/10"><UiIcon name="heart" size={16}/> Mis favoritas ({favoritesCount}/5)</button>
      </div>
    </>}
  </section>;
}

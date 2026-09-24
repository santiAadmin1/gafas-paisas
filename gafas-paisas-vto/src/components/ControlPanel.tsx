"use client";

import { CATALOG_URL } from "@/lib/constants";
import type { ProcessedGlasses } from "@/lib/glassesProcessor";

type Props = {
  items: ProcessedGlasses[];
  current: ProcessedGlasses | null;
  processing: boolean;
  onUpload: (file: File) => void;
  onPrev: () => void;
  onNext: () => void;
  onRemoveCurrent: () => void;
  onCapture: () => void;
  onOpenFavorites: () => void;
  onOpenAdjust: () => void;
  favoritesCount: number;
};

export function ControlPanel({
  items,
  current,
  processing,
  onUpload,
  onPrev,
  onNext,
  onRemoveCurrent,
  onCapture,
  onOpenFavorites,
  onOpenAdjust,
  favoritesCount,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col justify-between gap-2 bg-brand-black px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 text-white">
      {items.length > 0 && (
        <div className="flex items-center justify-between gap-2 text-xs text-white/70">
          <button
            onClick={onPrev}
            disabled={items.length < 2}
            className="rounded-full bg-white/10 px-3 py-1.5 disabled:opacity-30"
          >
            ‹ Anterior
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            {current && (
              <img
                src={current.thumbnail}
                alt={current.name}
                className="h-8 w-8 rounded-md border border-white/20 object-contain bg-white/5"
              />
            )}
            <span className="max-w-[9rem] truncate">
              {current ? current.name : "Sin gafas"} · {items.length}{" "}
              {items.length === 1 ? "referencia" : "referencias"}
            </span>
            {current?.possiblyUnsegmented && (
              <span className="shrink-0 text-amber-400" title="No detectamos bien el fondo de esta foto: usa el ajuste manual.">
                ⚠️
              </span>
            )}
            {current && (
              <button onClick={onOpenAdjust} className="shrink-0 text-white/70" aria-label="Ajustar manualmente">
                🔧
              </button>
            )}
            {current && (
              <button
                onClick={onRemoveCurrent}
                className="shrink-0 text-white/50 underline decoration-dotted"
                aria-label="Eliminar esta referencia de la sesión"
              >
                quitar
              </button>
            )}
          </div>
          <button
            onClick={onNext}
            disabled={items.length < 2}
            className="rounded-full bg-white/10 px-3 py-1.5 disabled:opacity-30"
          >
            Siguiente ›
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 items-center gap-3">
        <a
          href={CATALOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 py-3 text-xs font-medium active:bg-white/20"
        >
          <span aria-hidden className="text-xl">🛍️</span>
          Buscar gafas
        </a>

        <button
          onClick={onCapture}
          disabled={!current}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-brand-blue text-2xl shadow-lg active:scale-95 disabled:opacity-30"
          aria-label="Capturar foto"
        >
          📸
        </button>

        <label className="flex flex-col items-center gap-1 rounded-2xl bg-brand-blue py-3 text-xs font-medium active:brightness-90">
          <span aria-hidden className="text-xl">{processing ? "⏳" : "🕶️"}</span>
          {processing ? "Procesando…" : "Subir gafas"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <button
        onClick={onOpenFavorites}
        className="flex items-center justify-center gap-2 rounded-full bg-white/5 py-2 text-xs text-white/80"
      >
        ⭐ Mis favoritas ({favoritesCount}/5)
      </button>
    </div>
  );
}

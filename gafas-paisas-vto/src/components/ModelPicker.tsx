"use client";

import type { CatalogModel } from "@/lib/catalog";

type Props = {
  models: CatalogModel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
};

/**
 * Galería de monturas del catálogo. Presentacional y reutilizable:
 * se usa en el Landing y como cajón dentro del probador. Accesible por
 * teclado (botones nativos) y marca el modelo activo con aria-pressed.
 */
export function ModelPicker({ models, selectedId, onSelect, className }: Props) {
  return (
    <ul
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${className ?? ""}`}
      role="list"
      aria-label="Catálogo de monturas"
    >
      {models.map((m) => {
        const selected = m.id === selectedId;
        return (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onSelect(m.id)}
              aria-pressed={selected}
              aria-label={`${m.name}, referencia ${m.id}`}
              className={[
                "flex w-full flex-col items-center gap-1 rounded-2xl border p-2 text-center transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
                selected
                  ? "border-brand-blue bg-brand-blue/15 ring-2 ring-brand-blue"
                  : "border-white/15 bg-white/5 active:bg-white/10",
              ].join(" ")}
            >
              <img
                src={m.thumb}
                alt=""
                loading="lazy"
                className="h-20 w-full rounded-lg bg-white/5 object-contain"
              />
              <span className="mt-1 line-clamp-1 text-xs font-medium text-white">{m.name}</span>
              <span className="text-[10px] tracking-wide text-white/50">{m.id}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

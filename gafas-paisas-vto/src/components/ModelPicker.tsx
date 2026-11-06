"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIAS, formatPrecio, type Categoria, type CatalogModel } from "@/lib/catalog";

type Props = {
  models: CatalogModel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
  /** Muestra los chips de categoría encima de la galería. */
  filterable?: boolean;
};

type Filtro = "Todas" | Categoria;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Galería de monturas del catálogo. Se usa en el Landing y como cajón dentro
 * del probador. Cada tarjeta dice qué es (estilo + lente) para que nadie
 * tenga que elegir entre "Referencia 047" y "Referencia 048".
 */
export function ModelPicker({ models, selectedId, onSelect, className, filterable = false }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  // layoutId único por instancia: el Landing y el cajón del probador no se mezclan.
  const pillId = useId();

  const conteo = useMemo(() => {
    const c: Partial<Record<Categoria, number>> = {};
    for (const m of models) if (m.categoria) c[m.categoria] = (c[m.categoria] ?? 0) + 1;
    return c;
  }, [models]);

  const visibles = filtro === "Todas" ? models : models.filter((m) => m.categoria === filtro);
  const filtros: Filtro[] = ["Todas", ...CATEGORIAS.filter((c) => conteo[c])];

  return (
    <div>
      {filterable && (
        <div className="gp-no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1" role="toolbar" aria-label="Filtrar monturas por estilo">
          {filtros.map((f) => {
            const activo = f === filtro;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                aria-pressed={activo}
                className={`relative shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors duration-300 ${
                  activo ? "border-white text-[#06162f]" : "border-white/20 bg-white/[.06] text-blue-50 hover:bg-white/15"
                }`}
              >
                {/* La píldora blanca se desliza hasta el filtro que tocaste. */}
                {activo && <motion.span layoutId={pillId} className="absolute inset-0 -z-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">
                  {f}
                  <span className={`ml-1.5 font-semibold ${activo ? "text-[#06162f]/55" : "text-blue-100/50"}`}>{f === "Todas" ? models.length : conteo[f]}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* key = filtro: al cambiar de filtro la grilla vuelve a entrar en cascada corta. */}
      <ul key={filtro} className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${className ?? ""}`} role="list" aria-label="Catálogo de monturas">
        {visibles.map((m, i) => {
          const selected = m.id === selectedId;
          return (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: .45, delay: Math.min(i, 10) * .035, ease: EASE }}
            >
              <motion.button
                type="button"
                whileTap={{ scale: .96 }}
                onClick={() => onSelect(m.id)}
                aria-pressed={selected}
                aria-label={`Probarme ${m.name}, referencia ${m.id}`}
                className={[
                  "group flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-colors duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#98ceff]",
                  selected ? "border-brand-blue bg-brand-blue/20 ring-2 ring-brand-blue" : "border-white/12 bg-white/[.05] hover:border-white/35",
                ].join(" ")}
              >
                <span className="relative block overflow-hidden bg-[#eef3fa] p-2">
                  <img src={m.thumb} alt="" loading="lazy" className="h-20 w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.07]" />
                  <span className="absolute inset-x-2 bottom-1.5 translate-y-2 rounded-full bg-[#06162f]/85 py-1 text-center text-[10px] font-bold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    Probármela
                  </span>
                </span>
                <span className="flex flex-col gap-0.5 px-2.5 pb-2.5 pt-2">
                  <span className="line-clamp-1 text-[13px] font-bold text-white">{m.tipo}</span>
                  <span className="line-clamp-1 text-[11px] text-blue-100/65">Lente {m.colorLente.toLowerCase()}</span>
                  <span className="mt-1 block truncate">
                    {m.precio ? (
                      <span className="text-[13px] font-extrabold text-white">{formatPrecio(m.precio)}</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#8fc8ff]">Consulta el precio</span>
                    )}
                  </span>
                </span>
              </motion.button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

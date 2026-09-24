"use client";

import { shareCaptureToWhatsapp } from "@/lib/shareController";
import type { Favorite } from "@/hooks/useSession";

type Props = {
  favorites: Favorite[];
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function FavoritesDrawer({ favorites, onClose, onRemove }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-base font-semibold">Mis favoritas</h2>
        <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm">
          ✕ Cerrar
        </button>
      </div>

      {favorites.length === 0 ? (
        <p className="flex-1 text-center text-sm text-white/60">
          Aún no guardas ninguna referencia. Captura una foto con tus gafas puestas y
          presiona “Guardar en favoritas”.
        </p>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
          {favorites.map((fav) => (
            <div key={fav.id} className="flex flex-col gap-2 rounded-2xl bg-white/5 p-2">
              <img
                src={fav.capture}
                alt={fav.glassesName}
                className="aspect-[3/4] w-full rounded-xl object-cover"
              />
              <span className="truncate text-xs text-white/70">{fav.glassesName}</span>
              <button
                onClick={() => shareCaptureToWhatsapp(fav.capture)}
                className="rounded-full bg-brand-blue py-2 text-xs font-semibold"
              >
                Comprar esta
              </button>
              <button
                onClick={() => onRemove(fav.id)}
                className="text-[11px] text-white/50 underline decoration-dotted"
              >
                quitar de favoritas
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

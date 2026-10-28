"use client";

import { shareCaptureToWhatsapp } from "@/lib/shareController";
import type { Favorite } from "@/hooks/useSession";
import { UiIcon } from "./UiIcon";

type Props = { favorites: Favorite[]; onClose: () => void; onRemove: (id: string) => void };

export function FavoritesDrawer({ favorites, onClose, onRemove }: Props) {
  return <div role="dialog" aria-modal="true" aria-label="Mis monturas favoritas" className="fixed inset-0 z-50 flex flex-col bg-[#061327] p-4 text-white sm:p-6">
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 pb-5"><div><p className="text-[11px] font-bold tracking-[.12em] text-[#86bdff]">TU SELECCIÓN</p><h2 className="mt-1 text-xl font-extrabold">Las que más van contigo</h2><p className="mt-1 text-xs text-blue-100/65">Puedes guardar hasta 5 fotos durante esta sesión.</p></div><button onClick={onClose} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"><UiIcon name="close" size={16}/> Cerrar</button></div>
    {favorites.length === 0 ? <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 text-center"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-[#8dc4ff]"><UiIcon name="heart" size={30}/></span><h3 className="text-xl font-extrabold">Aquí empieza tu colección.</h3><p className="max-w-sm text-sm leading-7 text-blue-100/70">Cuando pruebes unas gafas que te gusten, toma una foto y pulsa “Guardar en favoritas”.</p><button onClick={onClose} className="rounded-full bg-[#0669e6] px-6 py-3 text-sm font-bold">Volver al probador</button></div> :
      <div className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pb-4 sm:grid-cols-3 lg:grid-cols-5">{favorites.map(fav => <article key={fav.id} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[.055] p-2.5"><img src={fav.capture} alt={`Tu foto con ${fav.glassesName}`} className="aspect-[3/4] w-full rounded-xl object-cover" /><p className="truncate text-xs font-bold text-blue-100/90">{fav.glassesName}</p><button onClick={() => {void shareCaptureToWhatsapp(fav.capture);}} className="rounded-xl bg-[#0669e6] px-2 py-2.5 text-[11px] font-bold">Consultar por WhatsApp</button><button onClick={() => onRemove(fav.id)} className="rounded-xl px-2 py-2 text-[11px] text-blue-100/65 hover:bg-white/10">Quitar de favoritos</button></article>)}</div>}
  </div>;
}

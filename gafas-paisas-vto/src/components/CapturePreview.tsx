"use client";

import { useState } from "react";
import { saveCaptureToGallery, shareCaptureToWhatsapp } from "@/lib/shareController";
import { UiIcon } from "./UiIcon";

type Props = { captureDataUrl: string; glassesName: string; onClose: () => void; onSaveFavorite: () => void; favoritesFull: boolean };

export function CapturePreview({ captureDataUrl, glassesName, onClose, onSaveFavorite, favoritesFull }: Props) {
  const [sharing, setSharing] = useState(false);
  return <div role="dialog" aria-modal="true" aria-label="Vista previa de tu fotografía" className="fixed inset-0 z-50 flex flex-col bg-[#061327] p-4 text-white sm:p-6">
    <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 pb-4"><div><p className="text-xs font-bold tracking-[.12em] text-[#86bdff]">TU FOTO</p><h2 className="mt-1 truncate text-base font-extrabold sm:text-lg">Así te quedan: {glassesName}</h2></div><button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"><UiIcon name="close" size={16}/> Cerrar</button></div>
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black"><img src={captureDataUrl} alt={`Tu foto usando las gafas ${glassesName}`} className="max-h-full max-w-full object-contain" /></div>
    <div className="mx-auto w-full max-w-4xl pt-4"><p className="mb-3 text-center text-xs text-blue-100/65">¿Te gustan? Guarda la foto, añádela a favoritos o consulta por WhatsApp.</p><div className="grid gap-2 sm:grid-cols-3">
      <button type="button" onClick={() => {void saveCaptureToGallery(captureDataUrl);}} className="inline-flex min-h-[49px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-semibold hover:bg-white/20"><UiIcon name="photo" size={17}/> Guardar en mi galería</button>
      <button onClick={onSaveFavorite} disabled={favoritesFull} className="inline-flex min-h-[49px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-semibold hover:bg-white/20 disabled:opacity-40"><UiIcon name="heart" size={17}/>{favoritesFull ? "Favoritos completos (5/5)" : "Guardar en favoritas"}</button>
      <button onClick={async () => {setSharing(true);try {await shareCaptureToWhatsapp(captureDataUrl);} catch { /* Usuario cancela compartir o dispositivo sin compatibilidad. */ } finally {setSharing(false);}}} disabled={sharing} className="inline-flex min-h-[49px] items-center justify-center gap-2 rounded-2xl bg-[#0669e6] px-3 py-3 text-xs font-bold hover:bg-[#0054c4] disabled:opacity-60"><UiIcon name="arrow-up-right" size={17}/>{sharing ? "Abriendo opciones…" : "Consultar por WhatsApp"}</button>
    </div></div>
  </div>;
}

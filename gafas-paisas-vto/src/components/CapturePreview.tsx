"use client";

import { useState } from "react";
import { shareCaptureToWhatsapp } from "@/lib/shareController";

type Props = {
  captureDataUrl: string;
  glassesName: string;
  onClose: () => void;
  onSaveFavorite: () => void;
  favoritesFull: boolean;
};

export function CapturePreview({
  captureDataUrl,
  glassesName,
  onClose,
  onSaveFavorite,
  favoritesFull,
}: Props) {
  const [sharing, setSharing] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white">
      <div className="flex items-center justify-between pb-3">
        <span className="text-sm font-medium">{glassesName}</span>
        <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm">
          ✕ Cerrar
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black">
        <img src={captureDataUrl} alt="Captura con gafas" className="max-h-full max-w-full object-contain" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        <button
          onClick={onSaveFavorite}
          disabled={favoritesFull}
          className="rounded-2xl bg-white/10 py-3 text-sm font-medium disabled:opacity-30"
        >
          ⭐ Guardar en favoritas
        </button>
        <button
          onClick={async () => {
            setSharing(true);
            try {
              await shareCaptureToWhatsapp(captureDataUrl);
            } finally {
              setSharing(false);
            }
          }}
          disabled={sharing}
          className="rounded-2xl bg-brand-blue py-3 text-sm font-semibold disabled:opacity-60"
        >
          {sharing ? "Abriendo…" : "Quiero estas gafas 💬"}
        </button>
      </div>
    </div>
  );
}

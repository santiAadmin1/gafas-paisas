"use client";

import type { Adjustment } from "@/hooks/useSession";

type Props = {
  onNudge: (delta: Partial<Adjustment>) => void;
  onReset: () => void;
  onClose: () => void;
};

const STEP_MOVE = 0.06; // fracción de la distancia interocular
const STEP_SCALE = 0.05;
const STEP_ROTATE = (3 * Math.PI) / 180; // 3°

/**
 * Ajuste manual fino: red de seguridad para cuando la detección automática
 * (fondo/escala) no da un resultado perfecto. Vive oculto detrás de un
 * botón "Ajustar" para no contaminar la pantalla principal.
 */
export function AdjustPanel({ onNudge, onReset, onClose }: Props) {
  return (
    <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-2 rounded-2xl bg-black/70 p-3 text-white backdrop-blur">
      <div className="flex items-center justify-between gap-4 text-xs text-white/70">
        <span>Ajuste fino</span>
        <button onClick={onClose} className="text-white/60">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div />
        <AdjustBtn label="⬆" onClick={() => onNudge({ offsetY: -STEP_MOVE })} />
        <div />
        <AdjustBtn label="⬅" onClick={() => onNudge({ offsetX: -STEP_MOVE })} />
        <AdjustBtn label="⟳" onClick={onReset} small />
        <AdjustBtn label="➡" onClick={() => onNudge({ offsetX: STEP_MOVE })} />
        <div />
        <AdjustBtn label="⬇" onClick={() => onNudge({ offsetY: STEP_MOVE })} />
        <div />
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <AdjustBtn label="➖" onClick={() => onNudge({ scale: -STEP_SCALE })} />
        <AdjustBtn label="↺" onClick={() => onNudge({ rotate: -STEP_ROTATE })} />
        <AdjustBtn label="↻" onClick={() => onNudge({ rotate: STEP_ROTATE })} />
        <AdjustBtn label="➕" onClick={() => onNudge({ scale: STEP_SCALE })} />
      </div>
    </div>
  );
}

function AdjustBtn({ label, onClick, small }: { label: string; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg bg-white/10 active:bg-white/25 ${
        small ? "h-8 w-8 text-xs" : "h-9 w-9 text-base"
      }`}
    >
      {label}
    </button>
  );
}

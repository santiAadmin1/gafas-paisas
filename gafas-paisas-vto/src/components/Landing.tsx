"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Props = { onActivate: () => void; onExit: () => void };

export function Landing({ onActivate, onExit }: Props) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-[#070d1c] px-6 py-8 text-center text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_28%,rgba(0,100,224,.37),transparent_61%)]" />
      <div className="w-full max-w-5xl text-right">
        <button onClick={onExit} className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10">Cambiar número</button>
      </div>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }} className="flex flex-col items-center gap-7">
        <Image src="/brand/logo-blanco.png" alt="Gafas Paisas" width={240} height={92} priority className="h-auto w-[210px] sm:w-[250px]" />
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[.11em] text-blue-100">TU ESTILO, EN TIEMPO REAL</span>
        <h1 className="max-w-lg text-[clamp(2rem,4vw,3.3rem)] font-extrabold leading-[1.14] tracking-[-.045em]">Pruébalas antes de <span className="text-[#80baff]">elegirlas.</span></h1>
        <p className="max-w-sm text-sm leading-7 text-blue-100/75 sm:text-base">Enciende tu cámara para probar tus monturas de Gafas Paisas. Puedes subir una referencia y ajustarla sobre tu rostro.</p>
      </motion.div>
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .1 }} whileTap={{ scale: .97 }} onClick={onActivate} className="w-full rounded-full bg-[#0064e0] px-8 py-4 text-base font-bold text-white shadow-[0_12px_35px_rgba(0,100,224,.38)] transition hover:bg-[#0b5fdb]">📷 Activar cámara</motion.button>
        <p className="text-xs text-white/45">Solicitaremos tu permiso antes de acceder a la cámara.</p>
      </div>
    </main>
  );
}

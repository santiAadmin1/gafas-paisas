"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CATALOG_URL } from "@/lib/constants";
import { InstagramLink } from "./InstagramLink";
import { UiIcon } from "./UiIcon";

type Props = { onActivate: () => void; onExit: () => void };

export function Landing({ onActivate, onExit }: Props) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#06162f] px-5 py-6 text-white sm:px-10 lg:px-[clamp(32px,6vw,110px)] lg:py-10">
      <div aria-hidden className="gp-hero-glow pointer-events-none absolute inset-0 -z-10" />
      <header className="flex w-full items-center justify-between gap-3">
        <Image src="/brand/logo-blanco.png" alt="Gafas Paisas" width={174} height={75} priority className="h-auto w-[145px] object-contain sm:w-[176px]" />
        <div className="flex items-center gap-2 sm:gap-3"><div className="hidden sm:block"><InstagramLink variant="subtle" /></div><button onClick={onExit} className="rounded-full border border-white/20 bg-white/[.07] px-4 py-2.5 text-xs font-semibold text-blue-100 transition hover:bg-white/15">Cambiar número</button></div>
      </header>
      <div className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-8 pb-8 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-12">
        <motion.section initial={{ opacity: 0, y: 17 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.08] px-4 py-2 text-[11px] font-semibold tracking-[.075em] text-[#bcddff]"><UiIcon name="sparkles" size={15}/> BIENVENIDO A TU PROBADOR</span>
          <h1 className="mt-6 max-w-[680px] text-[clamp(2.65rem,5.8vw,5.6rem)] font-extrabold leading-[1.065] tracking-[-.067em]">Mírate con otros ojos. <span className="block text-[#8fc8ff]">Y nuevas gafas.</span></h1>
          <p className="mt-6 max-w-[500px] text-sm leading-[1.85] text-blue-100/80 sm:text-base">Prueba una montura sobre tu rostro en tiempo real. Solo necesitas tu cámara y una foto frontal de las gafas que quieres conocer.</p>
          <div className="mt-9 flex max-w-[500px] flex-col gap-3 sm:flex-row">
            <motion.button whileTap={{ scale: .98 }} onClick={onActivate} className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-3 rounded-2xl bg-[#0669e6] px-6 py-4 text-sm font-bold text-white shadow-[0_16px_42px_rgba(0,91,232,.3)] transition hover:bg-[#0052c7]"><UiIcon name="camera" size={20}/> Activar mi cámara <UiIcon name="arrow-right" size={17}/></motion.button>
            <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[.09] px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/15"><UiIcon name="shopping-bag" size={19}/> Explorar monturas <UiIcon name="arrow-up-right" size={16}/></a>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs leading-6 text-blue-100/65"><UiIcon name="lock" size={15}/> Tu cámara se activa únicamente cuando autorizas el acceso.</p>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .1 }} className="relative rounded-[30px] border border-white/15 bg-white/[.065] p-5 shadow-[0_24px_80px_rgba(0,0,0,.18)] backdrop-blur-xl sm:p-8" aria-label="Guía para usar el probador">
          <div className="mb-5 flex items-center justify-between"><span className="text-xs font-semibold tracking-[.1em] text-blue-100/80">TU EXPERIENCIA EN 3 PASOS</span><span className="rounded-full bg-[#1f7ee8]/20 px-3 py-1 text-[10px] font-bold text-[#8dc5ff]">FÁCIL Y RÁPIDO</span></div>
          <div className="gp-glasses-art relative mb-6 flex h-[140px] items-center justify-center overflow-hidden rounded-[22px] border border-white/10 sm:h-[195px]">
            <svg viewBox="0 0 420 170" className="h-auto w-[83%] max-w-[370px]" role="img" aria-label="Ilustración de una montura de gafas">
              <defs><linearGradient id="frameMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#73b5ff" /></linearGradient><linearGradient id="lensTint" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2c90ef" stopOpacity=".28"/><stop offset="100%" stopColor="#04356b" stopOpacity=".65"/></linearGradient></defs>
              <path d="M20 48Q92 12 170 54Q184 60 180 98Q176 144 98 145Q32 142 21 100Z" fill="url(#lensTint)" stroke="url(#frameMetal)" strokeWidth="8" />
              <path d="M240 54Q320 12 398 48L397 100Q387 143 322 145Q245 144 240 98Q236 60 240 54Z" fill="url(#lensTint)" stroke="url(#frameMetal)" strokeWidth="8" />
              <path d="M181 63Q209 38 238 63" fill="none" stroke="url(#frameMetal)" strokeWidth="9" strokeLinecap="round" />
              <path d="M20 52-2 43M399 52l22-9" fill="none" stroke="#a3cdff" strokeWidth="8" strokeLinecap="round" />
              <path d="M52 56c29-20 69-20 99-4M269 54c35-18 73-17 97 2" fill="none" stroke="white" strokeOpacity=".3" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] text-white/65">Vista ilustrativa</span>
          </div>
          <div className="grid gap-3">
            {[
              { icon: "camera" as const, number: "01", title: "Enciende tu cámara", text: "Coloca tu rostro frente a la pantalla." },
              { icon: "upload" as const, number: "02", title: "Carga una foto frontal", text: "Escoge la montura que te gustó y súbela." },
              { icon: "heart" as const, number: "03", title: "Quédate con tu favorita", text: "Ajusta el resultado y guarda tu foto." },
            ].map((item) => <div key={item.number} className="flex items-center gap-3 rounded-2xl bg-white/[.055] px-3.5 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1b6dd8]/25 text-[#a0ccff]"><UiIcon name={item.icon} size={19}/></span><div className="flex-1"><p className="text-xs font-bold"><span className="mr-2 text-[#8fc5ff]">{item.number}</span>{item.title}</p><p className="mt-1 text-[11px] leading-4 text-blue-100/60">{item.text}</p></div><UiIcon name="check" size={15} className="text-blue-300/60"/></div>)}
          </div>
        </motion.aside>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-blue-100/60"><span>Gafas Paisas · Medellín, Colombia</span><div className="sm:hidden"><InstagramLink variant="subtle" /></div><span className="hidden sm:block">Tu estilo empieza con una buena elección.</span></footer>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { CatalogModel } from "@/lib/catalog";
import { CATALOG_URL } from "@/lib/constants";
import { InstagramLink } from "./InstagramLink";
import { ModelPicker } from "./ModelPicker";
import { UiIcon, type IconName } from "./UiIcon";

type Props = {
  /** Modelos activos del catálogo para la galería. */
  catalog: CatalogModel[];
  selectedId: string | null;
  /** Entra al probador. Si llega un id, ese modelo queda preseleccionado. */
  onActivate: (modelId?: string) => void;
};

/** Lo que más vende de la marca: va arriba, no escondido. */
const PROMESAS: { icon: IconName; title: string; text: string }[] = [
  { icon: "bolt", title: "Hoy mismo", text: "en el Valle de Aburrá" },
  { icon: "wallet", title: "Contra entrega", text: "pagas cuando te llegan" },
  { icon: "shield", title: "UV400 real", text: "y con garantía" },
];

const PASOS: { icon: IconName; title: string; text: string; extra?: string }[] = [
  { icon: "shopping-bag", title: "Elige", text: "Toca el modelo que más te guste de la selección." },
  { icon: "camera", title: "Mírate", text: "Prende la cámara y te las ves puestas, en vivo." },
  { icon: "whatsapp", title: "Pídela", text: "Escríbenos por WhatsApp con un toque.", extra: "Antes de la 1, te llegan hoy" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

// Única secuencia orquestada de la página: el titular entra línea por línea.
const hero: Variants = { hidden: {}, show: { transition: { staggerChildren: .09, delayChildren: .05 } } };
const line: Variants = { hidden: { y: "105%" }, show: { y: "0%", transition: { duration: .8, ease: EASE } } };
const rise: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: .6, ease: EASE } } };

export function Landing({ catalog, selectedId, onActivate }: Props) {
  function verSeleccion() {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#06162f] px-5 py-6 text-white sm:px-10 lg:px-[clamp(32px,6vw,110px)] lg:py-10">
      <div aria-hidden className="gp-hero-glow pointer-events-none absolute inset-0 -z-10" />
      <header className="flex w-full items-center justify-between gap-3">
        <Image src="/brand/logo-blanco.png" alt="Gafas Paisas" width={174} height={75} priority className="h-auto w-[140px] object-contain sm:w-[176px]" />
        <div className="sm:hidden"><InstagramLink variant="subtle" iconOnly /></div>
        <div className="hidden sm:block"><InstagramLink variant="subtle" /></div>
      </header>

      <div className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-10 pb-10 pt-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-14 lg:py-14">
        <motion.section variants={hero} initial="hidden" animate="show">
          <h1 className="font-display max-w-[680px] text-[clamp(3.4rem,10vw,6.6rem)] leading-[.92]">
            {["Pruébate", "tu actitud."].map((t) => (
              <span key={t} className="-mt-[.16em] block overflow-hidden pb-[.04em] pt-[.16em]"><motion.span variants={line} className="block">{t}</motion.span></span>
            ))}
          </h1>
          <motion.p variants={rise} className="mt-5 max-w-[30ch] text-lg font-semibold leading-snug text-[#cfe3ff] sm:text-xl">
            Antes de pedirlas, mírate con ellas puestas.
          </motion.p>
          <motion.p variants={rise} className="mt-3 max-w-[44ch] text-[15px] leading-7 text-blue-100/75">
            Prende la cámara, toca un modelo y te lo ves en la cara en tiempo real. ¿Te gustó? Lo pides por WhatsApp y en Medellín te llega hoy.
          </motion.p>

          <motion.div variants={rise} className="mt-8 flex max-w-[500px] flex-col gap-3 sm:flex-row">
            <motion.button
              whileTap={{ scale: .97 }}
              whileHover={{ y: -2 }}
              onClick={() => onActivate(selectedId ?? undefined)}
              className="gp-shine relative inline-flex min-h-[58px] flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brand-orange px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_42px_rgba(255,77,46,.32)] transition-colors hover:bg-brand-orange-dark"
            >
              <UiIcon name="camera" size={20} /> Prender cámara
            </motion.button>
            <motion.button
              whileTap={{ scale: .97 }}
              type="button"
              onClick={verSeleccion}
              className="inline-flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[.07] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-white/15"
            >
              Ver las gafas
            </motion.button>
          </motion.div>

          {/* Privacidad en palabras simples, justo donde nace la duda: antes de prender la cámara. */}
          <motion.div variants={rise} className="mt-4 flex max-w-[500px] gap-3 rounded-2xl border border-white/10 bg-[#041027]/40 px-4 py-3.5">
            <UiIcon name="lock" size={18} className="mt-0.5 text-[#8fc8ff]" />
            <p className="text-[13px] leading-5 text-blue-100/80">
              <strong className="font-bold text-white">No te pedimos ningún dato.</strong> La cámara solo se prende cuando tú lo autorizas, y tu imagen se queda en tu celular: no la grabamos ni nos llega.{" "}
              <Link href="/privacidad" className="font-semibold text-[#8fc8ff] underline underline-offset-2">Cómo cuidamos tus datos</Link>
            </p>
          </motion.div>

          <motion.ul variants={rise} className="mt-8 flex max-w-[520px] flex-wrap gap-x-6 gap-y-3" aria-label="Por qué Gafas Paisas">
            {PROMESAS.map((p) => (
              <li key={p.title} className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0669e6]/25 text-[#8fc8ff]"><UiIcon name={p.icon} size={17} /></span>
                <span className="text-[13px] leading-tight"><strong className="block font-extrabold">{p.title}</strong><span className="text-blue-100/60">{p.text}</span></span>
              </li>
            ))}
          </motion.ul>
        </motion.section>

        {/* Así de fácil: es un proceso real de 3 pasos, por eso va numerado. El último (pedir) se resalta en naranja. */}
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .35, ease: EASE }}
          className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-b from-white/[.09] to-white/[.03] p-5 backdrop-blur-xl sm:p-8"
          aria-labelledby="pasos-title"
        >
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#0669e6]/30 blur-3xl" />
          <h2 id="pasos-title" className="font-display text-[2.1rem] leading-none sm:text-[2.6rem]">Así de fácil</h2>
          <p className="mt-2 text-sm text-blue-100/65">De verlas a tenerlas puestas, en tres toques.</p>

          <ol className="mt-6 grid gap-2.5">
            {PASOS.map((item, i) => {
              const final = i === PASOS.length - 1;
              return (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .55, delay: .6 + i * .15, ease: EASE }}
                  className={`relative overflow-hidden rounded-2xl border px-3.5 py-4 sm:px-4 ${final ? "border-brand-orange/50 bg-brand-orange/[.12]" : "border-white/10 bg-white/[.05]"}`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* El número es el ancla visual de cada paso. */}
                    <span aria-hidden className={`font-display w-8 shrink-0 text-center text-[2.8rem] leading-none ${final ? "text-brand-orange" : "text-[#8fc8ff]"}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[17px] font-extrabold leading-tight">
                        {item.title}
                        <UiIcon name={item.icon} size={17} className={final ? "text-brand-orange" : "text-[#8fc8ff]/80"} />
                      </p>
                      <p className="mt-1 text-[14px] leading-snug text-blue-50/85">{item.text}</p>
                    </div>
                  </div>
                  {item.extra && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-brand-orange px-3 py-1.5 text-[12.5px] font-bold text-white">
                      <UiIcon name="bolt" size={14} /> {item.extra}
                    </p>
                  )}
                </motion.li>
              );
            })}
          </ol>
        </motion.aside>
      </div>

      {catalog.length > 0 && (
        <section id="catalogo" className="mx-auto w-full max-w-[1200px] scroll-mt-4 pb-12" aria-labelledby="catalogo-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-[560px]">
              <h2 id="catalogo-title" className="font-display text-[2.2rem] leading-[.95] sm:text-5xl">Seleccionadas para probártelas</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100/75">
                Estas {catalog.length} las escogimos para que te las pruebes aquí mismo. Pero no son todas: en el catálogo completo tenemos muchas más referencias para elegir y comprar.
              </p>
            </div>
            <CatalogoCompletoLink variant="ghost" />
          </div>
          <ModelPicker models={catalog} selectedId={selectedId} onSelect={(id) => onActivate(id)} className="lg:grid-cols-5" filterable />
          <CatalogoCompletoBanner />
        </section>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[12px] text-blue-100/60">
        <span>Gafas Paisas, Medellín. La actitud te hace.</span>
        <Link href="/privacidad" className="underline-offset-2 hover:underline">Aviso de privacidad</Link>
      </footer>
    </main>
  );
}

/** Botón al catálogo completo (Drive). Abre en otra pestaña. */
export function CatalogoCompletoLink({ variant = "solid", className = "" }: { variant?: "solid" | "ghost"; className?: string }) {
  const styles = variant === "solid"
    ? "bg-white text-[#06162f] hover:bg-[#eaf1fd]"
    : "border border-white/25 bg-white/[.06] text-white hover:bg-white/15";
  return (
    <motion.a
      whileTap={{ scale: .97 }}
      href={CATALOG_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-colors ${styles} ${className}`}
    >
      Ver catálogo completo
      <UiIcon name="arrow-up-right" size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </motion.a>
  );
}

function CatalogoCompletoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .4 }}
      transition={{ duration: .7, ease: EASE }}
      className="relative mt-8 overflow-hidden rounded-[28px] bg-[#0064e0] px-6 py-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-10"
    >
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
      <div className="relative max-w-[520px]">
        <p className="font-display text-[2rem] leading-[.95] sm:text-[2.6rem]">¿No viste la tuya?</p>
        <p className="mt-3 text-[15px] leading-6 text-white/85">Hay muchas más referencias en el catálogo completo. Escoge la que quieras y nos escribes por WhatsApp para pedirla.</p>
      </div>
      <CatalogoCompletoLink className="relative mt-6 w-full sm:mt-0 sm:w-auto sm:shrink-0" />
    </motion.div>
  );
}

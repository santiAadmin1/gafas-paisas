"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { InstagramLink } from "./InstagramLink";
import { UiIcon } from "./UiIcon";

type Props = { onContinue: (phone: string) => void };

const GUIDE = [
  { number: "01", title: "Tu acceso", description: "Ingresa tu celular para entrar al probador." },
  { number: "02", title: "Tu cámara", description: "Actívala cuando estés listo para probar." },
  { number: "03", title: "Tus gafas", description: "Sube una foto frontal y descubre cómo te quedan." },
];

/**
 * Deja solo los 10 dígitos del celular. Sin `maxLength` en el input: el
 * navegador cortaría un valor pegado/autocompletado ("300 123 4567",
 * "+57 300…") antes de quitarle espacios y el indicativo.
 */
function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("57")) digits = digits.slice(2);
  return digits.slice(0, 10);
}

export function PhoneGate({ onContinue }: Props) {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const validPhone = /^3\d{9}$/.test(phone);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validPhone) {
      setError("Revisa tu número: debe tener 10 dígitos y comenzar por 3.");
      return;
    }
    if (!consent) {
      setError("Para continuar, confirma que leíste el aviso sobre el funcionamiento de esta demostración.");
      return;
    }
    setError("");
    onContinue(phone);
  }

  return (
    <main className="min-h-dvh bg-[#f8fbff] text-[#0d2445] lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(400px,.92fr)]">
      <section className="relative isolate flex flex-col overflow-hidden bg-[#061a36] px-6 pb-9 pt-8 text-white sm:px-10 lg:min-h-dvh lg:justify-between lg:px-[clamp(40px,5vw,100px)] lg:py-11">
        <div aria-hidden className="gp-hero-glow pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="pointer-events-none absolute -right-28 top-[26%] -z-10 hidden h-[490px] w-[490px] rounded-full border border-white/[.075] shadow-[0_0_0_80px_rgba(255,255,255,.02),0_0_0_160px_rgba(255,255,255,.01)] lg:block" />
        <div className="flex items-center justify-between gap-4">
          <Image src="/brand/logo-blanco.png" alt="Gafas Paisas" width={184} height={75} priority className="h-auto w-[147px] object-contain sm:w-[170px]" />
          <span className="rounded-full border border-white/20 bg-white/[.08] px-3 py-2 text-[10px] font-bold tracking-[.14em] text-blue-100">PRUEBA VIRTUAL</span>
        </div>

        <div className="relative max-w-[690px] py-12 lg:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-blue-300/10 px-3.5 py-2 text-[11px] font-medium text-blue-100"><UiIcon name="sparkles" size={15} /> DESCUBRE TU ESTILO</span>
          <h1 className="mt-7 text-[clamp(2.55rem,5.6vw,5.35rem)] font-extrabold leading-[1.045] tracking-[-.067em]">
            Tus próximas gafas. <span className="block text-[#91c7ff]">Primero en ti.</span>
          </h1>
          <p className="mt-6 max-w-[500px] text-sm leading-[1.9] text-blue-100/85 sm:text-base">
            Mira cómo te quedan distintas monturas antes de elegir. Enciende tu cámara, sube una referencia y pruébatela en tiempo real.
          </p>
          <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3 lg:mt-12 lg:gap-4">
            {GUIDE.map((step) => <div key={step.number} className="flex gap-3 rounded-2xl border border-white/[.12] bg-white/[.07] px-4 py-4 backdrop-blur-sm sm:flex-col sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1d6fda]/35 text-xs font-extrabold text-[#a5d4ff]">{step.number}</span>
              <div><p className="text-xs font-bold text-white sm:text-[13px]">{step.title}</p><p className="mt-1 text-[11px] leading-[1.65] text-blue-100/70">{step.description}</p></div>
            </div>)}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="flex items-center gap-2 text-xs text-blue-100/75"><UiIcon name="shield" size={17} /> Tu cámara solo se activa con tu permiso.</p>
          <InstagramLink variant="subtle" />
        </div>
      </section>

      <section className="flex min-h-[500px] items-center justify-center px-6 py-12 sm:px-10 lg:px-[clamp(42px,5vw,96px)]" aria-labelledby="phone-title">
        <div className="w-full max-w-[455px]">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d5e6f9] bg-[#eaf4ff] text-[#086ae2]"><UiIcon name="phone" size={27} /></span>
          <div className="mt-7 flex items-center gap-2 text-[11px] font-extrabold tracking-[.17em] text-[#0067e2]"><span className="h-1.5 w-1.5 rounded-full bg-[#0068e8]" /> UN PASO PARA COMENZAR</div>
          <h2 id="phone-title" className="mt-3 text-[clamp(2rem,3.15vw,2.8rem)] font-extrabold leading-[1.14] tracking-[-.06em] text-[#071b37]">¿Listo para encontrar tu estilo?</h2>
          <p className="mt-4 text-[13px] leading-[1.85] text-[#667993] sm:text-sm">Ingresa tu número de celular y comienza tu experiencia con Gafas Paisas.</p>

          <form onSubmit={submit} noValidate className="mt-8">
            <label htmlFor="phone" className="mb-2.5 block text-sm font-semibold">Tu número de celular</label>
            <div className={`flex h-[60px] items-center rounded-2xl border bg-white px-4 transition focus-within:border-[#0567df] focus-within:ring-4 focus-within:ring-blue-100 ${error && !validPhone ? "border-red-400" : "border-[#d5e2f2]"}`}>
              <span className="shrink-0 text-sm font-bold text-[#1c3f67]">🇨🇴 +57</span>
              <span aria-hidden className="mx-4 h-6 w-px bg-[#d9e4f1]" />
              <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="3[0-9]{9}" placeholder="300 123 4567" value={phone}
                onChange={(event) => {setPhone(normalizePhone(event.target.value));setError("");}}
                aria-invalid={Boolean(error && !validPhone)} aria-describedby="phone-help phone-error" className="min-w-0 flex-1 bg-transparent text-base font-semibold tracking-[.08em] text-[#0c2a4d] outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-[#9eb0c5]" required />
              {validPhone && <UiIcon name="check" size={19} className="text-[#00815b]" />}
            </div>
            <p id="phone-help" className="mt-3 text-xs leading-5 text-[#697e98]">10 dígitos, comenzando por 3. No enviamos SMS ni validamos tu identidad en esta demo.</p>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#edf4fc] p-3.5 text-[12px] leading-[1.75] text-[#526983]">
              <input type="checkbox" checked={consent} onChange={(event) => {setConsent(event.target.checked);setError("");}} className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#0068e8]" />
              <span>Leí el <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className="font-bold text-[#005bc9] underline underline-offset-2">aviso de privacidad</Link> y comprendo que el registro funciona únicamente en este navegador, durante la sesión.</span>
            </label>
            {error && <p id="phone-error" role="alert" className="mt-4 text-xs font-semibold leading-6 text-red-600">{error}</p>}
            <button type="submit" className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0669e6] px-6 py-4 text-sm font-bold text-white shadow-[0_11px_24px_rgba(0,100,224,.2)] transition hover:bg-[#0051bc] active:scale-[.99]">Comenzar mi prueba <UiIcon name="arrow-right" size={18} /></button>
          </form>
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-[#72849a]"><UiIcon name="lock" size={13} /> Tu número solo se mantiene en esta sesión de demostración.</p>
          <div className="mt-9 flex items-center justify-between border-t border-[#e4edf7] pt-5 text-[11px] text-[#8b9aae]"><span>Gafas Paisas · Medellín</span><a href="https://www.instagram.com/gafaspaisas.co/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#0068e8] hover:underline"><UiIcon name="instagram" size={16}/> Nuestro Instagram <UiIcon name="arrow-up-right" size={13}/></a></div>
        </div>
      </section>
    </main>
  );
}

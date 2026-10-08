"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

type PhoneGateProps = { onContinue: (phone: string) => void };

const STEPS = [
  { number: "01", title: "Registra tu celular", description: "Solo necesitamos un número válido" },
  { number: "02", title: "Activa tu cámara", description: "Tú decides cuándo usarla" },
  { number: "03", title: "Encuentra tu estilo", description: "Prueba monturas sobre tu rostro" },
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

export function PhoneGate({ onContinue }: PhoneGateProps) {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!/^3\d{9}$/.test(digits)) {
      setError("Ingresa un número celular colombiano válido de 10 dígitos, que comience por 3.");
      return;
    }
    if (!consent) {
      setError("Debes leer y aceptar el aviso de privacidad de este prototipo.");
      return;
    }
    setError("");
    onContinue(digits);
  }

  return (
    <main className="min-h-dvh bg-white text-[#182b49] md:grid md:grid-cols-[minmax(0,1.12fr)_minmax(390px,.88fr)]">
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_72%_24%,#1761c2_0%,#0b3267_37%,#071832_76%,#061226_100%)] px-6 py-9 text-white sm:px-10 md:flex md:min-h-dvh md:flex-col md:justify-between md:px-[min(6vw,92px)] md:py-11">
        <div aria-hidden className="pointer-events-none absolute -right-44 top-20 -z-10 h-[570px] w-[570px] rounded-full border border-white/10 shadow-[0_0_0_90px_rgba(255,255,255,.018),0_0_0_190px_rgba(255,255,255,.012)]" />
        <div className="flex items-center justify-between gap-3">
          <Image src="/brand/logo-blanco.png" alt="Gafas Paisas" width={175} height={73} priority className="h-auto w-[152px] object-contain sm:w-[180px]" />
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[9px] font-bold tracking-[.18em] text-blue-100">PROBADOR VIRTUAL</span>
        </div>
        <div className="relative mx-auto max-w-[590px] py-12 md:mx-0 md:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-blue-100">
            <span aria-hidden>✦</span> Una nueva forma de elegir tus gafas
          </span>
          <h1 className="mt-7 text-[clamp(2.35rem,4.6vw,4.8rem)] font-extrabold leading-[1.12] tracking-[-.055em]">
            Las gafas perfectas.<span className="block text-[#7ab9ff]">A tu manera.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-blue-100/85 sm:text-base">
            Descubre cómo se ven tus próximas gafas antes de comprarlas, en tiempo real y desde tu dispositivo.
          </p>
          <div className="mt-9 hidden space-y-6 md:block">
            {STEPS.map((step) => (
              <div className="flex items-center gap-4" key={step.number}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-blue-500/20 text-sm font-extrabold text-[#98cbff]">{step.number}</span>
                <div><p className="text-sm font-semibold">{step.title}</p><p className="mt-1 text-xs text-blue-100/65">{step.description}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="hidden border-t border-white/15 pt-6 text-xs text-blue-100/70 md:block">🔒 La cámara solo se activa cuando lo autorizas.</p>
      </section>

      <section className="flex min-h-[480px] items-center justify-center px-6 py-12 sm:px-10 md:px-[min(5vw,80px)]" aria-labelledby="phone-title">
        <div className="w-full max-w-[440px]">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-[#d5e8ff] bg-[#eaf3ff] text-[29px]">📱</span>
          <p className="mt-7 text-xs font-extrabold tracking-[.2em] text-[#0667df]">PASO 01 · ACCESO</p>
          <h2 id="phone-title" className="mt-3 text-[clamp(1.9rem,3vw,2.5rem)] font-extrabold leading-tight tracking-[-.045em] text-[#0d1c36]">Comencemos con tu número.</h2>
          <p className="mt-4 text-sm leading-7 text-[#687b97]">Ingresa tu celular para acceder al probador virtual de Gafas Paisas.</p>
          <form noValidate onSubmit={submit} className="mt-9">
            <label htmlFor="phone" className="mb-3 block text-sm font-semibold text-[#263954]">Número de celular</label>
            <div className="flex h-[60px] items-center rounded-2xl border border-[#d6e3f1] bg-white px-4 transition focus-within:border-[#0064e0] focus-within:ring-4 focus-within:ring-blue-100">
              <span className="shrink-0 text-sm font-extrabold text-[#263954]">🇨🇴 +57</span>
              <span aria-hidden className="mx-4 h-7 w-px bg-[#d6e3f1]" />
              <input id="phone" name="phone" type="tel" autoComplete="tel-national" inputMode="numeric" placeholder="300 123 4567" value={phone} onChange={(event) => {setPhone(normalizePhone(event.target.value)); setError("");}} aria-invalid={Boolean(error)} aria-describedby="phone-help phone-error" className="min-w-0 flex-1 bg-transparent text-base font-semibold tracking-wider text-[#163252] outline-none placeholder:font-normal placeholder:text-[#a5b2c4]" required />
            </div>
            <p id="phone-help" className="mt-3 text-xs leading-5 text-[#8291a8]">Usa un número colombiano de 10 dígitos. No se enviará ningún código SMS en esta demostración.</p>
            <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs leading-6 text-[#64748b]">
              <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setError(""); }} className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#0064e0]" />
              <span>He leído el <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0064e0] underline underline-offset-2">aviso sobre el uso de datos</Link> y entiendo que este es un registro local de demostración.</span>
            </label>
            {error && <p id="phone-error" className="mt-4 text-xs font-semibold leading-5 text-red-600" role="alert">{error}</p>}
            <button type="submit" className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0064e0] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,100,224,.22)] transition hover:bg-[#004fb7] focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-300">Continuar al probador <span aria-hidden>→</span></button>
          </form>
          <p className="mt-6 text-center text-xs text-[#8a9aab]">🔒 En esta versión, el número permanece solamente en la sesión de tu navegador.</p>
          <p className="mt-10 text-center text-[11px] text-[#9ba9b9]">© Gafas Paisas · Medellín, Colombia</p>
        </div>
      </section>
    </main>
  );
}

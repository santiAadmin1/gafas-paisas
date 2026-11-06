import Image from "next/image";
import Link from "next/link";
import { InstagramLink } from "@/components/InstagramLink";
import { UiIcon } from "@/components/UiIcon";

export const metadata = { title: "Privacidad | Gafas Paisas", description: "Cómo cuida Gafas Paisas tus datos en el probador virtual." };

export default function PrivacyPage() {
  return <main className="min-h-dvh bg-[#eef5fd] px-4 py-9 text-[#173252] sm:px-7 sm:py-14"><article className="mx-auto max-w-3xl rounded-[28px] border border-[#dce8f5] bg-white px-6 py-9 shadow-[0_25px_65px_rgba(15,48,86,.07)] sm:px-12 sm:py-12">
    <Image src="/brand/logo-azul.png" alt="Gafas Paisas" width={170} height={72} className="h-auto w-[165px] object-contain" />
    <p className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#0669e6]"><UiIcon name="shield" size={17}/> TU PRIVACIDAD IMPORTA</p>
    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#081e3c] sm:text-4xl">Así cuidamos tus datos en el probador.</h1>
    <p className="mt-5 text-sm leading-7 text-[#58708a]">El probador virtual <strong>no te pide registro</strong>: no solicitamos tu nombre, tu celular ni tu correo para usarlo.</p>
    <div className="mt-8 space-y-7 text-sm leading-7 text-[#58708a]">
      <section><h2 className="text-lg font-extrabold text-[#143352]">¿Qué pasa con la cámara y las fotos?</h2><p className="mt-2">La cámara solo se activa con tu permiso. El seguimiento de tu rostro y la superposición de las gafas se procesan en tu propio dispositivo: la imagen de la cámara no se envía a Gafas Paisas. Las fotos que tomas solo salen de tu celular si tú decides guardarlas o compartirlas.</p></section>
      <section><h2 className="text-lg font-extrabold text-[#143352]">¿Y cuando pido por WhatsApp?</h2><p className="mt-2">Al tocar “Pedir por WhatsApp” se abre un chat con Gafas Paisas con un mensaje que tú puedes revisar antes de enviarlo. A partir de ahí la conversación ocurre en WhatsApp, un servicio de terceros con sus propias condiciones.</p></section>
      <section><h2 className="text-lg font-extrabold text-[#143352]">Enlaces externos</h2><p className="mt-2">Instagram y WhatsApp se abren en servicios de terceros, sujetos a sus propias condiciones y avisos de privacidad.</p></section>
    </div>
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6edf7] pt-7"><Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#0669e6] px-5 py-3 text-sm font-bold text-white hover:bg-[#0053c2]"><UiIcon name="arrow-right" size={17} className="rotate-180"/> Volver al probador</Link><InstagramLink variant="dark" /></div>
  </article></main>;
}

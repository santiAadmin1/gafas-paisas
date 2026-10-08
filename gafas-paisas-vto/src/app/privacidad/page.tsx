import Image from "next/image";
import Link from "next/link";
import { InstagramLink } from "@/components/InstagramLink";
import { UiIcon } from "@/components/UiIcon";

export const metadata = { title: "Privacidad de la demostración | Gafas Paisas", description: "Conoce cómo funciona el registro temporal de la experiencia de prueba virtual de Gafas Paisas." };

export default function PrivacyPage() {
  return <main className="min-h-dvh bg-[#eef5fd] px-4 py-9 text-[#173252] sm:px-7 sm:py-14"><article className="mx-auto max-w-3xl rounded-[28px] border border-[#dce8f5] bg-white px-6 py-9 shadow-[0_25px_65px_rgba(15,48,86,.07)] sm:px-12 sm:py-12">
    <Image src="/brand/logo-azul.png" alt="Gafas Paisas" width={170} height={72} className="h-auto w-[165px] object-contain" />
    <p className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#0669e6]"><UiIcon name="shield" size={17}/> TU PRIVACIDAD IMPORTA</p>
    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#081e3c] sm:text-4xl">Antes de comenzar, conoce cómo usamos tus datos.</h1>
    <p className="mt-5 text-sm leading-7 text-[#58708a]">Esta versión es una <strong>demostración técnica</strong> del probador virtual Gafas Paisas. El campo de celular no crea una cuenta y <strong>no envía SMS ni transmite tu número a una base de datos</strong>.</p>
    <div className="mt-8 space-y-7 text-sm leading-7 text-[#58708a]">
      <section><h2 className="text-lg font-extrabold text-[#143352]">¿Para qué pedimos el celular?</h2><p className="mt-2">Para mostrar el flujo de acceso de la futura aplicación. En esta demostración se valida únicamente el formato colombiano: diez dígitos, comenzando por 3. <strong>No se confirma que el número te pertenezca.</strong></p></section>
      <section><h2 className="text-lg font-extrabold text-[#143352]">¿Se guarda tu número?</h2><p className="mt-2">Se conserva temporalmente en <code>sessionStorage</code> de tu navegador. Puedes eliminarlo con el botón “Salir”. No se envía a servidores de Gafas Paisas desde este formulario.</p></section>
      <section><h2 className="text-lg font-extrabold text-[#143352]">¿Qué sucede con la cámara y las fotos?</h2><p className="mt-2">Solo se accede a la cámara con tu permiso. La superposición y el seguimiento facial se procesan en el dispositivo. La app no envía automáticamente tu imagen a Gafas Paisas. Si decides descargar o compartir una captura, esa acción es voluntaria.</p></section>
      <section><h2 className="text-lg font-extrabold text-[#143352]">Enlaces externos</h2><p className="mt-2">El catálogo y el perfil de Instagram se abren en servicios de terceros, sujetos a sus propias condiciones y avisos de privacidad. Al abrirlos, dejarás esta experiencia o usarás otra pestaña.</p></section>
      <section><h2 className="text-lg font-extrabold text-[#143352]">Antes de usar esto en producción</h2><p className="mt-2">Para registrar clientes realmente, la empresa deberá publicar su política de tratamiento de datos personales, identificar al responsable y sus canales de contacto, documentar las finalidades, solicitar la autorización correspondiente cuando aplique e implementar almacenamiento seguro, gestión y eliminación de datos. Esta explicación del prototipo no reemplaza esos requisitos.</p></section>
    </div>
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6edf7] pt-7"><Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#0669e6] px-5 py-3 text-sm font-bold text-white hover:bg-[#0053c2]"><UiIcon name="arrow-right" size={17} className="rotate-180"/> Volver al probador</Link><InstagramLink variant="dark" /></div>
  </article></main>;
}

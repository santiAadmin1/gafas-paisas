import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Aviso de privacidad del prototipo | Gafas Paisas",
  description: "Información sobre el tratamiento local de datos en la demostración del probador virtual.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#f0f5fc] px-5 py-10 text-[#182b49] sm:py-16">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-[#e0e9f5] bg-white px-6 py-9 shadow-xl shadow-blue-900/5 sm:px-12 sm:py-12">
        <Image src="/brand/logo-azul.png" alt="Gafas Paisas" width={180} height={76} className="h-auto w-40" />
        <p className="mt-8 text-xs font-bold tracking-[.16em] text-[#0064e0]">INFORMACIÓN SOBRE EL PROTOTIPO</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Aviso de privacidad</h1>
        <p className="mt-6 text-sm leading-7 text-[#596c84]">Esta versión del probador virtual es una demostración técnica. La pantalla de acceso solicita un celular colombiano, pero <strong>no lo envía a un servidor, no genera cuentas y no verifica el número por SMS</strong>.</p>
        <h2 className="mt-8 text-xl font-bold">¿Dónde queda el número?</h2>
        <p className="mt-3 text-sm leading-7 text-[#596c84]">Se conserva únicamente en <code>sessionStorage</code> del navegador para mantener el acceso durante esa sesión. Puedes eliminarlo pulsando “Salir”. También se elimina normalmente al cerrar la sesión de navegación. No se incorpora a ninguna base de datos.</p>
        <h2 className="mt-8 text-xl font-bold">¿Qué sucede con la cámara?</h2>
        <p className="mt-3 text-sm leading-7 text-[#596c84]">El navegador solicita permiso para usarla. El procesamiento del rostro y la superposición de las gafas se ejecutan en el dispositivo. Las fotografías se crean al elegir la opción de captura; pueden compartirse posteriormente por decisión del usuario. Este prototipo no envía automáticamente dichas fotografías a Gafas Paisas.</p>
        <h2 className="mt-8 text-xl font-bold">Pendiente antes del lanzamiento público</h2>
        <p className="mt-3 text-sm leading-7 text-[#596c84]">Para registrar números de clientes de manera real, Gafas Paisas deberá implementar almacenamiento seguro, una política de tratamiento de datos personales con identificación y contacto del responsable, finalidades, derechos del titular y mecanismos de consulta/supresión, así como la autorización aplicable. Este aviso técnico no sustituye esa política.</p>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-[#0064e0] px-6 py-3 text-sm font-bold text-white hover:bg-[#0053be]">← Volver al probador</Link>
      </article>
    </main>
  );
}

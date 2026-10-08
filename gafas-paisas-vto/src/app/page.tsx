"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { PhoneGate } from "@/components/PhoneGate";
import { Landing } from "@/components/Landing";
import { CameraStage, type CameraStageHandle } from "@/components/CameraStage";
import { ControlPanel } from "@/components/ControlPanel";
import { CapturePreview } from "@/components/CapturePreview";
import { FavoritesDrawer } from "@/components/FavoritesDrawer";
import { AdjustPanel } from "@/components/AdjustPanel";
import { InstagramLink } from "@/components/InstagramLink";
import { UiIcon } from "@/components/UiIcon";
import { useSession } from "@/hooks/useSession";

const PHONE_SESSION_KEY = "gafas-paisas-demo-telefono";

function readStoredPhone(): string | null {
  try {
    const storedPhone = window.sessionStorage.getItem(PHONE_SESSION_KEY);
    return storedPhone && /^3\d{9}$/.test(storedPhone) ? storedPhone : null;
  } catch {
    return null; // El registro funciona sin almacenamiento.
  }
}

const subscribeNoop = () => () => {};

export default function Home() {
  // undefined = aún en el servidor / hidratando (sessionStorage no disponible).
  const storedPhone = useSyncExternalStore(subscribeNoop, readStoredPhone, () => undefined);
  const [phoneOverride, setPhone] = useState<string | null | undefined>(undefined);
  const phone = phoneOverride !== undefined ? phoneOverride : storedPhone;

  function continueWithPhone(value: string) {
    try { window.sessionStorage.setItem(PHONE_SESSION_KEY, value); } catch { /* Navegación privada. */ }
    setPhone(value);
  }

  function exit() {
    try { window.sessionStorage.removeItem(PHONE_SESSION_KEY); } catch { /* No disponible. */ }
    // Desmontar TryOnExperience también libera la cámara y vacía gafas/favoritos temporales.
    setPhone(null);
  }

  if (phone === undefined) return <main className="grid min-h-dvh place-items-center bg-[#06162f] text-sm text-blue-100/70">Preparando tu experiencia Gafas Paisas…</main>;
  if (!phone) return <PhoneGate onContinue={continueWithPhone} />;
  return <TryOnExperience key={phone} phone={phone} onExit={exit} />;
}

function TryOnExperience({ phone, onExit }: { phone: string; onExit: () => void }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [capture, setCapture] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const stageRef = useRef<CameraStageHandle>(null);
  const session = useSession();

  function deactivateCamera() {
    setCameraActive(false); // Desmonta CameraStage y libera el stream de la webcam.
    setShowAdjust(false);
    setCapture(null);
    setUploadError(null);
  }

  async function uploadPhoto(file: File, side: "front" | "temple") {
    setUploadError(null);
    try {
      if (side === "front") await session.addGlasses(file);
      else await session.addTemple(file);
    } catch {
      setUploadError("No pudimos preparar esa imagen. Prueba con una foto clara en JPG, PNG o WebP, preferiblemente con fondo uniforme.");
    }
  }

  if (!cameraActive) return <Landing onActivate={() => setCameraActive(true)} onExit={onExit} />;

  return <div className="flex h-dvh min-h-[490px] w-full flex-col overflow-hidden bg-[#050d1c] text-white">
    <header className="z-20 flex min-h-[67px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#071832] px-3 sm:px-7">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
        <Image src="/brand/logo-blanco.png" width={150} height={66} alt="Gafas Paisas" priority className="h-auto w-[96px] shrink-0 object-contain sm:w-[130px]" />
        <span className="hidden border-l border-white/20 pl-4 text-[10px] font-bold tracking-[.13em] text-blue-100/75 md:block">TU PROBADOR VIRTUAL</span>
      </div>
      <nav className="flex items-center gap-1.5 sm:gap-3" aria-label="Opciones del probador">
        <span className="hidden text-[11px] text-blue-100/55 lg:inline">Celular terminado en {phone.slice(-4)}</span>
        <div className="sm:hidden"><InstagramLink variant="subtle" iconOnly /></div>
        <div className="hidden sm:block"><InstagramLink variant="subtle" compact /></div>
        <button type="button" onClick={deactivateCamera} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-white/20 sm:px-4"><UiIcon name="camera" size={15}/><span className="hidden min-[365px]:inline">Apagar cámara</span><span className="min-[365px]:hidden">Cerrar</span></button>
        <button type="button" onClick={onExit} title="Salir y borrar los datos temporales de la sesión" className="rounded-full border border-[#3d86e9]/50 bg-[#0a5fcf] px-3 py-2.5 text-[11px] font-bold transition hover:bg-[#0669e6] sm:px-4">Salir</button>
      </nav>
    </header>

    <section className="relative min-h-0 flex-1 overflow-hidden bg-black" aria-label="Imagen de la cámara con gafas virtuales">
      <CameraStage ref={stageRef} glasses={session.current} adjustment={session.currentAdjustment} />
      <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-[10px] font-bold tracking-[.08em] text-white/90 backdrop-blur-sm sm:left-6 sm:top-5"><span className="h-[7px] w-[7px] rounded-full bg-[#7dbbff] shadow-[0_0_9px_#7dbbff]"/> PRUEBA VIRTUAL</div>
      {!session.current && <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-[min(93%,450px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#071832]/80 px-4 py-3 text-center backdrop-blur-md sm:bottom-6"><p className="text-xs font-bold sm:text-sm">Tus próximas gafas te esperan 👓</p><p className="mt-1 text-[11px] leading-5 text-white/75">Explora el catálogo y sube la foto frontal de un modelo para probártelo aquí.</p></div>}
      {showAdjust && session.current && <AdjustPanel onNudge={(delta) => session.nudgeAdjustment(session.current!.id, delta)} onReset={() => session.resetAdjustment(session.current!.id)} onClose={() => setShowAdjust(false)} />}
    </section>

    <div className="max-h-[55dvh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#071832]">
      <ControlPanel items={session.items} current={session.current} processing={session.processing} error={uploadError} onUpload={(file) => {void uploadPhoto(file,"front");}} onUploadTemple={(file) => {void uploadPhoto(file,"temple");}} onPrev={session.prev} onNext={session.next} onRemoveCurrent={session.removeCurrent}
        onCapture={() => {const dataUrl = stageRef.current?.capture();if (dataUrl) setCapture(dataUrl);}}
        onOpenFavorites={() => setShowFavorites(true)} onOpenAdjust={() => setShowAdjust((value) => !value)} favoritesCount={session.favorites.length} />
    </div>

    {capture && <CapturePreview captureDataUrl={capture} glassesName={session.current?.name ?? "Gafas Paisas"} favoritesFull={session.favoritesFull} onClose={() => setCapture(null)} onSaveFavorite={() => {session.addFavorite(capture, session.current?.name ?? "Gafas Paisas");setCapture(null);}} />}
    {showFavorites && <FavoritesDrawer favorites={session.favorites} onClose={() => setShowFavorites(false)} onRemove={session.removeFavorite} />}
  </div>;
}

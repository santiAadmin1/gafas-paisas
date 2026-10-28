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
import { ModelPicker } from "@/components/ModelPicker";
import { UiIcon } from "@/components/UiIcon";
import { useSession } from "@/hooks/useSession";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/constants";

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
  const [showCatalog, setShowCatalog] = useState(false);
  // Pantalla completa: oculta el encabezado y el panel para dejar solo la cámara.
  const [fullscreen, setFullscreen] = useState(false);
  const [capture, setCapture] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const stageRef = useRef<CameraStageHandle>(null);
  const session = useSession();

  // Pedido conservando el CÓDIGO solicitado + nombre (no inventa precio).
  const orderUrl = session.selectedModel
    ? buildWhatsAppUrl(buildOrderMessage(session.selectedModel.id, session.selectedModel.name))
    : null;

  function activate(modelId?: string) {
    setCameraActive(true);
    if (modelId) session.loadModel(modelId);
  }

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

  if (!cameraActive) return <Landing catalog={session.catalog} selectedId={session.selectedModelId} onActivate={activate} onExit={onExit} />;

  return <div className="flex h-dvh min-h-[490px] w-full flex-col overflow-hidden bg-[#050d1c] text-white">
    {!fullscreen && <header className="z-20 flex min-h-[67px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#071832] px-3 sm:px-7">
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
    </header>}

    <section className="relative min-h-0 flex-1 overflow-hidden bg-black" aria-label="Imagen de la cámara con gafas virtuales">
      <CameraStage ref={stageRef} glasses={session.current} adjustment={session.currentAdjustment} />
      <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-[10px] font-bold tracking-[.08em] text-white/90 backdrop-blur-sm sm:left-6 sm:top-5"><span className="h-[7px] w-[7px] rounded-full bg-[#7dbbff] shadow-[0_0_9px_#7dbbff]"/> PRUEBA VIRTUAL</div>
      {!session.current && <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-[min(93%,450px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#071832]/80 px-4 py-3 text-center backdrop-blur-md sm:bottom-6"><p className="text-xs font-bold sm:text-sm">Tus próximas gafas te esperan 👓</p><p className="mt-1 text-[11px] leading-5 text-white/75">{session.processing ? "Preparando la montura…" : "Elige un modelo del catálogo o sube la foto frontal de unas gafas para probártelas aquí."}</p></div>}
      <button type="button" onClick={() => {setFullscreen((value) => !value);setShowAdjust(false);}} aria-pressed={fullscreen} className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-6 sm:top-5"><UiIcon name={fullscreen ? "sliders" : "eye"} size={15}/>{fullscreen ? "Mostrar controles" : "Pantalla completa"}</button>
      {fullscreen && <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-3 items-center justify-items-center bg-gradient-to-t from-black/60 to-transparent px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-10">
        <button type="button" onClick={() => setShowCatalog(true)} aria-label="Cambiar de modelo" className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm"><UiIcon name="shopping-bag" size={21}/></button>
        <button type="button" onClick={() => {const dataUrl = stageRef.current?.capture();if (dataUrl) setCapture(dataUrl);}} disabled={!session.current} aria-label="Tomar foto con las gafas" className="grid h-[68px] w-[68px] place-items-center rounded-full border-[4px] border-white bg-[#0669e6] text-white shadow-[0_10px_30px_rgba(0,100,224,.4)] active:scale-95 disabled:opacity-40"><UiIcon name="camera" size={28}/></button>
        {/* Lado derecho vacío a propósito: mantiene el botón de foto centrado. */}
        <span aria-hidden />
      </div>}
      {showAdjust && session.current && <AdjustPanel onNudge={(delta) => session.nudgeAdjustment(session.current!.id, delta)} onReset={() => session.resetAdjustment(session.current!.id)} onClose={() => setShowAdjust(false)} />}
    </section>

    {!fullscreen && <div className="max-h-[55dvh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#071832]">
      <ControlPanel items={session.items} current={session.current} processing={session.processing} error={uploadError} onUpload={(file) => {void uploadPhoto(file,"front");}} onUploadTemple={(file) => {void uploadPhoto(file,"temple");}} onPrev={session.prev} onNext={session.next} onRemoveCurrent={session.removeCurrent}
        onCapture={() => {const dataUrl = stageRef.current?.capture();if (dataUrl) setCapture(dataUrl);}}
        onOpenFavorites={() => setShowFavorites(true)} onOpenAdjust={() => setShowAdjust((value) => !value)} onOpenCatalog={() => setShowCatalog(true)} orderUrl={orderUrl} favoritesCount={session.favorites.length} />
    </div>}

    {showCatalog && <div role="dialog" aria-modal="true" aria-label="Catálogo de monturas" className="fixed inset-0 z-40 flex flex-col bg-[#061327]/95 p-4 text-white backdrop-blur sm:p-6">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 pb-4"><div><p className="text-[11px] font-bold tracking-[.12em] text-[#86bdff]">CATÁLOGO</p><h2 className="mt-1 text-lg font-extrabold">Elige la montura que quieres probarte</h2></div><button type="button" onClick={() => setShowCatalog(false)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"><UiIcon name="close" size={16}/> Cerrar</button></div>
      <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto pb-6">
        {session.loadError && <p role="alert" className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">{session.loadError}</p>}
        <ModelPicker models={session.catalog} selectedId={session.selectedModelId} onSelect={(id) => {session.loadModel(id);setShowCatalog(false);}} />
      </div>
    </div>}

    {capture && <CapturePreview captureDataUrl={capture} glassesName={session.current?.name ?? "Gafas Paisas"} favoritesFull={session.favoritesFull} onClose={() => setCapture(null)} onSaveFavorite={() => {session.addFavorite(capture, session.current?.name ?? "Gafas Paisas");setCapture(null);}} />}
    {showFavorites && <FavoritesDrawer favorites={session.favorites} onClose={() => setShowFavorites(false)} onRemove={session.removeFavorite} />}
  </div>;
}

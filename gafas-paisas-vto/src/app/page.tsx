"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CatalogoCompletoLink, Landing } from "@/components/Landing";
import { CameraStage, type CameraStageHandle } from "@/components/CameraStage";
import { ControlPanel } from "@/components/ControlPanel";
import { CapturePreview } from "@/components/CapturePreview";
import { FavoritesDrawer } from "@/components/FavoritesDrawer";
import { AdjustPanel } from "@/components/AdjustPanel";
import { InstagramLink } from "@/components/InstagramLink";
import { ModelPicker } from "@/components/ModelPicker";
import { UiIcon } from "@/components/UiIcon";
import { useSession } from "@/hooks/useSession";
import { buildOrderMessage, buildWhatsAppUrl, WHATSAPP_GENERIC_MESSAGE, WHATSAPP_INTEREST_MESSAGE } from "@/lib/constants";

/**
 * Sin registro: el cliente entra directo. El número llega solo cuando escribe
 * por WhatsApp, que es justo cuando ya quiere comprar.
 */
export default function Home() {
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

  const model = session.selectedModel;
  // El pedido conserva el CÓDIGO solicitado + nombre (no inventa precio).
  const orderMessage = model ? buildOrderMessage(model.id, model.name) : WHATSAPP_INTEREST_MESSAGE;
  const orderUrl = buildWhatsAppUrl(model ? orderMessage : WHATSAPP_GENERIC_MESSAGE);

  // Las flechas recorren el catálogo completo (no solo lo que ya se probó).
  const catalogIndex = model ? session.catalog.findIndex((m) => m.id === model.id) : -1;
  const browsingCatalog = catalogIndex >= 0;
  function stepModel(delta: 1 | -1) {
    if (catalogIndex >= 0) {
      const total = session.catalog.length;
      void session.loadModel(session.catalog[(catalogIndex + delta + total) % total].id);
    } else if (delta === 1) session.next();
    else session.prev();
  }

  function activate(modelId?: string) {
    setCameraActive(true);
    if (modelId) void session.loadModel(modelId);
  }

  function backToLanding() {
    setCameraActive(false); // Desmonta CameraStage y libera el stream de la webcam.
    setShowAdjust(false);
    setFullscreen(false);
    setCapture(null);
    setUploadError(null);
  }

  function takePhoto() {
    const dataUrl = stageRef.current?.capture();
    if (dataUrl) setCapture(dataUrl);
  }

  async function uploadPhoto(file: File, side: "front" | "temple") {
    setUploadError(null);
    try {
      if (side === "front") await session.addGlasses(file);
      else await session.addTemple(file);
    } catch {
      setUploadError("No pudimos preparar esa foto. Prueba con una foto clara de frente (JPG, PNG o WebP), mejor con fondo liso.");
    }
  }

  // reducedMotion="user": quien pidió menos movimiento en su celular, no ve animaciones.
  return <MotionConfig reducedMotion="user">
    {/* Cambio de pantalla inmediato (sin esperar animaciones de salida): el probador entra con un fundido. */}
    {!cameraActive
      ? <Landing catalog={session.catalog} selectedId={session.selectedModelId} onActivate={activate} />
      : <motion.div key="probador" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4, ease: [0.22, 1, 0.36, 1] }}>{probador()}</motion.div>}
  </MotionConfig>;

  function probador() {
  return <div className="flex h-dvh min-h-[490px] w-full flex-col overflow-hidden bg-[#050d1c] text-white">
    {!fullscreen && <header className="z-20 flex min-h-[60px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#071832] px-3 sm:px-7">
      <button type="button" onClick={backToLanding} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/20" aria-label="Volver al inicio y apagar la cámara">
        <UiIcon name="chevron-left" size={16}/> Volver
      </button>
      <Image src="/brand/logo-blanco.png" width={150} height={66} alt="Gafas Paisas" priority className="h-auto w-[100px] shrink-0 object-contain sm:w-[130px]" />
      <InstagramLink variant="subtle" iconOnly />
    </header>}

    <section className="relative min-h-0 flex-1 overflow-hidden bg-black" aria-label="Imagen de la cámara con gafas virtuales">
      <CameraStage ref={stageRef} glasses={session.current} adjustment={session.currentAdjustment} />
      {!session.current && <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-[min(93%,450px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#071832]/85 px-4 py-3 text-center backdrop-blur-md sm:bottom-6"><p className="text-sm font-bold">¿Cuál es tu facha? 😎</p><p className="mt-1 text-xs leading-5 text-white/75">{session.processing ? "Preparando la montura…" : "Abre el catálogo y toca un modelo para ponértelo."}</p></div>}
      {session.processing && session.current && <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-xs font-semibold backdrop-blur">Cargando montura…</div>}
      <button type="button" onClick={() => {setFullscreen((value) => !value);setShowAdjust(false);}} aria-pressed={fullscreen} aria-label={fullscreen ? "Mostrar controles" : "Pantalla completa"} className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-6 sm:top-5"><UiIcon name={fullscreen ? "close" : "expand"} size={17}/></button>
      {fullscreen && <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-3 items-center justify-items-center bg-gradient-to-t from-black/60 to-transparent px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-10">
        <button type="button" onClick={() => stepModel(-1)} aria-label="Montura anterior" className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-black/40 backdrop-blur-sm"><UiIcon name="chevron-left" size={22}/></button>
        <button type="button" onClick={takePhoto} disabled={!session.current} aria-label="Tomar foto con las gafas" className="grid h-[68px] w-[68px] place-items-center rounded-full border-[4px] border-white bg-[#0669e6] shadow-[0_10px_30px_rgba(0,100,224,.4)] active:scale-95 disabled:opacity-40"><UiIcon name="camera" size={28}/></button>
        <button type="button" onClick={() => stepModel(1)} aria-label="Siguiente montura" className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-black/40 backdrop-blur-sm"><UiIcon name="chevron-right" size={22}/></button>
      </div>}
      {showAdjust && session.current && <AdjustPanel onNudge={(delta) => session.nudgeAdjustment(session.current!.id, delta)} onReset={() => session.resetAdjustment(session.current!.id)} onClose={() => setShowAdjust(false)} />}
    </section>

    {!fullscreen && <div className="max-h-[55dvh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#071832]">
      <ControlPanel
        current={session.current}
        model={browsingCatalog ? model : null}
        position={browsingCatalog ? { index: catalogIndex + 1, total: session.catalog.length } : null}
        canStep={catalogIndex >= 0 || session.items.length > 1}
        processing={session.processing}
        error={uploadError ?? session.loadError}
        onUpload={(file) => {void uploadPhoto(file, "front");}}
        onUploadTemple={(file) => {void uploadPhoto(file, "temple");}}
        onPrev={() => stepModel(-1)}
        onNext={() => stepModel(1)}
        onRemoveCurrent={session.removeCurrent}
        onCapture={takePhoto}
        onOpenFavorites={() => setShowFavorites(true)}
        onOpenAdjust={() => setShowAdjust((value) => !value)}
        onOpenCatalog={() => setShowCatalog(true)}
        orderUrl={orderUrl}
        favoritesCount={session.favorites.length}
      />
    </div>}

    <AnimatePresence>
    {showCatalog && <motion.div key="catalogo" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: .4, ease: [0.22, 1, 0.36, 1] }} role="dialog" aria-modal="true" aria-label="Catálogo de monturas" className="fixed inset-0 z-40 flex flex-col bg-[#061327]/95 p-4 text-white backdrop-blur sm:p-6">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 pb-3"><div><h2 className="font-display text-[1.9rem] leading-none">¿Cuál te pruebas?</h2><p className="mt-1 text-xs text-blue-100/65">Una selección de {session.catalog.length} para probarte aquí. Hay muchas más en el catálogo completo.</p></div><button type="button" onClick={() => setShowCatalog(false)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"><UiIcon name="close" size={16}/> Cerrar</button></div>
      <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto pb-6">
        {session.loadError && <p role="alert" className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">{session.loadError}</p>}
        <ModelPicker models={session.catalog} selectedId={session.selectedModelId} onSelect={(id) => {void session.loadModel(id);setShowCatalog(false);}} filterable />
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] px-5 py-6 text-center">
          <p className="font-display text-2xl leading-none">¿No viste la tuya?</p>
          <p className="max-w-sm text-xs leading-5 text-blue-100/70">Mira todas las referencias en el catálogo completo y pídela por WhatsApp.</p>
          <CatalogoCompletoLink />
        </div>
      </div>
    </motion.div>}
    </AnimatePresence>

    {capture && <CapturePreview captureDataUrl={capture} glassesName={session.current?.name ?? "Gafas Paisas"} shareMessage={orderMessage} favoritesFull={session.favoritesFull} onClose={() => setCapture(null)} onSaveFavorite={() => {session.addFavorite(capture, session.current?.name ?? "Gafas Paisas");setCapture(null);}} />}
    {showFavorites && <FavoritesDrawer favorites={session.favorites} onClose={() => setShowFavorites(false)} onRemove={session.removeFavorite} />}
  </div>;
  }
}

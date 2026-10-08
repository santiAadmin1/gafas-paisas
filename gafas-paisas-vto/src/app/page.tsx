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
import { useSession } from "@/hooks/useSession";

const PHONE_SESSION_KEY = "gafas-paisas-demo-telefono";

function readStoredPhone(): string | null {
  try {
    const storedPhone = window.sessionStorage.getItem(PHONE_SESSION_KEY);
    return storedPhone && /^3\d{9}$/.test(storedPhone) ? storedPhone : null;
  } catch {
    // El acceso a sessionStorage puede estar restringido. La demo seguirá funcionando.
    return null;
  }
}

const subscribeNoop = () => () => {};

export default function Home() {
  // undefined = aún en el servidor / hidratando (sessionStorage no disponible).
  const storedPhone = useSyncExternalStore(subscribeNoop, readStoredPhone, () => undefined);
  const [phoneOverride, setPhone] = useState<string | null | undefined>(undefined);
  const phone = phoneOverride !== undefined ? phoneOverride : storedPhone;
  const [cameraActive, setCameraActive] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [capture, setCapture] = useState<string | null>(null);
  const stageRef = useRef<CameraStageHandle>(null);
  const session = useSession();

  function continueWithPhone(value: string) {
    try {
      window.sessionStorage.setItem(PHONE_SESSION_KEY, value);
    } catch { /* Modo privado o almacenamiento deshabilitado */ }
    setPhone(value);
  }

  function exit() {
    setCameraActive(false); // Desmonta CameraStage y libera las pistas de cámara.
    setShowFavorites(false);
    setShowAdjust(false);
    setCapture(null);
    setPhone(null);
    try { window.sessionStorage.removeItem(PHONE_SESSION_KEY); } catch { /* No disponible */ }
  }

  if (phone === undefined) return <main className="grid min-h-dvh place-items-center bg-[#071832] text-sm text-white/70">Cargando Gafas Paisas…</main>;
  if (!phone) return <PhoneGate onContinue={continueWithPhone} />;
  if (!cameraActive) return <Landing onActivate={() => setCameraActive(true)} onExit={exit} />;

  return (
    <div className="flex h-dvh min-h-[480px] w-full flex-col overflow-hidden bg-[#060e1c] text-white">
      <header className="z-10 flex min-h-[68px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#071832] px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Image src="/brand/logo-blanco.png" width={140} height={58} alt="Gafas Paisas" priority className="h-auto w-[119px] object-contain sm:w-[141px]" />
          <span className="hidden border-l border-white/20 pl-4 text-xs font-semibold tracking-[.12em] text-blue-100/75 sm:block">PROBADOR VIRTUAL</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden text-xs text-blue-100/70 sm:block">+57 {phone.slice(0, 3)} {phone.slice(3, 6)} {phone.slice(6)}</span>
          <button onClick={() => {setCameraActive(false); setShowAdjust(false);}} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">Apagar cámara</button>
          <button onClick={exit} className="rounded-full border border-blue-400/30 bg-[#0b5fdb] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0064e0]" title="Borrar número local y salir">Salir</button>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 overflow-hidden bg-black" aria-label="Vista del probador de gafas en tiempo real">
        <CameraStage ref={stageRef} glasses={session.current} adjustment={session.currentAdjustment} />
        <div aria-hidden className="pointer-events-none absolute left-4 top-4 z-10 hidden rounded-full border border-white/20 bg-black/35 px-3 py-2 text-[10px] font-bold tracking-[.13em] text-white/85 backdrop-blur-sm sm:block">● PRUEBA VIRTUAL</div>
        {showAdjust && session.current && (
          <AdjustPanel
            onNudge={(delta) => session.nudgeAdjustment(session.current!.id, delta)}
            onReset={() => session.resetAdjustment(session.current!.id)}
            onClose={() => setShowAdjust(false)}
          />
        )}
      </section>

      <div className="max-h-[48dvh] min-h-[198px] shrink-0 overflow-y-auto bg-[#071832] sm:min-h-[218px]">
        <ControlPanel
          items={session.items}
          current={session.current}
          processing={session.processing}
          onUpload={(file) => session.addGlasses(file)}
          onUploadTemple={(file) => session.addTemple(file)}
          onPrev={session.prev}
          onNext={session.next}
          onRemoveCurrent={session.removeCurrent}
          onCapture={() => {
            const dataUrl = stageRef.current?.capture();
            if (dataUrl) setCapture(dataUrl);
          }}
          onOpenFavorites={() => setShowFavorites(true)}
          onOpenAdjust={() => setShowAdjust((value) => !value)}
          favoritesCount={session.favorites.length}
        />
      </div>

      {capture && (
        <CapturePreview
          captureDataUrl={capture}
          glassesName={session.current?.name ?? "Gafas Paisas"}
          favoritesFull={session.favoritesFull}
          onClose={() => setCapture(null)}
          onSaveFavorite={() => {
            session.addFavorite(capture, session.current?.name ?? "Gafas Paisas");
            setCapture(null);
          }}
        />
      )}
      {showFavorites && (
        <FavoritesDrawer favorites={session.favorites} onClose={() => setShowFavorites(false)} onRemove={session.removeFavorite} />
      )}
    </div>
  );
}

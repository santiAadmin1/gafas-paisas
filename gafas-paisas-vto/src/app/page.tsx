"use client";

import { useRef, useState } from "react";
import { Landing } from "@/components/Landing";
import { CameraStage, type CameraStageHandle } from "@/components/CameraStage";
import { ControlPanel } from "@/components/ControlPanel";
import { CapturePreview } from "@/components/CapturePreview";
import { FavoritesDrawer } from "@/components/FavoritesDrawer";
import { AdjustPanel } from "@/components/AdjustPanel";
import { ModelPicker } from "@/components/ModelPicker";
import { Logo } from "@/components/Logo";
import { useSession } from "@/hooks/useSession";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/constants";

export default function Home() {
  const [cameraActive, setCameraActive] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [capture, setCapture] = useState<string | null>(null);
  const stageRef = useRef<CameraStageHandle>(null);

  const session = useSession();

  // Pedido conservando el CÓDIGO solicitado + nombre (no inventa precio).
  const orderUrl = session.selectedModel
    ? buildWhatsAppUrl(buildOrderMessage(session.selectedModel.id, session.selectedModel.name))
    : null;

  const activate = (modelId?: string) => {
    setCameraActive(true);
    if (modelId) session.loadModel(modelId);
  };

  if (!cameraActive) {
    return (
      <Landing
        catalog={session.catalog}
        selectedId={session.selectedModelId}
        onActivate={activate}
      />
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-brand-black">
      <div className="flex items-center justify-center py-2">
        <Logo variant="mark" theme="dark" />
      </div>

      <div className="relative min-h-0 flex-1">
        <CameraStage ref={stageRef} glasses={session.current} adjustment={session.currentAdjustment} />
        {showAdjust && session.current && (
          <AdjustPanel
            onNudge={(delta) => session.nudgeAdjustment(session.current!.id, delta)}
            onReset={() => session.resetAdjustment(session.current!.id)}
            onClose={() => setShowAdjust(false)}
          />
        )}
      </div>

      <div className="h-[30%] min-h-[210px]">
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
          onOpenAdjust={() => setShowAdjust((v) => !v)}
          onOpenCatalog={() => setShowCatalog(true)}
          orderUrl={orderUrl}
          favoritesCount={session.favorites.length}
        />
      </div>

      {showCatalog && (
        <div className="absolute inset-0 z-30 flex flex-col bg-brand-black/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Catálogo de monturas</h2>
            <button
              onClick={() => setShowCatalog(false)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80"
            >
              Cerrar ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            {session.loadError && (
              <p className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-200">
                {session.loadError}
              </p>
            )}
            <ModelPicker
              models={session.catalog}
              selectedId={session.selectedModelId}
              onSelect={(id) => {
                session.loadModel(id);
                setShowCatalog(false);
              }}
            />
          </div>
        </div>
      )}

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
        <FavoritesDrawer
          favorites={session.favorites}
          onClose={() => setShowFavorites(false)}
          onRemove={session.removeFavorite}
        />
      )}
    </div>
  );
}

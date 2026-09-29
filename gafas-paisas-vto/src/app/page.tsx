"use client";

import { useRef, useState } from "react";
import { Landing } from "@/components/Landing";
import { CameraStage, type CameraStageHandle } from "@/components/CameraStage";
import { ControlPanel } from "@/components/ControlPanel";
import { CapturePreview } from "@/components/CapturePreview";
import { FavoritesDrawer } from "@/components/FavoritesDrawer";
import { AdjustPanel } from "@/components/AdjustPanel";
import { Logo } from "@/components/Logo";
import { useSession } from "@/hooks/useSession";

export default function Home() {
  const [cameraActive, setCameraActive] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [capture, setCapture] = useState<string | null>(null);
  const stageRef = useRef<CameraStageHandle>(null);

  const session = useSession();

  if (!cameraActive) {
    return <Landing onActivate={() => setCameraActive(true)} />;
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
        <FavoritesDrawer
          favorites={session.favorites}
          onClose={() => setShowFavorites(false)}
          onRemove={session.removeFavorite}
        />
      )}
    </div>
  );
}

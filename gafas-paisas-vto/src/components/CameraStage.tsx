"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
import { GlassesRenderer } from "@/lib/arRenderer";
import type { ProcessedGlasses } from "@/lib/glassesProcessor";
import { DEFAULT_ADJUSTMENT, type Adjustment } from "@/hooks/useSession";

export type CameraStageHandle = {
  /** Captura el frame actual (video + gafa) como data URL PNG. */
  capture: () => string | null;
};

type Props = {
  glasses: ProcessedGlasses | null;
  adjustment?: Adjustment;
  onFaceDetected?: (detected: boolean) => void;
};

/**
 * CameraEngine + ARRenderer: acceso a cámara frontal, tracking facial en
 * vivo y superposición de la montura seleccionada sobre el rostro.
 */
export const CameraStage = forwardRef<CameraStageHandle, Props>(function CameraStage(
  { glasses, adjustment = DEFAULT_ADJUSTMENT, onFaceDetected },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glassesRef = useRef<ProcessedGlasses | null>(glasses);
  const adjustmentRef = useRef<Adjustment>(adjustment);
  const rafRef = useRef<number | null>(null);
  const { ready, error: trackerError, detect } = useFaceLandmarker();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceFound, setFaceFound] = useState(false);

  glassesRef.current = glasses;
  adjustmentRef.current = adjustment;

  useImperativeHandle(ref, () => ({
    capture: () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return null;
      const out = document.createElement("canvas");
      out.width = canvas.width;
      out.height = canvas.height;
      const octx = out.getContext("2d")!;
      // Replica el mismo encuadre "cover" espejado que ve el usuario:
      // video + overlay de gafas se dibujan juntos dentro del mismo flip
      // para que ambos queden alineados en la captura final.
      octx.save();
      octx.translate(out.width, 0);
      octx.scale(-1, 1);
      const scale = Math.max(out.width / video.videoWidth, out.height / video.videoHeight);
      const w = video.videoWidth * scale;
      const h = video.videoHeight * scale;
      octx.drawImage(video, (out.width - w) / 2, (out.height - h) / 2, w, h);
      octx.drawImage(canvas, 0, 0, out.width, out.height);
      octx.restore();
      return out.toDataURL("image/png");
    },
  }));

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch {
        if (!cancelled) setCameraError("No pudimos acceder a tu cámara. Revisa los permisos del navegador.");
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const glassesRenderer = new GlassesRenderer(canvasRef.current);

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        const result = detect(video, performance.now());
        const found = !!result;
        setFaceFound((prev) => (prev !== found ? found : prev));
        onFaceDetected?.(found);
        if (result && glassesRef.current) {
          glassesRenderer.render(
            w,
            h,
            video.videoWidth,
            video.videoHeight,
            result.landmarks,
            glassesRef.current,
            adjustmentRef.current
          );
        } else {
          glassesRenderer.clear(w, h);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      glassesRenderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 [transform:scaleX(-1)]">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {(cameraError || trackerError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-white">
          {cameraError ?? trackerError}
        </div>
      )}

      {!cameraError && !trackerError && !ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white/80">
          Cargando tracking facial…
        </div>
      )}

      {!cameraError && !trackerError && ready && !faceFound && (
        <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
          <span className="rounded-full bg-black/50 px-4 py-2 text-xs text-white/90 backdrop-blur">
            Centra tu rostro en la cámara
          </span>
        </div>
      )}
    </div>
  );
});

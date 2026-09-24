"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceLandmarker as FaceLandmarkerType } from "@mediapipe/tasks-vision";

export type FaceLandmark = { x: number; y: number; z: number };
export type FaceResult = { landmarks: FaceLandmark[] } | null;

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/**
 * FaceTracker: carga MediaPipe FaceLandmarker (478 landmarks 3D) y expone
 * una función detect() para correr sobre cada frame de video.
 */
export function useFaceLandmarker() {
  const landmarkerRef = useRef<FaceLandmarkerType | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo iniciar el tracking facial");
        }
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  function detect(video: HTMLVideoElement, timestampMs: number): FaceResult {
    const landmarker = landmarkerRef.current;
    if (!landmarker || video.readyState < 2) return null;
    const result = landmarker.detectForVideo(video, timestampMs);
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
    return { landmarks: result.faceLandmarks[0] as FaceLandmark[] };
  }

  return { ready, error, detect };
}

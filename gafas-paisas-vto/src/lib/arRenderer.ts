import type { FaceLandmark } from "@/hooks/useFaceLandmarker";
import type { ProcessedGlasses } from "./glassesProcessor";
import { DEFAULT_ADJUSTMENT, type Adjustment } from "@/hooks/useSession";

// Índices de MediaPipe Face Mesh usados para anclar la montura.
const L_EYE_OUTER = 33;
const R_EYE_OUTER = 263;
const NOSE_BRIDGE = 168;
const L_CHEEK = 234;
const R_CHEEK = 454;
const NOSE_TIP = 1;

// Ancho de la montura como fracción del ancho de la cara medido entre los
// puntos laterales 234↔454 (borde de la cara a la altura de los ojos).
// Una montura bien escogida llega casi al borde de la cara.
const FRAME_TO_FACE_RATIO = 0.95;
// Fracción de la altura de la imagen de la gafa que queda por ENCIMA del
// puente nasal (anclaje). Las fotos de catálogo suelen centrar el puente
// un poco por encima del centro vertical del recorte.
const BRIDGE_HEIGHT_FRACTION = 0.42;

type Point = { x: number; y: number };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Dibuja la gafa procesada sobre el canvas, alineada a los landmarks
 * faciales detectados en el frame de video actual.
 *
 * `videoNaturalW/H` son las dimensiones reales del stream; el canvas puede
 * tener otro tamaño (se asume que el <video> se muestra con object-fit:
 * cover dentro de esas mismas dimensiones de canvas).
 */
export function drawGlassesOnFace(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  videoNaturalW: number,
  videoNaturalH: number,
  landmarks: FaceLandmark[],
  glasses: ProcessedGlasses,
  adjustment: Adjustment = DEFAULT_ADJUSTMENT
) {
  const scale = Math.max(canvasW / videoNaturalW, canvasH / videoNaturalH);
  const drawnW = videoNaturalW * scale;
  const drawnH = videoNaturalH * scale;
  const offsetX = (canvasW - drawnW) / 2;
  const offsetY = (canvasH - drawnH) / 2;

  const toPx = (lm: FaceLandmark): Point => ({
    x: offsetX + lm.x * drawnW,
    y: offsetY + lm.y * drawnH,
  });

  const eyeL = toPx(landmarks[L_EYE_OUTER]);
  const eyeR = toPx(landmarks[R_EYE_OUTER]);
  const bridge = toPx(landmarks[NOSE_BRIDGE]);
  const cheekL = toPx(landmarks[L_CHEEK]);
  const cheekR = toPx(landmarks[R_CHEEK]);
  const noseTip = toPx(landmarks[NOSE_TIP]);

  const interocular = Math.hypot(eyeR.x - eyeL.x, eyeR.y - eyeL.y);
  if (!interocular || interocular < 2) return;

  const angle = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);

  // Pseudo-perspectiva: al girar la cabeza, una mitad del rostro se
  // "acorta" respecto a la otra. Usamos esa asimetría para inclinar
  // levemente la gafa (shear) y simular el giro sin un modelo 3D completo.
  const leftHalf = Math.hypot(noseTip.x - cheekL.x, noseTip.y - cheekL.y);
  const rightHalf = Math.hypot(cheekR.x - noseTip.x, cheekR.y - noseTip.y);
  const yaw = clamp((rightHalf - leftHalf) / interocular, -0.6, 0.6);
  const shear = clamp(yaw * 0.35, -0.25, 0.25);
  const widthCompensation = 1 - Math.abs(yaw) * 0.12;

  // Tope de seguridad: si el recorte de la gafa trajo de más (fondo no
  // removido del todo), esto evita que cubra media pantalla.
  const maxFrameWidth = canvasW * 0.5;
  const faceWidth = Math.hypot(cheekR.x - cheekL.x, cheekR.y - cheekL.y);
  const frameWidth = Math.min(faceWidth * FRAME_TO_FACE_RATIO * widthCompensation, maxFrameWidth);
  const glassesScale = (frameWidth * adjustment.scale) / glasses.width;
  const drawW = glasses.width * glassesScale;
  const drawH = glasses.height * glassesScale;

  ctx.save();
  ctx.translate(bridge.x + adjustment.offsetX * interocular, bridge.y + adjustment.offsetY * interocular);
  ctx.rotate(angle + adjustment.rotate);
  ctx.transform(1, 0, shear, 1, 0, 0);
  ctx.drawImage(glasses.canvas, -drawW / 2, -drawH * BRIDGE_HEIGHT_FRACTION, drawW, drawH);
  ctx.restore();
}

import * as THREE from "three";
import type { FaceLandmark } from "@/hooks/useFaceLandmarker";
import type { ProcessedGlasses } from "./glassesProcessor";
import { DEFAULT_ADJUSTMENT, type Adjustment } from "@/hooks/useSession";

// Índices de MediaPipe Face Mesh usados para armar el sistema de
// coordenadas de la cabeza.
const L_CHEEK = 234;
const R_CHEEK = 454;
const NOSE_BRIDGE = 168;
const FOREHEAD = 10;
const CHIN = 152;
const L_EYE_OUTER = 33;
const R_EYE_OUTER = 263;

// Todas las medidas de abajo están en "anchos de cara" (distancia 3D
// entre 234 y 454 = 1).
// Ancho de la montura: una montura bien escogida llega casi al borde de la cara.
const FRAME_TO_FACE_RATIO = 0.95;
// Fracción de la altura de la imagen de la gafa que queda por ENCIMA del
// puente nasal (anclaje).
const BRIDGE_HEIGHT_FRACTION = 0.42;
// Qué tan adelante del puente nasal (landmark 168) queda el plano de los lentes.
const FRONT_FORWARD = 0.03;
// Patas: de la bisagra hacia atrás hasta la oreja.
const TEMPLE_LENGTH = 0.78;
// Negativo = las patas se cierran hacia la cabeza al llegar a la oreja (la
// cabeza es más angosta arriba de la oreja que la montura), así se ven
// pegadas y no flotando.
const TEMPLE_SPREAD = -0.03;
// Inclinación hacia abajo de la pata para que se apoye sobre la oreja (rad).
const TEMPLE_PITCH = 0.02;
const TEMPLE_HEIGHT_FRONT = 0.045;
const TEMPLE_HEIGHT_BACK = 0.022;
const TEMPLE_THICKNESS = 0.014;
const HINGE_FROM_TOP = 0.28; // fracción de la altura de la montura, medida desde arriba
// "Cabeza invisible" que tapa la pata del lado contrario al girar.
// Más angosta (x) que la distancia entre patas: si no, la pata del lado
// cercano se "hunde" en la cabeza y se corta a mitad de camino.
const HEAD_RADII = new THREE.Vector3(0.4, 0.62, 0.5);
const HEAD_CENTER = new THREE.Vector3(0, 0.05, -0.55);
// Suavizado temporal de los landmarks (0 = sin suavizar, 1 = congelado).
const SMOOTHING = 0.45;

type V3 = THREE.Vector3;

// Pata con foto: largo total de la foto (incluye la curva detrás de la oreja).
const PHOTO_TEMPLE_LENGTH = 1.1;

type GlassesParts = {
  id: string;
  templeSrc: HTMLCanvasElement | undefined;
  front: THREE.Mesh;
  frontW: number;
  temples: THREE.Mesh[];
  textures: THREE.Texture[];
};

/**
 * ARRenderer 3D: dibuja la montura como un frente plano (la foto subida)
 * más dos patas generadas, todo orientado con la pose real de la cabeza.
 * Así, al girar, se ve la pata del lado cercano y la del lado lejano queda
 * escondida detrás de una cabeza invisible (oclusor).
 *
 * Trabaja en "espacio de píxeles" del canvas con cámara ortográfica: la
 * pose se construye directamente con los landmarks 3D de MediaPipe
 * (x/y en píxeles, z en la misma escala que x), sin calibrar cámara.
 */
export class GlassesRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(0, 1, 0, 1, -100000, 100000);
  private head = new THREE.Group();
  private occluder: THREE.Mesh;
  private parts: GlassesParts | null = null;
  private smoothed: Map<number, V3> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      // Necesario para que la captura (drawImage del canvas) no salga vacía.
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.head.matrixAutoUpdate = false;
    this.scene.add(this.head);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    // y crece hacia abajo en este espacio: luz desde arriba y de frente.
    key.position.set(0.3, -1, 1.2);
    this.scene.add(key);

    this.occluder = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 24),
      new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide })
    );
    this.occluder.scale.copy(HEAD_RADII);
    this.occluder.position.copy(HEAD_CENTER);
    this.occluder.renderOrder = -1;
    this.head.add(this.occluder);
  }

  dispose() {
    this.clearParts();
    this.occluder.geometry.dispose();
    (this.occluder.material as THREE.Material).dispose();
    this.renderer.dispose();
  }

  private clearParts() {
    if (!this.parts) return;
    const { front, temples, textures } = this.parts;
    for (const m of [front, ...temples]) {
      this.head.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
    textures.forEach((t) => t.dispose());
    this.parts = null;
  }

  private ensureParts(glasses: ProcessedGlasses, scaleAdj: number) {
    const frontW = FRAME_TO_FACE_RATIO * scaleAdj;
    if (this.parts?.id === glasses.id && this.parts.frontW === frontW && this.parts.templeSrc === glasses.temple)
      return;
    this.clearParts();

    const frontH = frontW * (glasses.height / glasses.width);

    const texture = makeTexture(glasses.canvas);
    const front = new THREE.Mesh(
      new THREE.PlaneGeometry(frontW, frontH),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.02 })
    );
    front.position.set(0, (0.5 - BRIDGE_HEIGHT_FRACTION) * frontH, FRONT_FORWARD);
    front.renderOrder = 2;

    const textures: THREE.Texture[] = [texture];
    const color = sampleTempleColor(glasses.canvas);
    const hingeY = -BRIDGE_HEIGHT_FRACTION * frontH + HINGE_FROM_TOP * frontH;
    const templeTex = glasses.temple ? makeTexture(glasses.temple) : null;
    if (templeTex) textures.push(templeTex);

    const temples = ([-1, 1] as const).map((side): THREE.Mesh => {
      const mesh =
        templeTex && glasses.temple
          ? photoTemple(templeTex, glasses.temple, hingeY)
          : new THREE.Mesh(templeGeometry(), new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
      if (!templeTex) mesh.position.y = hingeY;
      // La pata va a lo largo de -z; se abre levemente hacia afuera.
      mesh.position.x = side * (frontW / 2 - TEMPLE_THICKNESS);
      mesh.position.z = FRONT_FORWARD - 0.01;
      mesh.rotation.set(TEMPLE_PITCH, -side * Math.atan2(TEMPLE_SPREAD, TEMPLE_LENGTH), 0, "YXZ");
      mesh.renderOrder = 1;
      return mesh;
    });

    this.head.add(front, ...temples);
    this.parts = { id: glasses.id, templeSrc: glasses.temple, front, frontW, temples, textures };
  }

  /** Borra el overlay (sin rostro o sin gafa activa). */
  clear(canvasW: number, canvasH: number) {
    this.resize(canvasW, canvasH);
    this.renderer.clear();
    this.smoothed.clear();
  }

  private resize(w: number, h: number) {
    const size = this.renderer.getSize(new THREE.Vector2());
    if (size.x !== w || size.y !== h) {
      this.renderer.setSize(w, h, false);
      // top = 0, bottom = h: el eje y crece hacia abajo como en el canvas 2D.
      this.camera.left = 0;
      this.camera.right = w;
      this.camera.top = 0;
      this.camera.bottom = h;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * `videoNaturalW/H` son las dimensiones reales del stream; el canvas
   * puede tener otro tamaño (el <video> se muestra con object-fit: cover).
   */
  render(
    canvasW: number,
    canvasH: number,
    videoNaturalW: number,
    videoNaturalH: number,
    landmarks: FaceLandmark[],
    glasses: ProcessedGlasses,
    adjustment: Adjustment = DEFAULT_ADJUSTMENT
  ) {
    this.resize(canvasW, canvasH);

    const scale = Math.max(canvasW / videoNaturalW, canvasH / videoNaturalH);
    const drawnW = videoNaturalW * scale;
    const drawnH = videoNaturalH * scale;
    const offsetX = (canvasW - drawnW) / 2;
    const offsetY = (canvasH - drawnH) / 2;

    // z de MediaPipe: misma escala que x, negativo = más cerca de la cámara.
    // Lo invertimos para que +z apunte hacia la cámara.
    const p = (idx: number): V3 => {
      const lm = landmarks[idx];
      const raw = new THREE.Vector3(offsetX + lm.x * drawnW, offsetY + lm.y * drawnH, -lm.z * drawnW);
      const prev = this.smoothed.get(idx);
      if (prev) raw.lerp(prev, SMOOTHING);
      this.smoothed.set(idx, raw.clone());
      return raw;
    };

    const cheekL = p(L_CHEEK);
    const cheekR = p(R_CHEEK);
    const bridge = p(NOSE_BRIDGE);
    const forehead = p(FOREHEAD);
    const chin = p(CHIN);
    const eyeL = p(L_EYE_OUTER);
    const eyeR = p(R_EYE_OUTER);

    const faceWidth = cheekR.distanceTo(cheekL);
    if (faceWidth < 4) {
      this.renderer.clear();
      return;
    }

    // Base ortonormal de la cabeza: x = mejilla a mejilla, y = frente→mentón
    // (hacia abajo), z = hacia la cámara.
    const right = cheekR.clone().sub(cheekL).normalize();
    const down = chin.clone().sub(forehead);
    down.sub(right.clone().multiplyScalar(down.dot(right))).normalize();
    const fwd = new THREE.Vector3().crossVectors(right, down).normalize();

    // Tope de seguridad: si el recorte trajo de más, que no cubra media pantalla.
    const s = Math.min(faceWidth, (canvasW * 0.5) / FRAME_TO_FACE_RATIO);

    const interocular = Math.hypot(eyeR.x - eyeL.x, eyeR.y - eyeL.y);
    const anchor = bridge
      .clone()
      .add(new THREE.Vector3(adjustment.offsetX * interocular, adjustment.offsetY * interocular, 0));

    const basis = new THREE.Matrix4().makeBasis(right, down, fwd).scale(new THREE.Vector3(s, s, s));
    const roll = new THREE.Matrix4().makeRotationZ(adjustment.rotate);
    this.head.matrix.makeTranslation(anchor.x, anchor.y, anchor.z).multiply(roll).multiply(basis);
    this.head.matrixWorldNeedsUpdate = true;

    this.ensureParts(glasses, adjustment.scale);
    this.renderer.render(this.scene, this.camera);
  }
}

function makeTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  // El eje "y" local apunta hacia abajo: no voltear la textura.
  t.flipY = false;
  return t;
}

/**
 * Pata con la foto real: un plano vertical (plano y-z) con la bisagra de la
 * foto en el origen y el resto hacia atrás (-z). La barra de la foto queda
 * centrada a la altura de la bisagra.
 */
function photoTemple(tex: THREE.Texture, src: HTMLCanvasElement, hingeY: number) {
  const L = PHOTO_TEMPLE_LENGTH;
  const H = L * (src.height / src.width);
  const { top, bottom } = barRowsAtHinge(src);
  const y0 = hingeY - ((top + bottom) / 2) * H;
  const geo = new THREE.BufferGeometry();
  // Vértices: bisagra-arriba, atrás-arriba, atrás-abajo, bisagra-abajo.
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, y0, 0, 0, y0, -L, 0, y0 + H, -L, 0, y0 + H, 0], 3)
  );
  // La bisagra de la foto (u = 0) siempre va en la bisagra de la montura.
  // En uno de los dos lados el logo se ve espejado (se mira el plano por
  // detrás); con una sola foto no hay forma de evitarlo sin invertir la pata.
  geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  return new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, alphaTest: 0.05 })
  );
}

/** Filas (fracción de la altura) donde está la barra en el extremo de la bisagra. */
function barRowsAtHinge(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { top: 0, bottom: 0.2 };
  const x = Math.round(canvas.width * 0.08);
  const d = ctx.getImageData(x, 0, 1, canvas.height).data;
  let top = -1,
    bottom = -1;
  for (let y = 0; y < canvas.height; y++) {
    if (d[y * 4 + 3] > 128) {
      if (top < 0) top = y;
      bottom = y;
    }
  }
  if (top < 0) return { top: 0, bottom: 0.2 };
  return { top: top / canvas.height, bottom: bottom / canvas.height };
}

/** Pata: barra que se afina hacia atrás y cae un poco al llegar a la oreja. */
function templeGeometry() {
  const shape = new THREE.Shape();
  // Coordenadas del shape: x = profundidad (0 → TEMPLE_LENGTH), y = alto (hacia abajo).
  const L = TEMPLE_LENGTH;
  const hf = TEMPLE_HEIGHT_FRONT / 2;
  const hb = TEMPLE_HEIGHT_BACK / 2;
  shape.moveTo(0, -hf);
  shape.lineTo(L * 0.8, -hb);
  shape.quadraticCurveTo(L * 0.95, -hb + 0.01, L, 0.06);
  shape.lineTo(L - 0.02, 0.07);
  shape.quadraticCurveTo(L * 0.93, hb + 0.02, L * 0.8, hb);
  shape.lineTo(0, hf);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: TEMPLE_THICKNESS, bevelEnabled: false });
  // Shape en plano XY → giramos para que el largo vaya hacia -z (atrás de la cabeza).
  geo.translate(0, 0, -TEMPLE_THICKNESS / 2);
  geo.rotateY(Math.PI / 2);
  return geo;
}

/**
 * Color de las patas: promedio de los píxeles opacos en los extremos
 * laterales de la montura (donde van las bisagras).
 */
function sampleTempleColor(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const color = new THREE.Color(0x111111);
  if (!ctx) return color;
  const { width, height } = canvas;
  const band = Math.max(2, Math.round(width * 0.05));
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (const x0 of [0, width - band]) {
    const d = ctx.getImageData(x0, 0, band, height).data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 200) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
        n++;
      }
    }
  }
  if (n > 0) color.setRGB(r / n / 255, g / n / 255, b / n / 255, THREE.SRGBColorSpace);
  return color;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { processGlassesImage, type ProcessedGlasses } from "@/lib/glassesProcessor";
import { loadModelById } from "@/lib/loadCatalog";
import { MODELOS_ACTIVOS, getModel, resolveAlias, type CatalogModel } from "@/lib/catalog";
import { MAX_FAVORITES } from "@/lib/constants";

export type Favorite = {
  id: string;
  glassesName: string;
  /** Captura del usuario con la gafa puesta (data URL). */
  capture: string;
};

/** Ajuste manual fino sobre el cálculo automático del ARRenderer. */
export type Adjustment = { scale: number; offsetX: number; offsetY: number; rotate: number };
export const DEFAULT_ADJUSTMENT: Adjustment = { scale: 1, offsetX: 0, offsetY: 0, rotate: 0 };

const SELECTED_KEY = "gp_selected_model";

function clampAdjustment(a: Adjustment): Adjustment {
  return {
    scale: Math.max(0.5, Math.min(2, a.scale)),
    offsetX: Math.max(-0.6, Math.min(0.6, a.offsetX)),
    offsetY: Math.max(-0.6, Math.min(0.6, a.offsetY)),
    rotate: Math.max(-0.5, Math.min(0.5, a.rotate)),
  };
}

/**
 * SessionManager: biblioteca de gafas cargadas en la sesión (desde el
 * catálogo o por upload del usuario) + favoritos (máx. 5). Sin backend.
 */
export function useSession() {
  const [items, setItems] = useState<ProcessedGlasses[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [processing, setProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, Adjustment>>({});
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Recupera la selección previa (SSR-safe y sin render en cascada: la
  // lectura se agenda fuera del cuerpo del efecto).
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const saved = sessionStorage.getItem(SELECTED_KEY);
        if (saved && getModel(saved)) setSelectedModelId(saved);
      } catch {
        /* storage no disponible */
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Carga/activa un modelo del catálogo (resuelve alias para el probador). */
  const loadModel = useCallback(
    async (id: string) => {
      const model = getModel(id);
      if (!model) return;
      setSelectedModelId(id);
      setLoadError(null);
      try {
        sessionStorage.setItem(SELECTED_KEY, id);
      } catch {
        /* ignore */
      }

      const resolved = resolveAlias(id);
      const existingIdx = items.findIndex((g) => g.id === resolved);
      if (existingIdx >= 0) {
        setCurrentIndex(existingIdx);
        return;
      }

      setProcessing(true);
      try {
        const processed = await loadModelById(id);
        setItems((prev) => {
          const idx = prev.findIndex((g) => g.id === processed.id);
          if (idx >= 0) {
            setCurrentIndex(idx);
            return prev;
          }
          setCurrentIndex(prev.length);
          return [...prev, processed];
        });
      } catch (e) {
        console.error("[useSession] No se pudo cargar el modelo", id, e);
        setLoadError(`No se pudo cargar la referencia ${id}. Intenta de nuevo.`);
      } finally {
        setProcessing(false);
      }
    },
    [items]
  );

  const addGlasses = useCallback(async (file: File) => {
    setProcessing(true);
    try {
      const processed = await processGlassesImage(file);
      setItems((prev) => {
        setCurrentIndex(prev.length);
        return [...prev, processed];
      });
      setSelectedModelId(null);
    } finally {
      setProcessing(false);
    }
  }, []);

  /** Asocia la foto de la pata a la gafa actual. */
  const addTemple = useCallback(
    async (file: File) => {
      const target = items[currentIndex];
      if (!target) return;
      setProcessing(true);
      try {
        const processed = await processGlassesImage(file);
        setItems((prev) => prev.map((g) => (g.id === target.id ? { ...g, temple: processed.canvas } : g)));
      } finally {
        setProcessing(false);
      }
    },
    [items, currentIndex]
  );

  const removeCurrent = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((_, i) => i !== currentIndex);
      setCurrentIndex((idx) => Math.max(0, Math.min(idx, next.length - 1)));
      return next;
    });
  }, [currentIndex]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (items.length ? (i + 1) % items.length : 0));
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
  }, [items.length]);

  const addFavorite = useCallback((capture: string, glassesName: string) => {
    setFavorites((prev) => {
      if (prev.length >= MAX_FAVORITES) return prev;
      return [...prev, { id: crypto.randomUUID(), capture, glassesName }];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const nudgeAdjustment = useCallback((id: string, delta: Partial<Adjustment>) => {
    setAdjustments((prev) => {
      const base = prev[id] ?? DEFAULT_ADJUSTMENT;
      const nextAdj = clampAdjustment({
        scale: base.scale + (delta.scale ?? 0),
        offsetX: base.offsetX + (delta.offsetX ?? 0),
        offsetY: base.offsetY + (delta.offsetY ?? 0),
        rotate: base.rotate + (delta.rotate ?? 0),
      });
      return { ...prev, [id]: nextAdj };
    });
  }, []);

  const resetAdjustment = useCallback((id: string) => {
    setAdjustments((prev) => {
      if (!(id in prev)) return prev;
      const nextAdj = { ...prev };
      delete nextAdj[id];
      return nextAdj;
    });
  }, []);

  const current = items[currentIndex] ?? null;
  const currentAdjustment = current ? adjustments[current.id] ?? DEFAULT_ADJUSTMENT : DEFAULT_ADJUSTMENT;
  // Modelo comercial seleccionado (conserva el CÓDIGO pedido, no el resuelto).
  const selectedModel: CatalogModel | null = selectedModelId ? getModel(selectedModelId) ?? null : null;

  return {
    // catálogo
    catalog: MODELOS_ACTIVOS,
    selectedModelId,
    selectedModel,
    loadModel,
    loadError,
    // sesión
    items,
    current,
    currentIndex,
    processing,
    addGlasses,
    addTemple,
    removeCurrent,
    next,
    prev,
    favorites,
    addFavorite,
    removeFavorite,
    favoritesFull: favorites.length >= MAX_FAVORITES,
    currentAdjustment,
    nudgeAdjustment,
    resetAdjustment,
  };
}

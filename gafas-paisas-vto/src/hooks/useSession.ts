"use client";

import { useCallback, useState } from "react";
import { processGlassesImage, type ProcessedGlasses } from "@/lib/glassesProcessor";
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

function clampAdjustment(a: Adjustment): Adjustment {
  return {
    scale: Math.max(0.5, Math.min(2, a.scale)),
    offsetX: Math.max(-0.6, Math.min(0.6, a.offsetX)),
    offsetY: Math.max(-0.6, Math.min(0.6, a.offsetY)),
    rotate: Math.max(-0.5, Math.min(0.5, a.rotate)),
  };
}

/**
 * SessionManager: biblioteca temporal de gafas cargadas en la sesión
 * (sin persistencia ni backend) + favoritos (máx. 5).
 */
export function useSession() {
  const [items, setItems] = useState<ProcessedGlasses[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [processing, setProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, Adjustment>>({});

  const addGlasses = useCallback(async (file: File) => {
    setProcessing(true);
    try {
      const processed = await processGlassesImage(file);
      setItems((prev) => {
        const next = [...prev, processed];
        setCurrentIndex(next.length - 1);
        return next;
      });
    } finally {
      setProcessing(false);
    }
  }, []);

  /** Asocia la foto de la pata a la gafa actual. */
  const addTemple = useCallback(
    async (file: File) => {
      const id = items[currentIndex]?.id;
      if (!id) return;
      setProcessing(true);
      try {
        const processed = await processGlassesImage(file);
        setItems((prev) => prev.map((g) => (g.id === id ? { ...g, temple: processed.canvas } : g)));
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
      const next = clampAdjustment({
        scale: base.scale + (delta.scale ?? 0),
        offsetX: base.offsetX + (delta.offsetX ?? 0),
        offsetY: base.offsetY + (delta.offsetY ?? 0),
        rotate: base.rotate + (delta.rotate ?? 0),
      });
      return { ...prev, [id]: next };
    });
  }, []);

  const resetAdjustment = useCallback((id: string) => {
    setAdjustments((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const current = items[currentIndex] ?? null;
  const currentAdjustment = current ? adjustments[current.id] ?? DEFAULT_ADJUSTMENT : DEFAULT_ADJUSTMENT;

  return {
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

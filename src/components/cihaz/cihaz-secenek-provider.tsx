"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import {
  secenekListesi,
  secenekSatirlariniHaritayaCevir,
  type CihazSecenekMap,
  type CihazSecenekRow,
  type SecenekKategori,
  type SecenekTuru,
} from "@/lib/cihaz/secenekler";

type ListeGetir = (
  kategori: SecenekKategori,
  tur: SecenekTuru,
  yedek: readonly string[]
) => readonly string[];

const CihazSecenekContext = createContext<CihazSecenekMap | null>(null);

export function CihazSecenekProvider({
  rows,
  children,
}: {
  rows: CihazSecenekRow[];
  children: ReactNode;
}) {
  const map = useMemo(() => secenekSatirlariniHaritayaCevir(rows), [rows]);
  return <CihazSecenekContext.Provider value={map}>{children}</CihazSecenekContext.Provider>;
}

/** Provider yoksa sabit (yedek) listeler kullanılır. */
export function useCihazSecenekListesi(): ListeGetir {
  const map = useContext(CihazSecenekContext);
  return useCallback<ListeGetir>(
    (kategori, tur, yedek) => secenekListesi(map, kategori, tur, yedek),
    [map]
  );
}

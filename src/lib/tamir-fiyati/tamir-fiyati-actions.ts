"use server";

import {
  getTamirFiyatlariByModelAndCategory,
  getTamirKategorileriByModel,
  getTamirModelleriByMarka,
} from "@/lib/tamir-fiyati/tamir-fiyati-queries";

export async function fetchTamirModelleri(markaSlug: string) {
  return getTamirModelleriByMarka(markaSlug);
}

export async function fetchTamirKategorileri(modelId: string) {
  return getTamirKategorileriByModel(modelId);
}

export async function fetchTamirFiyatlari(modelId: string, category: string) {
  return getTamirFiyatlariByModelAndCategory(modelId, category);
}

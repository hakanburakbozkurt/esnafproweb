"use server";

import {
  getTamirFiyatlariByModel,
  getTamirModelleriByMarka,
} from "@/lib/tamir-fiyati/tamir-fiyati-queries";

export async function fetchTamirModelleri(markaSlug: string) {
  return getTamirModelleriByMarka(markaSlug);
}

export async function fetchTamirFiyatlariByModel(modelId: string) {
  return getTamirFiyatlariByModel(modelId);
}

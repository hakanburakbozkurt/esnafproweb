export const FAQ_POOL_SAMPLE_SIZE = 5;

export function createRandomSource(seed?: string): () => number {
  if (!seed) {
    return Math.random;
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return () => {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    return hash / 0x100000000;
  };
}

export function shuffleArray<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function sampleFromPool<T>(
  items: T[],
  count = FAQ_POOL_SAMPLE_SIZE,
  random: () => number = Math.random
): T[] {
  if (!items.length) return [];
  return shuffleArray(items, random).slice(0, Math.min(count, items.length));
}

export function createPoolSampleKey(seed?: string): string {
  if (seed) return seed;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

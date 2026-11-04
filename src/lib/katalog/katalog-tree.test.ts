import { describe, expect, it } from "vitest";
import { buildKatalogTree, filterKatalogItemsBySelection } from "@/lib/katalog/katalog-tree";
import type { KatalogWebItem } from "@/types/database.types";

const item = (id: string, brand: string, model: string, is_sold = false) =>
  ({ id, brand, model_name: model, is_sold, sort_order: 0, created_at: "2026-01-01" }) as unknown as KatalogWebItem;

describe("buildKatalogTree", () => {
  it("büyük-küçük harf farkı olan marka ve modelleri tek klasörde toplar", () => {
    const tree = buildKatalogTree([
      item("1", "Samsung", "Galaxy A16"),
      item("2", "samsung", "galaxy a16", true),
      item("3", " Samsung ", "Galaxy  A16"),
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].brand).toBe("Samsung");
    expect(tree[0].totalCount).toBe(3);
    expect(tree[0].models).toHaveLength(1);
    expect(tree[0].models[0]).toMatchObject({ modelName: "Galaxy A16", totalCount: 3, availableCount: 2 });
  });

  it("klasör sayıları seçilen klasördeki ürünlerle eşleşir", () => {
    const items = [item("1", "Samsung", "A16"), item("2", "samsung", "a16")];
    const tree = buildKatalogTree(items);
    const selected = filterKatalogItemsBySelection(items, {
      brand: tree[0].brand,
      modelName: tree[0].models[0].modelName,
    });
    expect(selected).toHaveLength(tree[0].models[0].totalCount);
  });
});

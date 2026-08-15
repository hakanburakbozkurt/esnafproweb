/**
 * data/esnafpro-iphone-repair-prices.json → supabase/seeds/esnafpro-tamir-fiyatlari-seed.sql
 * Kullanım: node scripts/generate-esnafpro-tamir-seed.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = join(__dirname, "..", "data", "esnafpro-iphone-repair-prices.json");
const OUTPUT = join(__dirname, "..", "supabase", "seeds", "esnafpro-tamir-fiyatlari-seed.sql");

function sqlString(value) {
  if (value == null || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value == null || Number.isNaN(value)) return "0";
  return String(value);
}

function main() {
  const payload = JSON.parse(readFileSync(INPUT, "utf8"));
  const lines = [];

  lines.push("-- EsnafPRO tamir fiyat seed (Apple / iPhone)");
  lines.push("-- Kaynak: EsnafPRO referans fiyat verisi");
  lines.push(`-- Üretim: ${new Date().toISOString()}`);
  lines.push("begin;");
  lines.push("");
  lines.push("delete from public.tamir_fiyatlari;");
  lines.push("delete from public.tamir_modelleri;");
  lines.push("delete from public.tamir_serileri;");
  lines.push("delete from public.tamir_markalari where slug = 'apple';");
  lines.push("");
  lines.push(
    "insert into public.tamir_markalari (name, slug, sort_order, aktif) values ('Apple', 'apple', 1, true);"
  );
  lines.push("");

  let seriesOrder = 0;
  for (const series of payload.series ?? []) {
    seriesOrder += 1;
    lines.push(
      `insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, ${sqlString(series.series)}, ${sqlString(series.slug)}, ${seriesOrder} from public.tamir_markalari m where m.slug = 'apple';`
    );
  }

  lines.push("");

  for (const series of payload.series ?? []) {
    let modelOrder = 0;
    for (const model of series.models ?? []) {
      modelOrder += 1;
      lines.push(
        `insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, ${sqlString(model.model)}, ${sqlString(model.slug)}, ${modelOrder} from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = ${sqlString(series.slug)};`
      );

      const services = model.services?.length
        ? model.services
        : (model.categories ?? []).flatMap((category, categoryIndex) =>
            (category.services ?? []).map((service, serviceIndex) => ({
              ...service,
              category: category.category,
              order: categoryIndex * 100 + serviceIndex + 1,
            }))
          );

      if (!services.length) continue;

      const valueRows = services
        .map((service, index) => {
          const order = service.order ?? index + 1;
          return `(${sqlString(service.category)}, ${sqlString(service.service)}, ${sqlNumber(service.price)}, ${sqlString(service.description)}, ${order})`;
        })
        .join(",\n    ");

      lines.push(`insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)`);
      lines.push(`select m.id, v.category, v.service_name, v.price, v.description, v.sort_order`);
      lines.push(`from public.tamir_modelleri m`);
      lines.push(`join public.tamir_serileri s on s.id = m.seri_id`);
      lines.push(`join public.tamir_markalari br on br.id = s.marka_id`);
      lines.push(
        `cross join (values\n    ${valueRows}\n) as v(category, service_name, price, description, sort_order)`
      );
      lines.push(
        `where br.slug = 'apple' and s.slug = ${sqlString(series.slug)} and m.slug = ${sqlString(model.slug)};`
      );
      lines.push("");
    }
  }

  lines.push("commit;");
  lines.push("");

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, lines.join("\n"), "utf8");

  const priceCount = (payload.series ?? []).reduce(
    (total, series) =>
      total +
      (series.models ?? []).reduce(
        (modelTotal, model) =>
          modelTotal +
          (model.services?.length ??
            (model.categories ?? []).reduce(
              (catTotal, cat) => catTotal + (cat.services?.length ?? 0),
              0
            )),
        0
      ),
    0
  );

  console.log(`Seed yazıldı: ${OUTPUT}`);
  console.log(
    `${payload.series?.length ?? 0} seri, ${(payload.series ?? []).reduce((n, s) => n + (s.models?.length ?? 0), 0)} model, ${priceCount} fiyat`
  );
}

main();

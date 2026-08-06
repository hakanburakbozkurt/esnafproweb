<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# EsnafPRO — Agent Kuralları

Detaylı standartlar: `.cursor/rules/esnafpro-standards.mdc`

## Özet

1. **Mimari:** Next.js App Router + TypeScript + Tailwind + Supabase. Mutasyonlar yalnızca Server Actions (`src/lib/dukkan/actions.ts` vb.).
2. **Sütun adları:** Form, tip ve DB %100 uyumlu. `dukkan_adi`, `fotograf_url`, `urun_adi` — alias kullanma. Tipler: `src/types/database.types.ts`.
3. **UI:** Mobile-first vitrin; `line-clamp` ürün kartları; galeri için `embla-carousel-react`.
4. **Hatalar:** Sessiz catch yok; `logDukkanAction` + kullanıcıya Türkçe geri bildirim.

## Dokunma

- `src/app/page.tsx` (landing) ve `src/app/layout.tsx` — yalnızca açık istekle.

## Ana rotalar

| Rota | Amaç |
|------|------|
| `/dukkan-ac` | Dükkan oluştur |
| `/dukkan-ayarlari` | Dükkan düzenle |
| `/[slug]` | Public vitrin |
| `/giris` | Auth |

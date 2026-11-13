import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Sosyal paylaşım görseli (Open Graph / Twitter, 1200x630).
 * Kendi görseli olmayan her sayfa bunu kullanır: WhatsApp, Instagram, X ve
 * LinkedIn'de bağlantı paylaşılınca bu kart görünür.
 * Derlemede bir kez üretilir, CDN'den sunulur.
 */
export const dynamic = "force-static";

const GENISLIK = 1200;
const YUKSEKLIK = 630;

const RENK = {
  zemin: "#f6faf8",
  koyu: "#0f172a",
  metin: "#475569",
  yesil: "#059669",
  acikYesil: "#d1fae5",
  cerceve: "#0f172a",
} as const;

const ASSET_DIR = join(process.cwd(), "src", "assets", "og");

async function varlik(dosya: string) {
  return readFile(join(ASSET_DIR, dosya));
}

export async function GET() {
  // Roboto'nun latin ve latin-ext alt kümeleri tek dosyada birleştirildi:
  // ş, ğ, ı, İ gibi Türkçe harfler eksiksiz çizilir.
  const [roboto400, roboto800, vitrin] = await Promise.all([
    varlik("roboto-400.ttf"),
    varlik("roboto-800.ttf"),
    varlik("vitrin.jpg"),
  ]);

  const vitrinSrc = `data:image/jpeg;base64,${vitrin.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: RENK.zemin,
          fontFamily: "Roboto",
          position: "relative",
        }}
      >
        {/* Sağdaki yeşil blok: telefonun oturduğu zemin */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 430,
            height: YUKSEKLIK,
            backgroundColor: RENK.acikYesil,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 0 60px 72px",
            width: 720,
          }}
        >
          <div style={{ display: "flex", fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: RENK.koyu }}>Esnaf</span>
            <span style={{ color: RENK.yesil }}>PRO</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 66,
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: -2,
                color: RENK.koyu,
              }}
            >
              <span>Dükkanın bugün</span>
              <span style={{ color: RENK.yesil }}>internette olsun.</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 28,
                lineHeight: 1.35,
                color: RENK.metin,
                maxWidth: 640,
              }}
            >
              Telefoncular ve teknik servisler için ücretsiz dijital mağaza: ürünler, 2. el cihazlar, servis
              takibi.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                backgroundColor: RENK.yesil,
                color: "#ffffff",
                fontSize: 26,
                fontWeight: 800,
                padding: "14px 30px",
                borderRadius: 999,
              }}
            >
              esnafpro.app
            </div>
            <div style={{ display: "flex", marginLeft: 22, fontSize: 24, color: RENK.metin }}>
              Kayıt ücretsiz, kurulum dakikalar
            </div>
          </div>
        </div>

        {/* Gerçek mağaza ekranı, telefon çerçevesi içinde */}
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 58,
            width: 290,
            height: 600,
            display: "flex",
            backgroundColor: RENK.cerceve,
            borderRadius: 44,
            padding: 10,
            boxShadow: "0 30px 60px rgba(15, 23, 42, 0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              borderRadius: 34,
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={vitrinSrc} width={270} height={545} style={{ objectFit: "cover", objectPosition: "top" }} alt="" />
          </div>
        </div>
      </div>
    ),
    {
      width: GENISLIK,
      height: YUKSEKLIK,
      fonts: [
        { name: "Roboto", data: roboto400, weight: 400, style: "normal" },
        { name: "Roboto", data: roboto800, weight: 800, style: "normal" },
      ],
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
      },
    }
  );
}

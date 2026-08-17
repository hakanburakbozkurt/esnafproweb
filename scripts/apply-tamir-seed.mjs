/**
 * EsnafPRO Tamir Fiyatları - Supabase Seed Uygulayıcı
 * Mevcut generator'dan SERIES verisini alır ve doğrudan Supabase'e insert eder.
 *
 * Kullanım: node scripts/apply-tamir-seed.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local dosyasını oku
const envPath = path.join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) envVars[m[1].trim()] = m[2].trim();
}

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"] || envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase URL veya KEY bulunamadı");
  process.exit(1);
}

// Basit Supabase REST wrapper (no SDK needed)
const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

const supabase = {
  async select(table, filter) {
    const params = new URLSearchParams(filter);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }
    return res.json();
  },
};

// ─── Ortak "Diğer Onarımlar" kalemleri ────────────────────────────────────────
function digerOnarimlar(modelLabel, faceId, onKamera, proximity, sarj, ahize, kamCami, acKapat = 5999, ses = 5999, titresim = 2499) {
  return [
    { cat: "Diğer Onarımlar", name: "Genel Bakım Temizlik", price: 1999, desc: null },
    { cat: "Diğer Onarımlar", name: `Açılmayan ${modelLabel} Tamiri`, price: 0, desc: "Tespit gerekli" },
    { cat: "Diğer Onarımlar", name: "Face ID Tamiri", price: faceId, desc: faceId === 0 ? "Bu modelde Face ID bulunmamaktadır" : null },
    { cat: "Diğer Onarımlar", name: "TrueDepth Kamera Değişimi", price: faceId === 0 ? 0 : 13999, desc: faceId === 0 ? "Bu modelde Face ID bulunmamaktadır" : "Face ID + Ön Kamera (Face ID %100 çözüm)" },
    { cat: "Diğer Onarımlar", name: "Ön Kamera Değişimi", price: onKamera, desc: null },
    { cat: "Diğer Onarımlar", name: "Proximity Işık Sensör Fleksi Değişimi", price: proximity, desc: null },
    { cat: "Diğer Onarımlar", name: "Şarj Soketi Değişimi", price: sarj, desc: null },
    { cat: "Diğer Onarımlar", name: "İç Kulaklık Hoparlörü (Ahize) Değişimi", price: ahize, desc: null },
    { cat: "Diğer Onarımlar", name: "Kamera Camı Değişimi", price: kamCami, desc: null },
    { cat: "Diğer Onarımlar", name: "Hoparlör Değişimi", price: 1999, desc: null },
    { cat: "Diğer Onarımlar", name: "Aç Kapat Butonu ve Flaş Değişimi", price: acKapat, desc: null },
    { cat: "Diğer Onarımlar", name: "Ses Butonları ve Sessize Alma Tuşu Değişimi", price: ses, desc: null },
    { cat: "Diğer Onarımlar", name: "Titreşim Motoru Değişimi", price: titresim, desc: null },
    { cat: "Diğer Onarımlar", name: "Sıvı Teması Tamiri", price: 0, desc: "Tespit gerekli" },
    { cat: "Diğer Onarımlar", name: "Veri Kurtarma", price: 0, desc: "Tespit gerekli" },
    { cat: "Diğer Onarımlar", name: "Diğer tamirler", price: 0, desc: "Tespit gerekli" },
  ];
}

// ─── Tüm modeller ─────────────────────────────────────────────────────────────
const SERIES = [
  {
    slug: "iphone-17-serisi",
    models: [
      // iPhone 17 Air is already inserted
      {
        name: "iPhone 17 Pro Max", slug: "iphone-17-pro-max", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 9999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 21999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı", price: 15299, desc: "Apple Desteksiz" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 18999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili", price: 4899, desc: "Apple Desteksiz" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 21999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça", price: 24999, desc: "Arka cam dahildir" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 7999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Orijinal Servis Parçası", price: 9499, desc: "Apple Desteksiz" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 8999, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası", price: 13999, desc: "Apple Destekli" },
          ...digerOnarimlar("iPhone 17 Pro Max", 7999, 3999, 3999, 9999, 3999, 2999),
        ],
      },
      {
        name: "iPhone 17 Pro", slug: "iphone-17-pro", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 8999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 18999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı", price: 15299, desc: "Apple Desteksiz" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 14999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 19999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Yeni)", price: 23999, desc: "Arka cam dahildir" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 7999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 13999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 8999, desc: null },
          ...digerOnarimlar("iPhone 17 Pro", 7999, 3999, 3999, 9999, 3999, 1999),
        ],
      },
      {
        name: "iPhone 17", slug: "iphone-17", sortOrder: 4,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 7999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 15999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 12999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Yeni)", price: 19999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 11999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 9499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış)", price: 7499, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 8999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          ...digerOnarimlar("iPhone 17", 6999, 2999, 2999, 6999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 17e", slug: "iphone-17e", sortOrder: 5,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 7999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 14999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 11999, desc: "Stoklarla sınırlıdır" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 6999, desc: "1 yıl parça garantili, ayarlarda bilinmeyen parça yazar" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 3499, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Yeni)", price: 19999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 12999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 9499, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 8999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          ...digerOnarimlar("iPhone 17e", 6999, 2999, 2999, 6999, 2999, 1499),
        ],
      },
    ],
  },
  {
    slug: "iphone-16-serisi",
    models: [
      {
        name: "iPhone 16 Pro Max", slug: "iphone-16-pro-max", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 9999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 19999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı", price: 15299, desc: "Apple Desteksiz" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 14999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili", price: 4899, desc: "Apple Desteksiz" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 3499, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 11999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça", price: 24999, desc: "Arka cam dahildir" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 7999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Orijinal Servis Parçası", price: 9499, desc: "Apple Desteksiz" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 5999, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 13999, desc: "Apple Destekli" },
          ...digerOnarimlar("iPhone 16 Pro Max", 7999, 3999, 3999, 7999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 16 Pro", slug: "iphone-16-pro", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 8999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 17999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı", price: 15299, desc: "Apple Desteksiz" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 13999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 3499, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 10999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Yeni)", price: 23999, desc: "Arka cam dahildir" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 7999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 13999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 5999, desc: null },
          ...digerOnarimlar("iPhone 16 Pro", 7999, 3999, 3999, 7999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 16 Plus", slug: "iphone-16-plus", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 8999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 15999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 12999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 3499, desc: null },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça (Yeni)", price: 19999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 9999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 9499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış)", price: 7499, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 8999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          ...digerOnarimlar("iPhone 16 Plus", 6999, 2999, 2999, 6999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 16", slug: "iphone-16", sortOrder: 4,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 8999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 15999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 12999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 3499, desc: null },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça (Yeni)", price: 19999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 9999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 9499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış)", price: 7499, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 8999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          ...digerOnarimlar("iPhone 16", 6999, 2999, 2999, 6999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 16e", slug: "iphone-16e", sortOrder: 5,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 8999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 14999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 11999, desc: "Stoklarla sınırlıdır" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 6999, desc: "1 yıl parça garantili, ayarlarda bilinmeyen parça yazar" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 3499, desc: null },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça (Yeni)", price: 19999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 12999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 9499, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 8999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3999, desc: null },
          ...digerOnarimlar("iPhone 16e", 6999, 2999, 2999, 6999, 2999, 1499),
        ],
      },
    ],
  },
  {
    slug: "iphone-15-serisi",
    models: [
      {
        name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 9999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 19999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 9999, desc: "1 yıl parça garantili, ayarlarda bilinmeyen parça yazar" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 15999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 3999, desc: "Marka: Deji, pil sağlığı aktif çalışır" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2999, desc: null },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça (Yeni)", price: 16999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 5999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 5999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 13999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 7999, desc: null },
          ...digerOnarimlar("iPhone 15 Pro Max", 7999, 3999, 3999, 7999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 15 Pro", slug: "iphone-15-pro", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 7999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 17999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 7999, desc: "1 yıl parça garantili, ayarlarda bilinmeyen parça yazar" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 13999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 3999, desc: "Marka: Deji, pil sağlığı aktif çalışır" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2999, desc: null },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça (Yeni)", price: 14999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 10999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 5999, desc: null },
          ...digerOnarimlar("iPhone 15 Pro", 6999, 3999, 3999, 7999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 15 Plus", slug: "iphone-15-plus", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 6999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 15999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 8999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 3999, desc: "Marka: Deji, pil sağlığı aktif çalışır" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2999, desc: null },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça (Yeni)", price: 14999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 9499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 8999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3999, desc: null },
          ...digerOnarimlar("iPhone 15 Plus", 6999, 2999, 2999, 6999, 1999, 1499),
        ],
      },
      {
        name: "iPhone 15", slug: "iphone-15", sortOrder: 4,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 6999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 15999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 8999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 6999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 3999, desc: "Marka: Deji, pil sağlığı aktif çalışır" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2999, desc: null },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça (Yeni)", price: 14999, desc: "Arka cam dahildir" },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 9499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 8999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3999, desc: null },
          ...digerOnarimlar("iPhone 15", 6999, 2999, 2999, 6999, 1999, 1499),
        ],
      },
    ],
  },
  {
    slug: "iphone-14-serisi",
    models: [
      {
        name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 7999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 19999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı", price: 15299, desc: "Apple Desteksiz" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 8999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 15999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 5999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji, pil sağlığı aktif çalışır" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2499, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 7999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça", price: 14999, desc: "Arka cam dahildir" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 10999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 5999, desc: null },
          ...digerOnarimlar("iPhone 14 Pro Max", 5999, 2999, 2999, 5999, 1999, 1499),
        ],
      },
      {
        name: "iPhone 14 Pro", slug: "iphone-14-pro", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 6999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 17999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı", price: 15299, desc: "Apple Desteksiz" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 7999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 12999, desc: "Stok sorunuz" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 5999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji, pil sağlığı aktif çalışır" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 2499, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 6999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça", price: 12999, desc: "Arka cam dahildir" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Servis Parçası (Yeni)", price: 10499, desc: "Apple Destekli" },
          { cat: "Arka Cam Değişimleri", name: "Arka Cam - Orijinal Parça (Kullanılmış, temiz)", price: 3999, desc: "Stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Servis Kamerası (Yeni)", price: 9999, desc: "Apple Destekli" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          ...digerOnarimlar("iPhone 14 Pro", 5999, 2999, 2999, 5999, 1999, 1499),
        ],
      },
      {
        name: "iPhone 14 Plus", slug: "iphone-14-plus", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 4999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 11999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 5999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 8999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 4999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          ...digerOnarimlar("iPhone 14 Plus", 4999, 1999, 1999, 4999, 1999, 1499, 3999, 3999, 1999),
        ],
      },
      {
        name: "iPhone 14", slug: "iphone-14", sortOrder: 4,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 3999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 9999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 4999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 6999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 4999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 3999, desc: "Arka cam dahil değildir, stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3999, desc: null },
          ...digerOnarimlar("iPhone 14", 4999, 1999, 1999, 3999, 1999, 1499, 3999, 3999, 1999),
        ],
      },
    ],
  },
  {
    slug: "iphone-13-serisi",
    models: [
      {
        name: "iPhone 13 Pro Max", slug: "iphone-13-pro-max", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 5999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 17999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 7999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 13999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 5999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 5999, desc: "Arka cam dahildir, stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          ...digerOnarimlar("iPhone 13 Pro Max", 4999, 1999, 1999, 3999, 1999, 1499, 3999, 3999, 1999),
        ],
      },
      {
        name: "iPhone 13 Pro", slug: "iphone-13-pro", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 4999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 14999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 5999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 10999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 5999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 4999, desc: "Arka cam dahildir, stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3999, desc: null },
          ...digerOnarimlar("iPhone 13 Pro", 4999, 1999, 1999, 3999, 1999, 1499, 3999, 3999, 1999),
        ],
      },
      {
        name: "iPhone 13 Mini", slug: "iphone-13-mini", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 2999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 9999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 3999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 6999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 4999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1499, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 2999, desc: null },
          ...digerOnarimlar("iPhone 13 Mini", 3999, 1499, 1499, 2999, 1499, 999, 2999, 2999, 1499),
        ],
      },
      {
        name: "iPhone 13", slug: "iphone-13", sortOrder: 4,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 3999, desc: null },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 11999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 4999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 7999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 4999, desc: "Apple Destekli" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1499, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3499, desc: null },
          ...digerOnarimlar("iPhone 13", 3999, 1999, 1999, 3499, 1499, 1499, 2999, 2999, 1499),
        ],
      },
    ],
  },
  {
    slug: "iphone-12-serisi",
    models: [
      {
        name: "iPhone 12 Pro Max", slug: "iphone-12-pro-max", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 4999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 6999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 17999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 13999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 5999, desc: null },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji, 4410mAh" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1999, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 7999, desc: "Arka cam dahildir, stoklarla sınırlıdır" },
          { cat: "Kasa Değişimleri", name: "Orijinal Parça", price: 11999, desc: "Arka cam dahildir, stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 4999, desc: null },
          { cat: "Diğer Onarımlar", name: "Genel Bakım Temizlik", price: 1499, desc: null },
          ...digerOnarimlar("iPhone 12 Pro Max", 4999, 1999, 1999, 4999, 1999, 1499, 3999, 3999, 1999).slice(1),
        ],
      },
      {
        name: "iPhone 12 Pro", slug: "iphone-12-pro", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 3999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 5999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Servis Ekranı (Yeni)", price: 14999, desc: "Apple Destekli" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 10999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 4999, desc: null },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 2999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1499, desc: null },
          { cat: "Kasa Değişimleri", name: "Kasa - Orijinal Parça (Kullanılmış, temiz)", price: 5999, desc: "Arka cam dahildir, stoklarla sınırlıdır" },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3999, desc: null },
          { cat: "Diğer Onarımlar", name: "Genel Bakım Temizlik", price: 1499, desc: null },
          ...digerOnarimlar("iPhone 12 Pro", 4999, 1999, 1999, 4999, 1999, 1499, 3999, 3999, 1999).slice(1),
        ],
      },
      {
        name: "iPhone 12 Mini", slug: "iphone-12-mini", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 2499, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 3999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 6999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 4999, desc: null },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1499, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 2999, desc: null },
          { cat: "Diğer Onarımlar", name: "Genel Bakım Temizlik", price: 1499, desc: null },
          ...digerOnarimlar("iPhone 12 Mini", 4999, 1499, 1499, 3999, 1499, 999, 2999, 2999, 1499).slice(1),
        ],
      },
      {
        name: "iPhone 12", slug: "iphone-12", sortOrder: 4,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 2999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 4999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 8999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 4999, desc: null },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 1499, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 2999, desc: null },
          { cat: "Diğer Onarımlar", name: "Genel Bakım Temizlik", price: 1499, desc: null },
          ...digerOnarimlar("iPhone 12", 4999, 1499, 1499, 3999, 1499, 999, 2999, 2999, 1499).slice(1),
        ],
      },
    ],
  },
  {
    slug: "iphone-11-serisi",
    models: [
      {
        name: "iPhone 11 Pro Max", slug: "iphone-11-pro-max", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 2999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 3999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 7999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 3999, desc: null },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1499, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 999, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 3999, desc: null },
          ...digerOnarimlar("iPhone 11 Pro Max", 3999, 1499, 1499, 2999, 1499, 999, 1999, 1999, 1499),
        ],
      },
      {
        name: "iPhone 11 Pro", slug: "iphone-11-pro", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 2499, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 2999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 5999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 3999, desc: null },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1499, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 999, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 2999, desc: null },
          ...digerOnarimlar("iPhone 11 Pro", 3999, 1499, 1499, 2999, 1499, 999, 1999, 1999, 1499),
        ],
      },
      {
        name: "iPhone 11", slug: "iphone-11", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 1999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 2499, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 4499, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Orijinal Servis Pili (Yeni)", price: 3499, desc: null },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1499, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 799, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 2499, desc: null },
          ...digerOnarimlar("iPhone 11", 2999, 1499, 1499, 2499, 1499, 999, 1999, 1999, 1499),
        ],
      },
    ],
  },
  {
    slug: "iphone-x-serisi",
    models: [
      {
        name: "iPhone XS Max", slug: "iphone-xs-max", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 1999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 2999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 5999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1499, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 799, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 2999, desc: null },
          ...digerOnarimlar("iPhone XS Max", 2999, 999, 999, 1999, 999, 999, 1999, 1999, 999),
        ],
      },
      {
        name: "iPhone XS", slug: "iphone-xs", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 1999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 2499, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 4999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1499, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 799, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 2499, desc: null },
          ...digerOnarimlar("iPhone XS", 2999, 999, 999, 1999, 999, 999, 1999, 1999, 999),
        ],
      },
      {
        name: "iPhone XR", slug: "iphone-xr", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 1499, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 1999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 3499, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1299, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 699, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 1999, desc: null },
          ...digerOnarimlar("iPhone XR", 2499, 999, 999, 1999, 999, 799, 1499, 1499, 999),
        ],
      },
      {
        name: "iPhone X", slug: "iphone-x", sortOrder: 4,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 1499, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 1999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 3999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1299, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 699, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 1999, desc: null },
          ...digerOnarimlar("iPhone X", 2499, 999, 999, 1999, 999, 799, 1499, 1499, 999),
        ],
      },
    ],
  },
  {
    slug: "iphone-8-serisi",
    models: [
      {
        name: "iPhone 8 Plus", slug: "iphone-8-plus", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 1499, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 2999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 499, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 1499, desc: null },
          ...digerOnarimlar("iPhone 8 Plus", 0, 799, 799, 1499, 799, 499, 999, 999, 799),
        ],
      },
      {
        name: "iPhone 8", slug: "iphone-8", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 799, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 1199, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 2499, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 499, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 1299, desc: null },
          ...digerOnarimlar("iPhone 8", 0, 699, 699, 1299, 699, 499, 999, 999, 699),
        ],
      },
    ],
  },
  {
    slug: "iphone-se-serisi",
    models: [
      {
        name: "iPhone SE 2022 (3. nesil)", slug: "iphone-se-2022", sortOrder: 1,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 1999, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 2999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 4499, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 1499, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 699, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 1999, desc: null },
          ...digerOnarimlar("iPhone SE 2022", 0, 999, 999, 1499, 999, 699, 1499, 1499, 999),
        ],
      },
      {
        name: "iPhone SE 2020 (2. nesil)", slug: "iphone-se-2020", sortOrder: 2,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 1499, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 1999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 2999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 999, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 499, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 1499, desc: null },
          ...digerOnarimlar("iPhone SE 2020", 0, 799, 799, 1299, 799, 499, 999, 999, 699),
        ],
      },
      {
        name: "iPhone SE 2016", slug: "iphone-se-2016", sortOrder: 3,
        services: [
          { cat: "Genel", name: "Ön Cam Değişimi", price: 799, desc: null },
          { cat: "Ekran Değişimleri", name: "Yüksek Kaliteli Ekran (Yeni)", price: 999, desc: "1 yıl parça garantili" },
          { cat: "Ekran Değişimleri", name: "Orijinal Ekran (Kullanılmış, temiz)", price: 1999, desc: "Stoklarla sınırlıdır" },
          { cat: "Pil Değişimleri", name: "Yüksek Kaliteli Pil (Yeni)", price: 799, desc: "Marka: Deji" },
          { cat: "Pil Değişimleri", name: "Orijinal Pil (Kullanılmış)", price: 399, desc: null },
          { cat: "Arka Kamera Değişimleri", name: "Arka Kamera - Orijinal Çıkma Kamera", price: 999, desc: null },
          ...digerOnarimlar("iPhone SE 2016", 0, 499, 499, 999, 499, 299, 699, 699, 499),
        ],
      },
    ],
  },
];

// ─── Ana insert fonksiyonu ─────────────────────────────────────────────────────
async function insertModel(seriSlug, model) {
  // 1. Seriyi bul
  const seris = await supabase.select("tamir_serileri", { slug: `eq.${seriSlug}`, select: "id" });
  if (!seris.length) {
    console.error(`  ❌ Seri bulunamadı: ${seriSlug}`);
    return;
  }
  const seriId = seris[0].id;

  // 2. Modeli ekle
  let inserted;
  try {
    const result = await supabase.insert("tamir_modelleri", {
      seri_id: seriId,
      name: model.name,
      slug: model.slug,
      sort_order: model.sortOrder,
    });
    inserted = Array.isArray(result) ? result[0] : result;
  } catch (e) {
    console.error(`  ❌ Model insert hatası: ${model.name}`, e.message);
    return;
  }

  // 3. Fiyatları ekle (batch)
  const prices = model.services.map((s, i) => ({
    model_id: inserted.id,
    category: s.cat,
    service_name: s.name,
    price: s.price,
    description: s.desc ?? null,
    sort_order: (i + 1) * 100,
  }));

  try {
    await supabase.insert("tamir_fiyatlari", prices);
    console.log(`  ✅ ${model.name} → ${prices.length} hizmet`);
  } catch (e) {
    console.error(`  ❌ Fiyat insert hatası: ${model.name}`, e.message);
  }
}

async function main() {
  console.log("🚀 EsnafPRO Tamir Fiyatları Seed başlıyor...\n");

  let totalModels = 0;
  for (const seri of SERIES) {
    console.log(`\n📱 ${seri.slug}:`);
    for (const model of seri.models) {
      await insertModel(seri.slug, model);
      totalModels++;
    }
  }

  const res = await supabase.select("tamir_fiyatlari", { select: "id" });
  console.log(`\n✅ Tamamlandı: ${totalModels} model, ~${res.length} fiyat satırı`);
}

main().catch(console.error);

/** EsnafPRO App Router — public ve dahili rota haritası (llms.txt üretimi için referans) */

export type LlmsRouteDefinition = {
  path: string;
  title: string;
  description: string;
  /** llms.txt ve sitemap'e dahil edilsin mi */
  publicIndexable: boolean;
  group:
    | "platform"
    | "platform-dynamic"
    | "store"
    | "store-dynamic"
    | "auth"
    | "admin"
    | "api"
    | "transactional";
};

/** Statik platform sayfaları — src/app altındaki page.tsx dosyaları */
export const PLATFORM_STATIC_ROUTES: LlmsRouteDefinition[] = [
  {
    path: "/",
    title: "Ana Sayfa",
    description:
      "EsnafPRO tanıtımı, özellikler, öne çıkan esnaf vitrinleri ve blog özeti.",
    publicIndexable: true,
    group: "platform",
  },
  {
    path: "/hakkimizda",
    title: "Hakkımızda",
    description: "EsnafPRO platformu ve misyonu hakkında kurumsal bilgi.",
    publicIndexable: true,
    group: "platform",
  },
  {
    path: "/iletisim",
    title: "İletişim",
    description: "EsnafPRO destek ve iş birliği iletişim bilgileri.",
    publicIndexable: true,
    group: "platform",
  },
  {
    path: "/fiyatlandirma",
    title: "Fiyatlandırma",
    description: "Esnaf ve toptancı paket fiyatları ile SSS.",
    publicIndexable: true,
    group: "platform",
  },
  {
    path: "/tamir-fiyati",
    title: "Tamir Fiyatı Al",
    description: "Marka/model seçerek referans tamir fiyat listesi sihirbazı.",
    publicIndexable: true,
    group: "platform",
  },
  {
    path: "/pazaryeri",
    title: "İkinci El Pazaryeri",
    description: "Tüm esnaf vitrinlerinin yayınladığı ikinci el cihaz ilanları.",
    publicIndexable: true,
    group: "platform",
  },
  {
    path: "/blog",
    title: "Esnaf Rehberi",
    description: "Mağaza blog yazılarının platform geneli indeks sayfası.",
    publicIndexable: true,
    group: "platform",
  },
  {
    path: "/esnaflar",
    title: "Esnaf Vitrini",
    description: "Aktif dijital vitrin açmış esnaf ve işletmelerin listesi.",
    publicIndexable: true,
    group: "platform",
  },
];

/** Dinamik platform rotaları */
export const PLATFORM_DYNAMIC_ROUTES: LlmsRouteDefinition[] = [
  {
    path: "/blog/[slug]",
    title: "Eski blog URL yönlendirmesi",
    description:
      "Kalıcı 301 yönlendirme: /blog/[slug] → /{dukkan-slug}/blog/[slug].",
    publicIndexable: false,
    group: "platform-dynamic",
  },
  {
    path: "/servis-takip/[device_code]",
    title: "Servis Takip",
    description: "QR kod ile açılan cihaz bazlı teknik servis durum sayfası.",
    publicIndexable: false,
    group: "transactional",
  },
];

/** Esnaf vitrin şablon rotaları — /[slug] altında */
export const STORE_ROUTE_TEMPLATES: LlmsRouteDefinition[] = [
  {
    path: "/[slug]",
    title: "Vitrin Ana Sayfa",
    description: "Dükkan vitrini, ürünler, konum, SSS ve kapak görseli.",
    publicIndexable: true,
    group: "store",
  },
  {
    path: "/[slug]/hakkimizda",
    title: "Hakkımızda",
    description: "Mağaza hikayesi, galeri ve SSS.",
    publicIndexable: true,
    group: "store",
  },
  {
    path: "/[slug]/iletisim",
    title: "İletişim",
    description: "Telefon, WhatsApp, adres, harita ve iletişim SSS.",
    publicIndexable: true,
    group: "store",
  },
  {
    path: "/[slug]/blog",
    title: "Blog",
    description: "Mağazanın yayınladığı blog yazıları listesi.",
    publicIndexable: true,
    group: "store",
  },
  {
    path: "/[slug]/blog/[postSlug]",
    title: "Blog Yazısı",
    description: "Tekil blog içeriği, kapak görseli ve metin.",
    publicIndexable: true,
    group: "store-dynamic",
  },
  {
    path: "/[slug]/teknik-servis",
    title: "Teknik Servis",
    description: "Servis hizmetleri, fotoğraflar ve bilgi (modül açıksa).",
    publicIndexable: true,
    group: "store",
  },
  {
    path: "/[slug]/katalog",
    title: "Katalog",
    description: "Telefon/tablet model kataloğu (modül açıksa).",
    publicIndexable: true,
    group: "store",
  },
  {
    path: "/[slug]/pazaryeri",
    title: "Pazaryeri",
    description: "Mağazanın ikinci el cihaz ilanları listesi.",
    publicIndexable: true,
    group: "store",
  },
  {
    path: "/[slug]/pazaryeri/[deviceSlug]",
    title: "Pazaryeri İlan Detayı",
    description: "İkinci el cihaz detayı, ekspertiz ve görseller.",
    publicIndexable: true,
    group: "store-dynamic",
  },
  {
    path: "/[slug]/llms.txt",
    title: "Dükkan llms.txt",
    description: "Bu dükkanın tüm public URL envanterini listeleyen AI haritası.",
    publicIndexable: true,
    group: "store",
  },
];

/** Kimlik doğrulama ve kayıt — robots / llms Optional */
export const AUTH_ROUTES: LlmsRouteDefinition[] = [
  { path: "/giris", title: "Giriş", description: "Esnaf/toptancı giriş formu.", publicIndexable: false, group: "auth" },
  { path: "/dukkan-ac", title: "Dükkan Aç", description: "Yeni esnaf vitrini oluşturma.", publicIndexable: false, group: "auth" },
  { path: "/dukkan-ayarlari", title: "Dükkan Ayarları", description: "Vitrin düzenleme paneli (oturum gerekir).", publicIndexable: false, group: "auth" },
  { path: "/sifre-sifirla", title: "Şifre Sıfırla", description: "Parola sıfırlama talebi.", publicIndexable: false, group: "auth" },
  { path: "/yeni-sifre", title: "Yeni Şifre", description: "Yeni parola belirleme.", publicIndexable: false, group: "auth" },
  { path: "/toptanci-ac", title: "Toptancı Aç", description: "Toptancı hesabı oluşturma.", publicIndexable: false, group: "auth" },
  { path: "/toptanci-ayarlari", title: "Toptancı Ayarları", description: "Toptancı profil düzenleme.", publicIndexable: false, group: "auth" },
  { path: "/toptanci/xml-yukle", title: "XML Yükle", description: "Toptancı ürün feed yükleme.", publicIndexable: false, group: "auth" },
];

/** Yönetim paneli — robots disallow */
export const ADMIN_ROUTES: LlmsRouteDefinition[] = [
  { path: "/yonetim", title: "Yönetim", description: "Esnaf yönetim paneli.", publicIndexable: false, group: "admin" },
  { path: "/yonetim/katalog", title: "Katalog Yönetimi", description: "Mağaza katalog düzenleme.", publicIndexable: false, group: "admin" },
  { path: "/yonetim/blog/yeni", title: "Yeni Blog Yazısı", description: "Blog oluşturma.", publicIndexable: false, group: "admin" },
  { path: "/yonetim/toptanci/xml", title: "Toptancı XML Paneli", description: "Feed eşleme ve içe aktarma.", publicIndexable: false, group: "admin" },
  { path: "/yonetim/admin", title: "Süper Admin", description: "Platform yönetim dashboard.", publicIndexable: false, group: "admin" },
  { path: "/yonetim/admin/dukkan-onay", title: "Dükkan Onay", description: "Vitrin onay akışı.", publicIndexable: false, group: "admin" },
  { path: "/yonetim/admin/fiyatlar", title: "Fiyat Yönetimi", description: "Paket fiyatları.", publicIndexable: false, group: "admin" },
  { path: "/yonetim/admin/sss", title: "SSS Yönetimi", description: "Platform SSS.", publicIndexable: false, group: "admin" },
];

/** API route handlers */
export const API_ROUTES: LlmsRouteDefinition[] = [
  { path: "/auth/callback", title: "Auth Callback", description: "Supabase OAuth yönlendirmesi.", publicIndexable: false, group: "api" },
  { path: "/sitemap.xml", title: "Sitemap", description: "XML site haritası.", publicIndexable: true, group: "api" },
  { path: "/robots.txt", title: "Robots", description: "Tarama kuralları.", publicIndexable: true, group: "api" },
  { path: "/llms.txt", title: "llms.txt", description: "Platform AI ajan haritası (handler: /llms, rewrite ile sunulur).", publicIndexable: true, group: "api" },
  { path: "/llms", title: "llms handler", description: "llms.txt içeriğini üreten route handler.", publicIndexable: false, group: "api" },
];

export const ALL_ROUTE_DEFINITIONS: LlmsRouteDefinition[] = [
  ...PLATFORM_STATIC_ROUTES,
  ...PLATFORM_DYNAMIC_ROUTES,
  ...STORE_ROUTE_TEMPLATES,
  ...AUTH_ROUTES,
  ...ADMIN_ROUTES,
  ...API_ROUTES,
];

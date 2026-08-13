"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FaqEditor } from "@/components/dukkan/faq-editor";
import { ProfileHealthScore } from "@/components/dukkan/profile-health-score";
import { FormSection } from "@/components/dukkan/form-section";
import { GalleryUpload } from "@/components/dukkan/gallery-upload";
import { ImageUploadBox } from "@/components/dukkan/image-upload-box";
import {
  normalizeUrunItems,
  ProductPhotoEditor,
  type UrunFormItem,
} from "@/components/dukkan/product-photo-editor";
import { TeknikServisEditor } from "@/components/dukkan/teknik-servis-editor";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CalismaSaatleriEditor,
  CalismaSaatleriHiddenInput,
} from "@/components/dukkan/calisma-saatleri-editor";
import {
  coerceCalismaSaatleriState,
  isLegacyCalismaSaatleri,
  serializeCalismaSaatleri,
  type WeeklySchedule,
} from "@/lib/dukkan/calisma-saatleri";
import type { FaqPlaceholderSource } from "@/lib/dukkan/faq-placeholders";
import { normalizeFaqItems } from "@/lib/dukkan/form-data";
import {
  MARKA_TERMS_FIELD_NAME,
  MARKA_TERMS_LABEL,
} from "@/lib/dukkan/marka-terms";
import { slugify, sanitizeSlugInput } from "@/lib/utils/slug";
import { validateDukkanAdi, validateSlug } from "@/lib/utils/reserved-slugs";
import { premiumPanelClassName } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";
import type { Dukkan, DukkanUrunu, FaqItem } from "@/types/database.types";

const LocationMapPicker = dynamic(
  () =>
    import("@/components/dukkan/location-map-picker").then(
      (module) => module.LocationMapPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-2xl border border-gray-100 bg-slate-100 sm:h-80 lg:h-96" />
    ),
  }
);

type DukkanFormProps = {
  action: (formData: FormData) => void;
  submitLabel: string;
  pendingLabel?: string;
  error?: string | null;
  warning?: string | null;
  isPending?: boolean;
  defaultValues?: Partial<Dukkan>;
  defaultUrunler?: UrunFormItem[] | DukkanUrunu[];
  hiddenFields?: Record<string, string>;
  layout?: "default" | "wide";
  /** Yalnızca /dukkan-ayarlari — mağaza açılış formunda SEO alanları gösterilmez */
  showSeoFields?: boolean;
  /** Yalnızca /dukkan-ayarlari — vitrin logo bilgilendirme kutusu */
  showVitrinLogoHint?: boolean;
};

export function DukkanForm({
  action,
  submitLabel,
  pendingLabel = "Kaydediliyor…",
  error,
  warning,
  isPending = false,
  defaultValues,
  defaultUrunler,
  hiddenFields,
  layout = "default",
  showSeoFields = false,
  showVitrinLogoHint = false,
}: DukkanFormProps) {
  const [dukkanAdi, setDukkanAdi] = useState(defaultValues?.dukkan_adi ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [logoUrl, setLogoUrl] = useState(defaultValues?.logo_url ?? "");
  const [bannerUrl, setBannerUrl] = useState(defaultValues?.banner_url ?? "");
  const [telefon, setTelefon] = useState(defaultValues?.telefon ?? "");
  const [whatsapp, setWhatsapp] = useState(defaultValues?.whatsapp ?? "");
  const [calismaSaatleri, setCalismaSaatleri] = useState<WeeklySchedule>(() =>
    coerceCalismaSaatleriState(defaultValues?.calisma_saatleri ?? null)
  );
  const [hasLegacyCalismaSaatleri, setHasLegacyCalismaSaatleri] = useState(() =>
    isLegacyCalismaSaatleri(defaultValues?.calisma_saatleri ?? null)
  );
  const [instagramUrl, setInstagramUrl] = useState(
    defaultValues?.instagram_url ?? ""
  );
  const [tiktokUrl, setTiktokUrl] = useState(defaultValues?.tiktok_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(
    defaultValues?.facebook_url ?? ""
  );
  const [adres, setAdres] = useState(defaultValues?.adres ?? "");
  const [enlem, setEnlem] = useState<number | null>(defaultValues?.enlem ?? null);
  const [boylam, setBoylam] = useState<number | null>(defaultValues?.boylam ?? null);
  const [aciklama, setAciklama] = useState(defaultValues?.aciklama ?? "");
  const [metaTitle, setMetaTitle] = useState(defaultValues?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    defaultValues?.meta_description ?? ""
  );
  const [gallery, setGallery] = useState<string[]>(
    defaultValues?.dukkan_fotograflari ?? []
  );
  const [urunler, setUrunler] = useState<UrunFormItem[]>(
    normalizeUrunItems(defaultUrunler)
  );
  const [iletisimFaqItems, setIletisimFaqItems] = useState<FaqItem[]>(
    normalizeFaqItems(defaultValues?.sss ?? null)
  );
  const [hakkimizdaFaqItems, setHakkimizdaFaqItems] = useState<FaqItem[]>(
    normalizeFaqItems(defaultValues?.hakkimizda_sss ?? null)
  );
  const [anasayfaFaqItems, setAnasayfaFaqItems] = useState<FaqItem[]>(
    normalizeFaqItems(defaultValues?.anasayfa_sss ?? null)
  );
  const [iletisimSssGoster, setIletisimSssGoster] = useState(
    defaultValues?.iletisim_sss_goster ?? true
  );
  const [teknikServisAktif, setTeknikServisAktif] = useState(
    defaultValues?.teknik_servis_aktif ?? false
  );
  const [teknikServisPhotos, setTeknikServisPhotos] = useState({
    teknik_servis_fotograf_1: defaultValues?.teknik_servis_fotograf_1 ?? "",
    teknik_servis_fotograf_2: defaultValues?.teknik_servis_fotograf_2 ?? "",
    teknik_servis_fotograf_3: defaultValues?.teknik_servis_fotograf_3 ?? "",
  });
  const [teknikServisAciklama, setTeknikServisAciklama] = useState(
    defaultValues?.teknik_servis_aciklama ?? ""
  );
  const [servisFaqItems, setServisFaqItems] = useState<FaqItem[]>(
    normalizeFaqItems(defaultValues?.teknik_servis_sss ?? null)
  );
  const [markaTermsAccepted, setMarkaTermsAccepted] = useState(
    Boolean(defaultValues?.terms_accepted_at)
  );

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(dukkanAdi));
    }
  }, [dukkanAdi, slugTouched]);

  const slugValidationError = useMemo(() => {
    if (!slug.trim()) return null;
    return validateSlug(slug);
  }, [slug]);

  const dukkanAdiValidationError = useMemo(() => {
    if (!dukkanAdi.trim()) return null;
    return validateDukkanAdi(dukkanAdi);
  }, [dukkanAdi]);

  const faqPlaceholderSource = useMemo<FaqPlaceholderSource>(
    () => ({
      dukkan_adi: dukkanAdi,
      adres,
      calisma_saatleri: serializeCalismaSaatleri(calismaSaatleri),
      telefon,
      whatsapp,
    }),
    [dukkanAdi, adres, calismaSaatleri, telefon, whatsapp]
  );

  const hasBlockingValidationError = Boolean(
    slugValidationError || dukkanAdiValidationError || !markaTermsAccepted
  );

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const shopNameError = validateDukkanAdi(dukkanAdi);
    const slugError = validateSlug(slug);
    if (shopNameError || slugError || !markaTermsAccepted) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    const raw = defaultValues?.calisma_saatleri ?? null;
    setCalismaSaatleri(coerceCalismaSaatleriState(raw));
    setHasLegacyCalismaSaatleri(isLegacyCalismaSaatleri(raw));
  }, [defaultValues?.calisma_saatleri]);

  const isStacked = layout === "wide";
  const sectionVariant = isStacked ? "admin" : "card";
  const fieldStackClass = "space-y-5";

  const healthInput = useMemo(
    () => ({
      logo_url: logoUrl,
      banner_url: bannerUrl,
      aciklama,
      instagram_url: instagramUrl,
      tiktok_url: tiktokUrl,
      facebook_url: facebookUrl,
      telefon,
      whatsapp,
      adres,
      enlem,
      boylam,
      dukkan_fotograflari: gallery,
      anasayfa_sss: anasayfaFaqItems,
      iletisim_sss: iletisimFaqItems,
      hakkimizda_sss: hakkimizdaFaqItems,
      teknik_servis_sss: servisFaqItems,
    }),
    [
      logoUrl,
      bannerUrl,
      aciklama,
      instagramUrl,
      tiktokUrl,
      facebookUrl,
      telefon,
      whatsapp,
      adres,
      enlem,
      boylam,
      gallery,
      anasayfaFaqItems,
      iletisimFaqItems,
      hakkimizdaFaqItems,
      servisFaqItems,
    ]
  );

  const temelBilgiler = (
    <FormSection
      variant={sectionVariant}
      title="Temel Bilgiler"
      description="Mağaza adınız vitrinde en üstte görünür."
    >
      <div className={fieldStackClass}>
        <Field label="Mağaza Adı" hint="Müşterilerin göreceği işletme adı">
          <Input
            name="dukkan_adi"
            required
            placeholder="Örn: Beep Mobile"
            value={dukkanAdi}
            onChange={(e) => setDukkanAdi(e.target.value)}
            aria-invalid={dukkanAdiValidationError ? true : undefined}
            className="w-full"
          />
          {dukkanAdiValidationError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {dukkanAdiValidationError}
            </p>
          )}
        </Field>

        <Field
          label="Vitrin Adresi (Slug)"
          hint="Mağaza adından otomatik oluşur. Tescilli marka ve sistem kelimeleri kullanılamaz."
        >
          <Input
            name="slug"
            required
            placeholder="beep-mobile"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(sanitizeSlugInput(e.target.value));
            }}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            aria-invalid={slugValidationError ? true : undefined}
            className="w-full font-mono text-sm"
          />
          {slugValidationError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {slugValidationError}
            </p>
          )}
        </Field>
      </div>
    </FormSection>
  );

  const seoAyarlari = (
    <FormSection
      variant={sectionVariant}
      title="SEO Ayarları"
      description="Google arama sonuçlarında görünen başlık ve açıklama. Boş bırakılırsa mağaza adı ve tanıtım metni kullanılır."
    >
      <div className={fieldStackClass}>
        <Field
          label="Meta Başlık"
          hint="Arama sonuçlarında görünen sayfa başlığı (önerilen: 50–60 karakter)"
        >
          <Input
            name="meta_title"
            placeholder={dukkanAdi ? `${dukkanAdi} | EsnafPRO` : "Mağaza Adı | EsnafPRO"}
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            maxLength={120}
            className="w-full"
          />
        </Field>

        <Field
          label="Meta Açıklama"
          hint="Arama sonuçlarında başlığın altında görünen kısa açıklama (önerilen: 120–160 karakter)"
        >
          <Textarea
            name="meta_description"
            rows={3}
            placeholder={
              aciklama.trim() ||
              "Mağazanızı ve hizmetlerinizi kısaca tanıtan, arama motorları için optimize edilmiş bir metin yazın."
            }
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={320}
            className="w-full resize-y"
          />
        </Field>
      </div>
    </FormSection>
  );

  const markaGorselleri = (
    <FormSection
      variant={sectionVariant}
      title="Marka Görselleri"
      description="Logo ve kapak fotoğrafı vitrininizin vitrin camı gibidir."
    >
      {showVitrinLogoHint && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
          <span
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm text-emerald-600 ring-1 ring-emerald-100"
            aria-hidden
          >
            i
          </span>
          <p className="text-sm leading-relaxed text-emerald-900/90">
            Vitrinimizde yer almak için lütfen işletme logonuzu ekleyin.
          </p>
        </div>
      )}
      <div className={fieldStackClass}>
        <ImageUploadBox
          label="Logo"
          hint="Profil görünümü — vitrinde logo alanında görünür"
          name="logo_url"
          value={logoUrl}
          onChange={setLogoUrl}
          storeSlug={slug}
          subfolder="logo"
          variant="logo"
        />

        <ImageUploadBox
          label="Kapak Fotoğrafı"
          hint="Yatay kapak — vitrinin en üstünde tam genişlik banner"
          name="banner_url"
          value={bannerUrl}
          onChange={setBannerUrl}
          storeSlug={slug}
          subfolder="banner"
          variant="banner"
        />
      </div>
    </FormSection>
  );

  const hakkimizdaSection = isStacked ? (
    <FormSection
      variant={sectionVariant}
      title="Hakkımızda"
      description="Hikaye metni ve 4 adet mağaza görseli Hakkımızda sayfasında görünür."
    >
      <div className={fieldStackClass}>
        <Field label="Hikaye / Tanıtım Metni" hint="/{slug}/hakkimizda sayfasında görünür">
          <Textarea
            name="aciklama"
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Mağazanızın hikayesini, değerlerinizi ve çalışma tarzınızı anlatın"
            rows={6}
            className="w-full"
          />
        </Field>
        <GalleryUpload values={gallery} onChange={setGallery} storeSlug={slug} hideHeader />
      </div>
    </FormSection>
  ) : (
    <div className={premiumPanelClassName}>
      <GalleryUpload values={gallery} onChange={setGallery} storeSlug={slug} />
    </div>
  );

  const iletisimSosyal = (
    <FormSection
      variant={sectionVariant}
      title="İletişim & Sosyal Medya"
      description="Müşteriler bu bilgilerle size tek tıkla ulaşır."
    >
      <div className={fieldStackClass}>
        <Field label="Telefon" hint="Görüntülenecek sabit hat veya cep">
          <Input
            name="telefon"
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="w-full"
          />
        </Field>

        <Field
          label="WhatsApp Numarası"
          hint="905XXXXXXXXX — tek tıkla mesaj için"
        >
          <Input
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="905551234567"
            className="w-full"
          />
        </Field>

        <Field
          label="Çalışma Saatleri"
          hint="Her gün için açık/kapalı durumu ve saat aralığını seçin"
        >
          {hasLegacyCalismaSaatleri && (
            <p className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Eski serbest metin formatı algılandı. Haftalık programı düzenleyip
              kaydettiğinizde vitrinde yeni açık/kapalı takvimi görünür.
            </p>
          )}
          <CalismaSaatleriEditor
            value={calismaSaatleri}
            onChange={(schedule) => {
              setCalismaSaatleri(schedule);
              setHasLegacyCalismaSaatleri(false);
            }}
          />
          <CalismaSaatleriHiddenInput value={calismaSaatleri} />
        </Field>

        <Field label="Instagram" hint="Profil linki veya kullanıcı adı">
          <Input
            name="instagram_url"
            type="text"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="instagram.com/magaziniz"
            className="w-full"
          />
        </Field>

        <Field label="TikTok" hint="Profil linki veya kullanıcı adı">
          <Input
            name="tiktok_url"
            type="text"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="tiktok.com/@magaziniz"
            className="w-full"
          />
        </Field>

        <Field label="Facebook" hint="Sayfa linki veya kullanıcı adı">
          <Input
            name="facebook_url"
            type="text"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="facebook.com/magaziniz"
            className="w-full"
          />
        </Field>
      </div>
    </FormSection>
  );

  const konumTanitim = (
    <FormSection
      variant={sectionVariant}
      title="Konum"
      description="Adres metni ve harita pini İletişim sayfasında birlikte görünür."
    >
      <div className={fieldStackClass}>
        <Field label="Adres" hint="İletişim sayfasında harita ile birlikte görünür">
          <Textarea
            name="adres"
            value={adres}
            onChange={(e) => setAdres(e.target.value)}
            placeholder="Mahalle, ilçe, il"
            rows={3}
            className="w-full"
          />
        </Field>

        <Field
          label="Harita Konumu"
          hint="Haritaya tıklayarak veya pini sürükleyerek mağaza pinini belirleyin"
        >
          <LocationMapPicker
            enlem={enlem}
            boylam={boylam}
            onChange={(coords) => {
              setEnlem(coords?.enlem ?? null);
              setBoylam(coords?.boylam ?? null);
            }}
          />
        </Field>

        <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 px-4 py-4 shadow-sm sm:px-5 sm:py-4">
          <span
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-emerald-600 ring-1 ring-emerald-100"
            aria-hidden
          >
            i
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-800">
              📍 Pazaryeri ve Mesafe Özelliği İçin Önemli
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/85">
              Lütfen adresinizi girdikten sonra harita üzerinden dükkanınızın tam
              konumunu pinleyin. Bu sayede ana pazaryerinde müşteriler size olan
              mesafelerini (örn: 850 m) net bir şekilde görebilecek ve size daha
              kolay ulaşabilecektir.
            </p>
          </div>
        </div>

        <input type="hidden" name="enlem" value={enlem ?? ""} />
        <input type="hidden" name="boylam" value={boylam ?? ""} />
      </div>
    </FormSection>
  );

  const hakkimizdaSss = isStacked ? (
    <FormSection
      variant={sectionVariant}
      title="Hakkımızda SSS"
      description="Hakkımızda sayfasında görünen işletme ve hizmet kalitesi odaklı sorular."
    >
      <FaqEditor
        items={hakkimizdaFaqItems}
        onChange={setHakkimizdaFaqItems}
        fieldPrefix="hakkimizda_faq"
        pageContext="hakkimizda"
        placeholderSource={faqPlaceholderSource}
        title="Hakkımızda SSS"
        description="Mağaza hikayesi, hizmet kalitesi ve güven odaklı sorular ekleyin."
      />
    </FormSection>
  ) : (
    <div className={premiumPanelClassName}>
      <FaqEditor
        items={hakkimizdaFaqItems}
        onChange={setHakkimizdaFaqItems}
        fieldPrefix="hakkimizda_faq"
        pageContext="hakkimizda"
        placeholderSource={faqPlaceholderSource}
        title="Hakkımızda SSS"
      />
    </div>
  );

  const anasayfaSss = isStacked ? (
    <FormSection
      variant={sectionVariant}
      title="Ana Sayfa SSS"
      description="Ana vitrin sayfasının altında görünen genel soru-cevap alanı."
    >
      <FaqEditor
        items={anasayfaFaqItems}
        onChange={setAnasayfaFaqItems}
        fieldPrefix="anasayfa_faq"
        pageContext="anasayfa"
        placeholderSource={faqPlaceholderSource}
        title="Ana Sayfa SSS"
        description="Ürünler, hizmetler ve mağazanızla ilgili genel sorular ekleyin."
      />
    </FormSection>
  ) : (
    <div className={premiumPanelClassName}>
      <FaqEditor
        items={anasayfaFaqItems}
        onChange={setAnasayfaFaqItems}
        fieldPrefix="anasayfa_faq"
        pageContext="anasayfa"
        placeholderSource={faqPlaceholderSource}
        title="Ana Sayfa SSS"
      />
    </div>
  );

  const iletisimSss = isStacked ? (
    <FormSection
      variant={sectionVariant}
      title="İletişim SSS"
      description="İletişim sayfasında görünen konum, ulaşım ve iletişim odaklı sorular."
    >
      <FaqEditor
        items={iletisimFaqItems}
        onChange={setIletisimFaqItems}
        fieldPrefix="iletisim_faq"
        pageContext="iletisim"
        placeholderSource={faqPlaceholderSource}
        title="İletişim SSS"
        description="Adres, çalışma saatleri, ulaşım ve iletişim kanallarına dair sorular ekleyin."
      />
    </FormSection>
  ) : (
    <div className={premiumPanelClassName}>
      <FaqEditor
        items={iletisimFaqItems}
        onChange={setIletisimFaqItems}
        fieldPrefix="iletisim_faq"
        pageContext="iletisim"
        placeholderSource={faqPlaceholderSource}
        title="İletişim SSS"
      />
    </div>
  );

  const vitrinGorunurluk = (
    <FormSection
      variant={sectionVariant}
      title="Vitrin Görünürlüğü"
      description="İletişim sayfasında adres, çalışma saatleri, harita ve SSS alanlarının vitrinde görünüp görünmeyeceğini belirleyin."
    >
      <input
        type="hidden"
        name="iletisim_sss_goster"
        value={iletisimSssGoster ? "true" : "false"}
      />
      <button
        type="button"
        role="switch"
        aria-checked={iletisimSssGoster}
        onClick={() => setIletisimSssGoster((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 text-left transition hover:border-emerald-200 lg:px-6 lg:py-5"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-900 lg:text-base">
            İletişim & SSS panelini vitrinde göster
          </span>
          <span className="mt-1 block text-xs text-slate-500 lg:text-sm">
            Kapalıyken üst menüdeki İletişim linki gizlenir.
          </span>
        </span>
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
            iletisimSssGoster ? "bg-emerald-600" : "bg-slate-300"
          }`}
          aria-hidden
        >
          <span
            className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
              iletisimSssGoster ? "left-[22px]" : "left-0.5"
            }`}
          />
        </span>
      </button>
    </FormSection>
  );

  const urunHizmetler = (
    <FormSection
      variant={sectionVariant}
      title="Ürün & Hizmetler"
      description="Vitrinde sergilenecek ürün ve hizmet fotoğrafları."
      className="!space-y-0"
    >
      <div className="pt-2">
        <ProductPhotoEditor items={urunler} onChange={setUrunler} storeSlug={slug} />
      </div>
    </FormSection>
  );

  const teknikServis = (
    <FormSection
      variant={sectionVariant}
      title="Teknik Servis Ayarları"
      description="Teknik servis sayfası, galeri ve servise özel SSS içeriği."
      className="!space-y-0"
    >
      <div className="pt-2">
        <TeknikServisEditor
          storeSlug={slug}
          aktif={teknikServisAktif}
          onAktifChange={setTeknikServisAktif}
          photos={teknikServisPhotos}
          onPhotoChange={(key, url) =>
            setTeknikServisPhotos((prev) => ({ ...prev, [key]: url }))
          }
          aciklama={teknikServisAciklama}
          onAciklamaChange={setTeknikServisAciklama}
          faqItems={servisFaqItems}
          onFaqChange={setServisFaqItems}
          placeholderSource={faqPlaceholderSource}
        />
      </div>
    </FormSection>
  );

  const stackedSections = (
    <>
      {temelBilgiler}
      {showSeoFields && seoAyarlari}
      {markaGorselleri}
      {hakkimizdaSection}
      {hakkimizdaSss}
      {iletisimSosyal}
      {konumTanitim}
      {iletisimSss}
      {vitrinGorunurluk}
      {urunHizmetler}
      {anasayfaSss}
      {teknikServis}
    </>
  );

  const defaultSections = (
    <>
      {temelBilgiler}
      {showSeoFields && seoAyarlari}
      {markaGorselleri}
      {hakkimizdaSection}
      {hakkimizdaSss}
      {iletisimSosyal}
      {konumTanitim}
      {iletisimSss}
      {vitrinGorunurluk}
      {urunHizmetler}
      {anasayfaSss}
      {teknikServis}
    </>
  );

  return (
    <>
      {isStacked && (
        <>
          <div className="mb-6 lg:hidden">
            <ProfileHealthScore input={healthInput} />
          </div>
          <div className="pointer-events-none fixed right-4 top-24 z-30 hidden w-[min(100%,22rem)] lg:block xl:right-8 xl:top-28">
            <div className="pointer-events-auto">
              <ProfileHealthScore input={healthInput} />
            </div>
          </div>
        </>
      )}

      <form
        action={action}
        onSubmit={handleFormSubmit}
        className={cn(isStacked && "mx-auto w-full max-w-5xl", "space-y-8")}
      >
      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

      {isStacked ? stackedSections : defaultSections}

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {warning && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {warning}
        </p>
      )}

      <FormSection
        title="Marka ve Telif Hakları Onay Sözleşmesi"
        variant={sectionVariant}
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
          <input
            type="checkbox"
            name={MARKA_TERMS_FIELD_NAME}
            value="true"
            required
            checked={markaTermsAccepted}
            onChange={(event) => setMarkaTermsAccepted(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm leading-relaxed text-slate-600">
            {MARKA_TERMS_LABEL}
          </span>
        </label>
      </FormSection>

      <Button
        type="submit"
        disabled={isPending || hasBlockingValidationError}
        className="min-h-12 w-full sm:w-auto"
      >
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
    </>
  );
}

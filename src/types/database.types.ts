export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FaqItem = {
  soru: string;
  cevap: string;
};

export type ServiceDeviceStatus = "tamirde" | "hazir" | "teslim_edildi";

export interface Database {
  public: {
    Tables: {
      dukkanlar: {
        Row: {
          id: string;
          user_id: string;
          dukkan_adi: string;
          slug: string;
          telefon: string | null;
          adres: string | null;
          aciklama: string | null;
          meta_title: string | null;
          meta_description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          dukkan_fotograflari: string[] | null;
          whatsapp: string | null;
          calisma_saatleri: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          facebook_url: string | null;
          enlem: number | null;
          boylam: number | null;
          sss: FaqItem[] | null;
          iletisim_sss_goster: boolean;
          teknik_servis_aktif: boolean;
          katalog_modu_aktif: boolean;
          teknik_servis_fotograf_1: string | null;
          teknik_servis_fotograf_2: string | null;
          teknik_servis_fotograf_3: string | null;
          teknik_servis_aciklama: string | null;
          teknik_servis_sss: FaqItem[] | null;
          hakkimizda_sss: FaqItem[] | null;
          anasayfa_sss: FaqItem[] | null;
          terms_accepted_at: string | null;
          aktif: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dukkan_adi: string;
          slug: string;
          telefon?: string | null;
          adres?: string | null;
          aciklama?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          dukkan_fotograflari?: string[] | null;
          whatsapp?: string | null;
          calisma_saatleri?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          facebook_url?: string | null;
          enlem?: number | null;
          boylam?: number | null;
          sss?: FaqItem[] | null;
          iletisim_sss_goster?: boolean;
          teknik_servis_aktif?: boolean;
          katalog_modu_aktif?: boolean;
          teknik_servis_fotograf_1?: string | null;
          teknik_servis_fotograf_2?: string | null;
          teknik_servis_fotograf_3?: string | null;
          teknik_servis_aciklama?: string | null;
          teknik_servis_sss?: FaqItem[] | null;
          hakkimizda_sss?: FaqItem[] | null;
          anasayfa_sss?: FaqItem[] | null;
          terms_accepted_at?: string | null;
          aktif?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dukkan_adi?: string;
          slug?: string;
          telefon?: string | null;
          adres?: string | null;
          aciklama?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          dukkan_fotograflari?: string[] | null;
          whatsapp?: string | null;
          calisma_saatleri?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          facebook_url?: string | null;
          enlem?: number | null;
          boylam?: number | null;
          sss?: FaqItem[] | null;
          iletisim_sss_goster?: boolean;
          teknik_servis_aktif?: boolean;
          katalog_modu_aktif?: boolean;
          teknik_servis_fotograf_1?: string | null;
          teknik_servis_fotograf_2?: string | null;
          teknik_servis_fotograf_3?: string | null;
          teknik_servis_aciklama?: string | null;
          teknik_servis_sss?: FaqItem[] | null;
          hakkimizda_sss?: FaqItem[] | null;
          anasayfa_sss?: FaqItem[] | null;
          terms_accepted_at?: string | null;
          aktif?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      toptancilar: {
        Row: {
          id: string;
          user_id: string;
          firma_adi: string;
          slug: string;
          unvan: string | null;
          adres: string | null;
          telefon: string | null;
          aktif: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          firma_adi: string;
          slug: string;
          unvan?: string | null;
          adres?: string | null;
          telefon?: string | null;
          aktif?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          firma_adi?: string;
          slug?: string;
          unvan?: string | null;
          adres?: string | null;
          telefon?: string | null;
          aktif?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      dukkan_urunleri: {
        Row: {
          id: string;
          dukkan_id: string;
          urun_adi: string;
          urun_aciklama: string | null;
          fotograf_url: string | null;
          fotograf_url_2: string | null;
          fotograf_url_3: string | null;
          gorsel_orani: string;
          sira: number;
          aktif: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          dukkan_id: string;
          urun_adi: string;
          urun_aciklama?: string | null;
          fotograf_url?: string | null;
          fotograf_url_2?: string | null;
          fotograf_url_3?: string | null;
          gorsel_orani?: string;
          sira?: number;
          aktif?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          dukkan_id?: string;
          urun_adi?: string;
          urun_aciklama?: string | null;
          fotograf_url?: string | null;
          fotograf_url_2?: string | null;
          fotograf_url_3?: string | null;
          gorsel_orani?: string;
          sira?: number;
          aktif?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      dukkan_blog_yazilari: {
        Row: {
          id: string;
          dukkan_id: string;
          baslik: string;
          slug: string;
          icerik: string | null;
          kapak_url: string | null;
          yayinda: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dukkan_id: string;
          baslik: string;
          slug: string;
          icerik?: string | null;
          kapak_url?: string | null;
          yayinda?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dukkan_id?: string;
          baslik?: string;
          slug?: string;
          icerik?: string | null;
          kapak_url?: string | null;
          yayinda?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          soru: string;
          cevap: string;
          sort_order: number;
          is_active: boolean;
          context: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          soru: string;
          cevap: string;
          sort_order?: number;
          is_active?: boolean;
          context?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          soru?: string;
          cevap?: string;
          sort_order?: number;
          is_active?: boolean;
          context?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      katalogweb: {
        Row: {
          id: string;
          user_id: string | null;
          brand: string | null;
          model_name: string | null;
          product_name: string | null;
          price: number | null;
          image_url: string | null;
          is_sold: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          brand?: string | null;
          model_name?: string | null;
          product_name?: string | null;
          price?: number | null;
          image_url?: string | null;
          is_sold?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          brand?: string | null;
          model_name?: string | null;
          product_name?: string | null;
          price?: number | null;
          image_url?: string | null;
          is_sold?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      phone_models: {
        Row: {
          id: string;
          brand: string;
          model_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand: string;
          model_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand?: string;
          model_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tablet_models: {
        Row: {
          id: string;
          brand: string;
          model_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand: string;
          model_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand?: string;
          model_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      kullanici_profilleri: {
        Row: {
          id: string;
          role: "esnaf" | "toptanci";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: "esnaf" | "toptanci";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "esnaf" | "toptanci";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_plans: {
        Row: {
          id: string;
          segment: string;
          plan_key: string;
          name: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number;
          currency: string;
          features: Json;
          is_popular: boolean;
          is_active: boolean;
          sort_order: number;
          cta_label: string | null;
          cta_href: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          segment: string;
          plan_key: string;
          name: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          currency?: string;
          features?: Json;
          is_popular?: boolean;
          is_active?: boolean;
          sort_order?: number;
          cta_label?: string | null;
          cta_href?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          segment?: string;
          plan_key?: string;
          name?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          currency?: string;
          features?: Json;
          is_popular?: boolean;
          is_active?: boolean;
          sort_order?: number;
          cta_label?: string | null;
          cta_href?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_devices: {
        Row: {
          id: string;
          store_id: string;
          device_code: string;
          customer_name: string;
          device_model: string;
          issue_description: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          device_code: string;
          customer_name: string;
          device_model: string;
          issue_description?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          device_code?: string;
          customer_name?: string;
          device_model?: string;
          issue_description?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          name: string;
          tagline: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          faqs: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          name: string;
          tagline?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          faqs?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          slug?: string;
          name?: string;
          tagline?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          faqs?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      wholesaler_xmls: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          xml_url: string;
          is_active: boolean;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          xml_url: string;
          is_active?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          xml_url?: string;
          is_active?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      toptanci_products: {
        Row: {
          id: string;
          toptanci_id: string;
          name: string;
          description: string | null;
          price: number;
          stock_quantity: number;
          image_url: string | null;
          image_urls: string[] | null;
          category: string | null;
          category_path: string | null;
          sub_category: string | null;
          brand: string | null;
          brand_name: string | null;
          variant_detail: string | null;
          barcode: string | null;
          color_name: string | null;
          stock_status: boolean | null;
          currency: string | null;
          currency_code: string | null;
          external_id: string | null;
          group_id: string | null;
          suggested_retail_price: number | null;
          min_order_quantity: number | null;
          availability_status: string | null;
          is_doping: boolean | null;
          status: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          toptanci_id: string;
          name: string;
          description?: string | null;
          price: number;
          stock_quantity?: number;
          image_url?: string | null;
          image_urls?: string[] | null;
          category?: string | null;
          category_path?: string | null;
          sub_category?: string | null;
          brand?: string | null;
          brand_name?: string | null;
          variant_detail?: string | null;
          barcode?: string | null;
          color_name?: string | null;
          stock_status?: boolean | null;
          currency?: string | null;
          currency_code?: string | null;
          external_id?: string | null;
          group_id?: string | null;
          suggested_retail_price?: number | null;
          min_order_quantity?: number | null;
          availability_status?: string | null;
          is_doping?: boolean | null;
          status?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          toptanci_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock_quantity?: number;
          image_url?: string | null;
          image_urls?: string[] | null;
          category?: string | null;
          category_path?: string | null;
          sub_category?: string | null;
          brand?: string | null;
          brand_name?: string | null;
          variant_detail?: string | null;
          barcode?: string | null;
          color_name?: string | null;
          stock_status?: boolean | null;
          currency?: string | null;
          currency_code?: string | null;
          external_id?: string | null;
          group_id?: string | null;
          suggested_retail_price?: number | null;
          min_order_quantity?: number | null;
          availability_status?: string | null;
          is_doping?: boolean | null;
          status?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          xml_url: string | null;
          feed_mapping: Json | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          xml_url?: string | null;
          feed_mapping?: Json | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          xml_url?: string | null;
          feed_mapping?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      second_hand_devices_public: {
        Row: {
          battery_cycle_count: string | null;
          battery_health: string | null;
          brand: string | null;
          capacity: string | null;
          case_material: string | null;
          casing_type: string | null;
          changed_parts: string | null;
          color: string | null;
          condition: string | null;
          created_at: string | null;
          device_category: string | null;
          drive_type: string | null;
          gpu: string | null;
          has_box: boolean | null;
          has_invoice: boolean | null;
          has_sapphire_glass: boolean | null;
          has_warranty: boolean | null;
          hdd: string | null;
          id: string | null;
          image_urls: string[] | null;
          model: string | null;
          non_working_features: string | null;
          notes: string | null;
          operating_system: string | null;
          processor: string | null;
          ram: string | null;
          resolution: string | null;
          sale_price: number | null;
          screen_size: string | null;
          sim_support: boolean | null;
          ssd: string | null;
          user_id: string | null;
          warranty_type: string | null;
          web_description: string | null;
          web_published: boolean | null;
          web_published_at: string | null;
          web_slug: string | null;
          web_title: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_service_device_public: {
        Args: {
          p_device_code: string;
        };
        Returns: {
          id: string;
          store_id: string;
          device_code: string;
          device_model: string;
          issue_description: string | null;
          status: string;
          created_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Dukkan = Database["public"]["Tables"]["dukkanlar"]["Row"];
export type Toptanci = Database["public"]["Tables"]["toptancilar"]["Row"];
export type DukkanInsert = Database["public"]["Tables"]["dukkanlar"]["Insert"];
export type DukkanUpdate = Database["public"]["Tables"]["dukkanlar"]["Update"];
export type DukkanUrunu = Database["public"]["Tables"]["dukkan_urunleri"]["Row"];
export type KullaniciProfili =
  Database["public"]["Tables"]["kullanici_profilleri"]["Row"];
export type DukkanBlogYazisi =
  Database["public"]["Tables"]["dukkan_blog_yazilari"]["Row"];
export type ServiceDevice = Database["public"]["Tables"]["service_devices"]["Row"];
export type PublicServiceDevice =
  Database["public"]["Functions"]["get_service_device_public"]["Returns"][number];
export type WholesalerXml = Database["public"]["Tables"]["wholesaler_xmls"]["Row"];
export type ToptanciProduct = Database["public"]["Tables"]["toptanci_products"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type SecondHandDevicePublic =
  Database["public"]["Views"]["second_hand_devices_public"]["Row"];
export type KatalogWebItem = Database["public"]["Tables"]["katalogweb"]["Row"];
export type PhoneModel = Database["public"]["Tables"]["phone_models"]["Row"];
export type TabletModel = Database["public"]["Tables"]["tablet_models"]["Row"];

/** @deprecated Use Dukkan */
export type Store = Dukkan;

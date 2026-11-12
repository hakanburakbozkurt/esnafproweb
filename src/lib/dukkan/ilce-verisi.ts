/**
 * Adres serbest metin olarak girildiğinde ("asık veysel mahallesı esenyurt …")
 * il adı yazılmamış olabilir. Bu tablo, ilçe (ve çok bilinen semt) adından
 * il/ilçe çıkarmak için kullanılır; ürün, blog ve cihaz sayfalarında başlık,
 * açıklama ve JSON-LD konum sinyali (GEO) buradan beslenir.
 *
 * Yeni bir şehirde dükkan açıldığında o ilin ilçeleri buraya eklenebilir.
 */

export const IL_ILCELERI: Record<string, readonly string[]> = {
  İstanbul: [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
    "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
    "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
    "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
    "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
    "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla",
    "Ümraniye", "Üsküdar", "Zeytinburnu",
  ],
  Ankara: [
    "Akyurt", "Altındağ", "Ayaş", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk",
    "Elmadağ", "Etimesgut", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan",
    "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı",
    "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle",
  ],
  İzmir: [
    "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova",
    "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe",
    "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Menemen",
    "Narlıdere", "Ödemiş", "Seferihisar", "Torbalı", "Urla",
  ],
  Bursa: [
    "Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey",
    "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli",
    "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım",
  ],
  Diyarbakır: [
    "Bağlar", "Bismil", "Çermik", "Çüngüş", "Eğil", "Ergani", "Hazro",
    "Kayapınar", "Kocaköy", "Silvan", "Yenişehir",
  ],
};

/**
 * Halkın ilçe yerine kullandığı, tek ilçeye ait olduğu kesin semtler.
 * (Esenkent gibi birden fazla ilçede bulunan adlar bilerek eklenmez.)
 * Değer: [ilçe, il]
 */
export const SEMT_ILCE: Record<string, readonly [string, string]> = {
  Bahçeşehir: ["Başakşehir", "İstanbul"],
  Eyüp: ["Eyüpsultan", "İstanbul"],
  Halkalı: ["Küçükçekmece", "İstanbul"],
  Mecidiyeköy: ["Şişli", "İstanbul"],
  Kozyatağı: ["Kadıköy", "İstanbul"],
  Bostancı: ["Kadıköy", "İstanbul"],
  Ataköy: ["Bakırköy", "İstanbul"],
};

/** Türkçe karakterleri sadeleştirir: "Mahallesı Esenyurt" → "mahallesi esenyurt" */
export function sadeKonumMetni(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

/**
 * Hemen ardından bu kelimeler geliyorsa eşleşen ad bir ilçe değil, sokak/cadde
 * veya mahalle adıdır ("Fatih Mahallesi", "Bağlar Caddesi", "Kiraz Sokak").
 */
const YER_TURU_KELIMELERI = new Set([
  "sok", "sk", "sokak", "sokagi", "cad", "cd", "cadde", "caddesi", "bulvar",
  "bulvari", "blv", "bul", "mah", "mh", "mahalle", "mahallesi", "sitesi", "site",
  "apt", "apartmani", "plaza", "cami", "camii", "parki", "pasaji", "carsisi",
  "yolu", "meydani", "koyu",
]);

type IlceKaydi = { ilce: string; iller: string[] };

const ILCE_LOOKUP: Map<string, IlceKaydi> = (() => {
  const map = new Map<string, IlceKaydi>();
  for (const [il, ilceler] of Object.entries(IL_ILCELERI)) {
    for (const ilce of ilceler) {
      const key = sadeKonumMetni(ilce);
      const kayit = map.get(key);
      if (kayit) kayit.iller.push(il);
      else map.set(key, { ilce, iller: [il] });
    }
  }
  return map;
})();

/**
 * Birden fazla ilçede bulunan semt/mahalle adları. Yalnızca adresteki ilçe
 * bunlardan biriyle eşleşirse semt olarak kullanılır.
 */
export const COK_ILCELI_SEMTLER: Record<string, ReadonlyArray<readonly [string, string]>> = {
  Esenkent: [["Esenyurt", "İstanbul"], ["Ümraniye", "İstanbul"]],
};

const SEMT_LOOKUP = new Map(
  Object.entries(SEMT_ILCE).map(([semt, deger]) => [sadeKonumMetni(semt), deger])
);

function tokenize(adres: string): string[] {
  return sadeKonumMetni(adres)
    .split(/[^a-z0-9.]+/)
    .map((token) => token.replace(/^\.+|\.+$/g, ""))
    .filter(Boolean);
}

/**
 * Adres içinde geçen ilçe (ya da semt) adını bulur. İl verilirse yalnızca o
 * ilin ilçeleri kabul edilir. Birden fazla aday varsa adreste en sonda geçen
 * seçilir (Türk adreslerinde ilçe genelde sonda yazılır).
 */
export function ilceBulAdresten(
  adres: string,
  bilinenIl?: string | null
): { il: string; ilce: string } | null {
  const tokens = tokenize(adres);
  const ilKey = bilinenIl ? sadeKonumMetni(bilinenIl) : null;
  let sonuc: { il: string; ilce: string } | null = null;

  tokens.forEach((token, index) => {
    const sonraki = tokens[index + 1];
    if (sonraki && YER_TURU_KELIMELERI.has(sonraki)) return;

    const ilce = ILCE_LOOKUP.get(token);
    if (ilce) {
      const il = ilKey
        ? ilce.iller.find((aday) => sadeKonumMetni(aday) === ilKey)
        : ilce.iller.length === 1
          ? ilce.iller[0]
          : undefined;
      if (il) sonuc = { il, ilce: ilce.ilce };
      return;
    }

    const semt = SEMT_LOOKUP.get(token);
    if (semt && (!ilKey || sadeKonumMetni(semt[1]) === ilKey)) {
      sonuc = { il: semt[1], ilce: semt[0] };
    }
  });

  return sonuc;
}

/** İlin ilçe listesi elimizde varsa ve aday o listede yoksa false döner. */
export function ilceIlIcinGecerliMi(il: string, ilceAdayi: string): boolean | null {
  const liste = IL_ILCELERI[il];
  if (!liste) return null;
  const key = sadeKonumMetni(ilceAdayi.trim());
  return liste.some((ilce) => sadeKonumMetni(ilce) === key);
}

const SEMT_ADLARI = new Map(
  [...Object.keys(SEMT_ILCE), ...Object.keys(COK_ILCELI_SEMTLER)].map((ad) => [sadeKonumMetni(ad), ad])
);

/**
 * Adreste geçen bilinen semt adını döner ("Bahçeşehir 2.Kısım" → "Bahçeşehir").
 * Birden fazla ilçede olan semtler yalnızca verilen ilçeyle uyuşursa kabul edilir.
 */
export function semtBulAdresten(adres: string, ilce?: string | null): string | null {
  const ilceKey = ilce ? sadeKonumMetni(ilce) : null;
  let sonuc: string | null = null;
  for (const token of tokenize(adres)) {
    const ad = SEMT_ADLARI.get(token);
    if (!ad) continue;
    const tek = SEMT_ILCE[ad];
    if (tek) {
      if (!ilceKey || sadeKonumMetni(tek[0]) === ilceKey) sonuc = ad;
      continue;
    }
    const secenekler = COK_ILCELI_SEMTLER[ad] ?? [];
    if (ilceKey && secenekler.some(([aday]) => sadeKonumMetni(aday) === ilceKey)) sonuc = ad;
  }
  return sonuc;
}

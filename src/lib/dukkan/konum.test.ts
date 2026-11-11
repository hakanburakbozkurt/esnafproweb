import { describe, expect, it } from "vitest";
import { buildLocalAreaLabel, withLocalAreaSuffix } from "@/lib/dukkan/metadata";
import { cozKonum, kisaKonumEtiketi } from "@/lib/dukkan/konum";
import { urunSeoBasligi } from "@/lib/dukkan/urun-seo";

const beepAdres = "Reşneli Niyazi Sokak No:49 asık veysel mahallesı esenyurt";
const redikomAdres = "Süzer Bulvarı Kelebek Sokak\r\nŞehr-i Bazaar AVM\r\nBahçeşehir 2.Kısım Mahallesi\r\n 34488";

describe("semt", () => {
  it("ayarlardan girilen semt ilçeyle birlikte kullanılır", () => {
    const beep = { adres: beepAdres, semt: "Esenkent" };
    expect(cozKonum(beep)).toEqual({ il: "İstanbul", ilce: "Esenyurt", semt: "Esenkent" });
    expect(buildLocalAreaLabel(beep)).toBe("Esenkent, Esenyurt, İstanbul");
    expect(urunSeoBasligi({ urun_adi: "Hayalet Cam" }, { dukkan_adi: "Beep", ...beep })).toBe(
      "Hayalet Cam — Esenkent, Esenyurt"
    );
  });

  it("semt boşsa adresteki bilinen semt bulunur (Redikom → Bahçeşehir, Başakşehir)", () => {
    expect(kisaKonumEtiketi({ adres: redikomAdres, semt: null })).toBe("Bahçeşehir, Başakşehir");
    expect(kisaKonumEtiketi(redikomAdres)).toBe("Bahçeşehir, Başakşehir");
  });

  it("birden çok ilçede olan semt yalnızca ilçe uyuşursa alınır", () => {
    expect(cozKonum("Esenkent Mah. 12. Sok, Esenyurt").semt).toBe("Esenkent");
    expect(cozKonum("Esenkent Mah., Ümraniye / İstanbul").semt).toBe("Esenkent");
    expect(cozKonum("Esenkent Mah. No:3").semt).toBeNull();
  });

  it("semt ilçeyle aynıysa tekrar yazılmaz", () => {
    expect(kisaKonumEtiketi({ adres: beepAdres, semt: "esenyurt" })).toBe("Esenyurt");
  });

  it("blog başlığı Esenkent'i zaten içeriyorsa dokunulmaz, içermiyorsa konum eklenir", () => {
    const beep = { adres: beepAdres, semt: "Esenkent" };
    expect(withLocalAreaSuffix("Esenkent Telefon Tamiri Aynı Gün", beep)).toBe("Esenkent Telefon Tamiri Aynı Gün");
    expect(withLocalAreaSuffix("Apple Watch kordonları Esenkent'te", beep)).toBe("Apple Watch kordonları Esenkent'te");
    expect(withLocalAreaSuffix("iPhone ekran değişimi", beep)).toBe("iPhone ekran değişimi — Esenkent, Esenyurt, İstanbul");
  });
});

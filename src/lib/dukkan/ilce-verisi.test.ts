import { describe, expect, it } from "vitest";
import { parseLocationFromAdres } from "@/lib/dukkan/faq-placeholders";
import { buildLocalAreaLabel } from "@/lib/dukkan/metadata";

describe("parseLocationFromAdres — il yazılmamış adresler", () => {
  it("ilçe adı Türkçe karaktersiz yazılsa da bulunur (Beep örneği)", () => {
    const adres =
      "Reşneli Niyazi Sokak No:49 asık veysel mahallesı esenyurt \r\nsepet market yanı 1.kat carsıpazarkent avm";
    expect(parseLocationFromAdres(adres)).toEqual({ il: "İstanbul", ilce: "Esenyurt" });
    expect(buildLocalAreaLabel(adres)).toBe("Esenyurt, İstanbul");
  });

  it("bilinen semtten ilçe çıkarılır (Redikom örneği)", () => {
    const adres =
      "Süzer Bulvarı Kelebek Sokak\r\nŞehr-i Bazaar AVM G Blok No:15  K:1 \r\n\r\nBahçeşehir 2.Kısım Mahallesi\r\n 34488";
    expect(parseLocationFromAdres(adres)).toEqual({ il: "İstanbul", ilce: "Başakşehir" });
  });

  it("mahalle/cadde adı olarak geçen ilçe adı ilçe sayılmaz", () => {
    expect(parseLocationFromAdres("Fatih Mahallesi Kiraz Sok. No:3")).toEqual({ il: null, ilce: null });
    expect(parseLocationFromAdres("Fatih Mah. Atatürk Cad. No:3 Esenyurt")).toEqual({
      il: "İstanbul",
      ilce: "Esenyurt",
    });
  });

  it("iki ilde de bulunan ilçe adı tek başına il belirlemez", () => {
    expect(parseLocationFromAdres("Yenişehir merkez")).toEqual({ il: null, ilce: null });
    expect(parseLocationFromAdres("Yenişehir, Diyarbakır")).toEqual({ il: "Diyarbakır", ilce: "Yenişehir" });
  });
});

describe("parseLocationFromAdres — il yazılmış adresler", () => {
  it("klasik biçim aynen çalışır", () => {
    expect(parseLocationFromAdres("Esenkent Mah. Örnek Sok. No:1, Esenyurt, İstanbul")).toEqual({
      il: "İstanbul",
      ilce: "Esenyurt",
    });
    expect(parseLocationFromAdres("Ümraniye / İstanbul")).toEqual({ il: "İstanbul", ilce: "Ümraniye" });
  });

  it("ilçe yerine sokak yazılmışsa sokak ilçe diye alınmaz", () => {
    expect(parseLocationFromAdres("Atatürk Cad. No:5, İstanbul")).toEqual({ il: "İstanbul", ilce: null });
    expect(parseLocationFromAdres("Kadıköy Bahariye Cad. No:5, İstanbul")).toEqual({
      il: "İstanbul",
      ilce: "Kadıköy",
    });
  });

  it("ilçe listesi olmayan illerde mevcut davranış korunur", () => {
    expect(parseLocationFromAdres("Merkez, Kilis")).toEqual({ il: "Kilis", ilce: "Merkez" });
  });
});

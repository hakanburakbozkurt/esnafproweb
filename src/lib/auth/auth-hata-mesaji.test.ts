import { describe, expect, it } from "vitest";
import { authHataMesaji } from "./auth-hata-mesaji";

describe("authHataMesaji", () => {
  it("bilinen İngilizce hataları Türkçeye çevirir", () => {
    expect(authHataMesaji("Invalid login credentials")).toBe("E-posta veya şifre hatalı.");
    expect(authHataMesaji("User already registered")).toBe(
      "Bu e-posta adresiyle zaten bir hesap var."
    );
    expect(authHataMesaji("Password should be at least 6 characters.")).toBe(
      "Şifre en az 6 karakter olmalıdır."
    );
  });

  it("bilinmeyen hatada ham metni göstermez", () => {
    const sonuc = authHataMesaji("some internal supabase failure xyz");
    expect(sonuc).not.toMatch(/supabase|internal|xyz/i);
    expect(sonuc).toBe("Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
  });

  it("boş hatada genel mesaj döner", () => {
    expect(authHataMesaji(null)).toBe("Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
  });
});

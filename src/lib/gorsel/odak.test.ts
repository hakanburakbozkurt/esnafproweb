import { describe, expect, it } from "vitest";
import {
  gorselAdresi,
  gorselOdagi,
  odakKonumu,
  odakliGorselAdresi,
} from "@/lib/gorsel/odak";
import {
  getSecondHandDeviceGorselleri,
  getSecondHandDeviceImage,
} from "@/lib/dukkan/second-hand-devices";

const URL_ = "https://x.supabase.co/storage/v1/object/public/second-hand-devices/u/1.jpg";

describe("görsel odak noktası", () => {
  it("odak yoksa ortası", () => {
    expect(gorselOdagi(URL_)).toEqual({ x: 50, y: 50 });
    expect(odakKonumu(URL_)).toBe("50% 50%");
  });

  it("odak eklenir, okunur ve temizlenir", () => {
    const odakli = odakliGorselAdresi(URL_, { x: 40, y: 22 });
    expect(odakli).toBe(`${URL_}#odak=40,22`);
    expect(gorselOdagi(odakli)).toEqual({ x: 40, y: 22 });
    expect(gorselAdresi(odakli)).toBe(URL_);
  });

  it("tam ortaya alınınca işaret kalkar, sınır dışı değerler kırpılır", () => {
    expect(odakliGorselAdresi(`${URL_}#odak=10,10`, { x: 50, y: 50 })).toBe(URL_);
    expect(odakliGorselAdresi(URL_, { x: -5, y: 140 })).toBe(`${URL_}#odak=0,100`);
  });

  it("dışarı verilen ilan görseli temiz, kart görseli odaklı", () => {
    const device = { image_urls: [`${URL_}#odak=30,70`, ""] };
    expect(getSecondHandDeviceImage(device)).toBe(URL_);
    expect(getSecondHandDeviceGorselleri(device)).toEqual([{ src: URL_, konum: "30% 70%" }]);
  });
});

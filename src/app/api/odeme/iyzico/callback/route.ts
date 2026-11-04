import { NextResponse, type NextRequest } from "next/server";
import { iyzicoCallbackIsle, type CallbackSonucu } from "@/lib/abonelik/odeme-tamamla";
import { logDukkanAction } from "@/lib/dukkan/logger";

function sonucaYonlendir(request: NextRequest, sonuc: CallbackSonucu) {
  const url = new URL("/yonetim/abonelik", request.nextUrl.origin);
  url.searchParams.set("odeme", sonuc);
  // 303: tarayıcı POST'tan sonra sayfayı GET ile açar
  return NextResponse.redirect(url, 303);
}

/** İyzico ödeme sayfası, sonucu bu adrese form POST'u (token) ile bildirir. */
export async function POST(request: NextRequest) {
  let token = "";
  try {
    const form = await request.formData();
    token = String(form.get("token") ?? "").trim();
  } catch (err) {
    logDukkanAction("iyzicoCallback", "invalid callback body", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  if (!token || token.length > 200) {
    return sonucaYonlendir(request, "basarisiz");
  }

  try {
    return sonucaYonlendir(request, await iyzicoCallbackIsle(token));
  } catch (err) {
    logDukkanAction("iyzicoCallback", "callback processing crashed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return sonucaYonlendir(request, "inceleme");
  }
}

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/yonetim/abonelik", request.nextUrl.origin), 303);
}

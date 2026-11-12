/**
 * Supabase kimlik doğrulama hatalarını kullanıcıya Türkçe gösterir.
 * Bilinmeyen hatalar ham İngilizce metin yerine genel bir mesajla döner.
 */
const BILINEN_HATALAR: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "E-posta veya şifre hatalı."],
  [/email not confirmed/i, "E-posta adresinizi doğrulamanız gerekiyor. Gelen kutunuzu kontrol edin."],
  [/user already registered|already been registered/i, "Bu e-posta adresiyle zaten bir hesap var."],
  [/password should be at least/i, "Şifre en az 6 karakter olmalıdır."],
  [/email rate limit exceeded|too many requests/i, "Çok fazla deneme yapıldı. Biraz bekleyip tekrar deneyin."],
  [/for security purposes, you can only request this after/i, "Güvenlik nedeniyle kısa bir süre bekleyip tekrar deneyin."],
  [/unable to validate email address|invalid format|is invalid/i, "Geçerli bir e-posta adresi girin."],
  [/signup requires a valid password/i, "Geçerli bir şifre girin."],
  [/new password should be different/i, "Yeni şifre eski şifrenizden farklı olmalıdır."],
  [/token has expired|invalid token|otp_expired/i, "Bağlantının süresi dolmuş. Lütfen yeniden deneyin."],
  [/network|fetch failed/i, "Bağlantı sorunu oluştu. İnternetinizi kontrol edip tekrar deneyin."],
];

const GENEL_HATA = "Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";

export function authHataMesaji(ham: string | null | undefined): string {
  if (!ham) return GENEL_HATA;
  for (const [desen, mesaj] of BILINEN_HATALAR) {
    if (desen.test(ham)) return mesaj;
  }
  return GENEL_HATA;
}

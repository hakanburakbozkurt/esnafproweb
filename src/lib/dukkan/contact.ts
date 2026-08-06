export type SocialPlatform = "instagram" | "tiktok" | "facebook";

const SOCIAL_BASE_URL: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/@",
  facebook: "https://facebook.com/",
};

export function normalizeWhatsAppNumber(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("90") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;

  return null;
}

export function validateWhatsAppNumber(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (!normalizeWhatsAppNumber(trimmed)) {
    return "Geçerli bir WhatsApp numarası girin (örn: 905551234567).";
  }

  return null;
}

export function buildWhatsAppUrl(number: string, message?: string): string {
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function normalizeSocialUrl(
  input: string,
  platform: SocialPlatform
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const username = trimmed.replace(/^@/, "").replace(/\/+$/, "");
  if (!username) return null;

  return `${SOCIAL_BASE_URL[platform]}${username}`;
}

export function validateSocialUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^https?:\/\/.+/i.test(trimmed)) return null;
  if (/^@?[\w.-]+$/.test(trimmed)) return null;

  return "Geçerli bir profil linki veya kullanıcı adı girin.";
}

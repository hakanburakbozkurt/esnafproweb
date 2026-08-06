export const MARKA_TERMS_FIELD_NAME = "marka_terms_accepted";

export const MARKA_TERMS_LABEL =
  "Dükkan adımın ve URL slug'ımın tescilli markalara veya üçüncü şahısların haklarına aykırı olmadığını, aksi durumda sorumluluğun bana ait olduğunu ve dükkanımın askıya alınabileceğini kabul ediyorum.";

export const MARKA_TERMS_REQUIRED_ERROR =
  "Devam etmek için Marka ve Telif Hakları Onay Sözleşmesini kabul etmelisiniz.";

export function isMarkaTermsAccepted(formData: FormData): boolean {
  const value = formData.get(MARKA_TERMS_FIELD_NAME);
  return value === "true" || value === "on";
}

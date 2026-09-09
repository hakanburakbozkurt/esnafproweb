export type InstallmentTier = {
  months: number;
  /** Aylık faiz oranı (ör. 0.0199 ≈ %1,99 / ay) */
  monthlyRate: number;
};

export type InstallmentPlan = {
  months: number;
  monthlyRate: number;
  cashPrice: number;
  monthlyPayment: number;
  totalPayment: number;
  /** Toplam vade farkı (faiz + masraf tahmini) */
  vadeFarki: number;
};

export type InstallmentEstimateConfig = {
  tiers: InstallmentTier[];
};

export const DEFAULT_INSTALLMENT_TIERS: InstallmentTier[] = [
  { months: 3, monthlyRate: 0.0179 },
  { months: 6, monthlyRate: 0.0199 },
  { months: 9, monthlyRate: 0.0219 },
  { months: 12, monthlyRate: 0.0239 },
];

export function isValidInstallmentSalePrice(
  salePrice: number | null | undefined
): salePrice is number {
  return (
    salePrice != null &&
    typeof salePrice === "number" &&
    !Number.isNaN(salePrice) &&
    salePrice > 0
  );
}

function calculateTierPlan(cashPrice: number, tier: InstallmentTier): InstallmentPlan {
  const { months, monthlyRate } = tier;

  if (monthlyRate <= 0) {
    const monthlyPayment = Math.round(cashPrice / months);
    return {
      months,
      monthlyRate,
      cashPrice,
      monthlyPayment,
      totalPayment: monthlyPayment * months,
      vadeFarki: Math.max(0, monthlyPayment * months - cashPrice),
    };
  }

  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = (cashPrice * monthlyRate * factor) / (factor - 1);
  const roundedMonthly = Math.round(monthlyPayment);
  const totalPayment = roundedMonthly * months;

  return {
    months,
    monthlyRate,
    cashPrice,
    monthlyPayment: roundedMonthly,
    totalPayment,
    vadeFarki: Math.max(0, totalPayment - cashPrice),
  };
}

/** Tahmini taksit planları — banka/kampanyaya göre değişebilir. */
export function buildInstallmentPlans(
  salePrice: number | null | undefined,
  config: InstallmentEstimateConfig = { tiers: DEFAULT_INSTALLMENT_TIERS }
): InstallmentPlan[] {
  if (!isValidInstallmentSalePrice(salePrice)) {
    return [];
  }

  return config.tiers
    .filter((tier) => tier.months > 0)
    .map((tier) => calculateTierPlan(salePrice, tier));
}

export function formatInstallmentCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatInstallmentRate(monthlyRate: number): string {
  return `%${(monthlyRate * 100).toFixed(2).replace(".", ",")} / ay`;
}

export function getLowestInstallmentPlan(
  plans: InstallmentPlan[]
): InstallmentPlan | null {
  if (!plans.length) return null;

  return plans.reduce((lowest, plan) =>
    plan.monthlyPayment < lowest.monthlyPayment ? plan : lowest
  );
}

export function canRenderInstallmentOptions(input: {
  acceptsInstallments: boolean;
  salePrice: number | null | undefined;
}): boolean {
  return input.acceptsInstallments === true && isValidInstallmentSalePrice(input.salePrice);
}

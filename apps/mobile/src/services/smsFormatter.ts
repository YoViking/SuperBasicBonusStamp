export const DEFAULT_STAMP_PURCHASE_MESSAGE =
  'Tack för ditt besök hos {butik}! Du har nu {saldo} och har bara {kvar_till_bonus} kvar till din bonus ({bonus}).';

export const DEFAULT_STAMP_BONUS_MESSAGE =
  'Tack för ditt besök hos {butik}! Grattis! Du har fyllt ditt stämpelkort och har en bonus ({bonus}) att hämta ut vid nästa besök!';

export const DEFAULT_POINTS_PURCHASE_MESSAGE =
  'Tack för ditt besök hos {butik}! Du har nu samlat {saldo} och har bara {kvar_till_bonus} kvar till din bonus ({bonus}).';

export const DEFAULT_POINTS_BONUS_MESSAGE =
  'Tack för ditt besök hos {butik}! Grattis! Du har nått en ny bonusnivå ({bonus}) att nyttja vid ditt nästa köp!';

export const DEFAULT_PURCHASE_MESSAGE = DEFAULT_STAMP_PURCHASE_MESSAGE;
export const DEFAULT_BONUS_MESSAGE = DEFAULT_STAMP_BONUS_MESSAGE;

const LEGACY_PURCHASE_TEMPLATES = new Set([
  'Tack för ditt besök hos {butik}! Du har nu {saldo} (bara {kvar_till_bonus} kvar till din bonus: {bonus}).',
  'Tack för ditt besök hos {butik}! Du fick +{stämplar} stämpel och har nu {saldo} stämplar ({kvar_till_bonus} kvar till din bonus: {bonus}).',
  'Tack för ditt köp hos {butik}! Ditt köp på {köpesumma} kr har registrerats. Du har nu {kvar_till_bonus} kr kvar till din nästa bonus ({bonus} kr)!',
]);

const LEGACY_BONUS_TEMPLATES = new Set([
  'Tack för ditt besök hos {butik}! Grattis! Du har nått en ny bonus ({bonus}) att nyttja vid nästa besök!',
  'Tack för ditt köp hos {butik}! Ditt köp på {köpesumma} kr har registrerats. Grattis! Du har nått en ny bonusnivå ({bonus} kr) att nyttja vid ditt nästa köp! Du har nu {kvar_till_bonus} kr kvar till nästa bonus.',
]);

export function normalizePurchaseTemplate(
  template: string | undefined,
  bonusType: 'STAMPS' | 'POINTS'
): string {
  const trimmed = template?.trim();
  const targetDefault =
    bonusType === 'STAMPS'
      ? DEFAULT_STAMP_PURCHASE_MESSAGE
      : DEFAULT_POINTS_PURCHASE_MESSAGE;

  if (
    !trimmed ||
    LEGACY_PURCHASE_TEMPLATES.has(trimmed) ||
    trimmed === DEFAULT_STAMP_PURCHASE_MESSAGE ||
    trimmed === DEFAULT_POINTS_PURCHASE_MESSAGE
  ) {
    return targetDefault;
  }
  return trimmed;
}

export function normalizeBonusTemplate(
  template: string | undefined,
  bonusType: 'STAMPS' | 'POINTS'
): string {
  const trimmed = template?.trim();
  const targetDefault =
    bonusType === 'STAMPS'
      ? DEFAULT_STAMP_BONUS_MESSAGE
      : DEFAULT_POINTS_BONUS_MESSAGE;

  if (
    !trimmed ||
    LEGACY_BONUS_TEMPLATES.has(trimmed) ||
    trimmed === DEFAULT_STAMP_BONUS_MESSAGE ||
    trimmed === DEFAULT_POINTS_BONUS_MESSAGE
  ) {
    return targetDefault;
  }
  return trimmed;
}

export interface SmsFormatParams {
  amount: number;
  remaining: number;
  reward?: number;
  threshold?: number;
  storeName?: string;
  rewardDescription?: string;
  currentProgress?: number;
  bonusType?: 'STAMPS' | 'POINTS';
}

export function formatSmsMessage(template: string, params: SmsFormatParams): string {
  if (!template) return '';

  let formatted = template;
  const isPoints = params.bonusType === 'POINTS';

  const amountNum = params.amount ?? 0;
  const amountStr = amountNum.toString();
  const remainingNum = params.remaining ?? 0;
  const remainingStr = remainingNum.toString();
  const thresholdNum = params.threshold ?? (isPoints ? 1000 : 10);
  const thresholdStr = thresholdNum.toString();
  const storeNameStr = params.storeName?.trim() || 'vår butik';

  const progressNum =
    params.currentProgress !== undefined
      ? params.currentProgress
      : Math.max(0, thresholdNum - remainingNum);

  const saldoStr = isPoints
    ? `${progressNum} av ${thresholdStr} kr`
    : `${progressNum} av ${thresholdStr} stämplar`;

  const remainingWithUnitStr = isPoints
    ? `${remainingStr} kr`
    : remainingNum === 1
    ? '1 stämpel'
    : `${remainingStr} stämplar`;

  const stampsAddedStr =
    amountNum === 1 ? '1 stämpel' : `${amountStr} stämplar`;
  const purchaseAmountStr = `${amountStr} kr`;

  const rewardNum = params.reward ?? (isPoints ? 100 : 1);
  const rewardStr =
    !isPoints && params.rewardDescription?.trim()
      ? params.rewardDescription.trim()
      : isPoints
      ? `${rewardNum} kr rabatt`
      : `${rewardNum} gratis vara`;

  const thresholdWithUnitStr = isPoints
    ? `${thresholdStr} kr`
    : `${thresholdStr} stämplar`;

  // 1. Butiksnamn & Saldo (fångar ev. efterföljande enhet så den inte dubbleras)
  formatted = formatted
    .replace(/\{butiksnamn\}/gi, storeNameStr)
    .replace(/\{butik\}/gi, storeNameStr)
    .replace(/\{store\}/gi, storeNameStr)
    .replace(/\{saldo\}(\s*(?:stämplar|stämpel|kr|poäng))?/gi, saldoStr);

  // 2. Svenska taggar för köp/stämplar och bonus
  formatted = formatted
    .replace(/\{köpesumma\}(\s*kr)?/gi, purchaseAmountStr)
    .replace(/\{belopp\}(\s*kr)?/gi, purchaseAmountStr)
    .replace(/\{summa\}(\s*kr)?/gi, purchaseAmountStr)
    .replace(/\{stämplar\}(\s*(?:stämplar|stämpel|st))?/gi, stampsAddedStr)
    .replace(/\{antal\}(\s*(?:stämplar|stämpel|st))?/gi, stampsAddedStr)
    .replace(
      /\{kvar_till_bonus\}(\s*(?:stämplar|stämpel|kr|poäng))?/gi,
      remainingWithUnitStr
    )
    .replace(
      /\{kvar\}(\s*(?:stämplar|stämpel|kr|poäng))?/gi,
      remainingWithUnitStr
    )
    .replace(/\{bonusbelopp\}(\s*kr(?:\s*rabatt)?)?/gi, rewardStr)
    .replace(/\{belöning\}(\s*kr(?:\s*rabatt)?)?/gi, rewardStr)
    .replace(/\{bonus\}(\s*kr(?:\s*rabatt)?)?/gi, rewardStr)
    .replace(
      /\{bonusgräns\}(\s*(?:stämplar|stämpel|kr|poäng))?/gi,
      thresholdWithUnitStr
    );

  // 3. Engelska taggar
  formatted = formatted
    .replace(/\{amount\}(\s*kr)?/gi, isPoints ? purchaseAmountStr : stampsAddedStr)
    .replace(
      /\{remaining\}(\s*(?:stämplar|stämpel|kr|poäng))?/gi,
      remainingWithUnitStr
    )
    .replace(/\{reward\}(\s*kr(?:\s*rabatt)?)?/gi, rewardStr)
    .replace(
      /\{threshold\}(\s*(?:stämplar|stämpel|kr|poäng))?/gi,
      thresholdWithUnitStr
    );

  // 4. Smart ersättning för 'X kr' eller '[X]'
  let xIndex = 0;
  formatted = formatted.replace(/\bX(?=\s*kr\b)/gi, () => {
    xIndex++;
    if (xIndex === 1) return amountStr;
    if (xIndex === 2) return remainingStr;
    return rewardNum.toString();
  });

  formatted = formatted.replace(/\[X\]/g, () => {
    xIndex++;
    if (xIndex === 1) return amountStr;
    if (xIndex === 2) return remainingStr;
    return rewardStr;
  });

  return formatted;
}

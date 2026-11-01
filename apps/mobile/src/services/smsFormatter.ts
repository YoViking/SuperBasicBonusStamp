export const DEFAULT_STAMP_PURCHASE_MESSAGE =
  'Tack för ditt besök hos {butik}! Du fick +{stämplar} stämpel och har nu {saldo} stämplar ({kvar_till_bonus} kvar till din bonus: {bonus}).';

export const DEFAULT_STAMP_BONUS_MESSAGE =
  'Tack för ditt besök hos {butik}! Grattis! 🎉 Du har fyllt ditt stämpelkort och har en bonus ({bonus}) att hämta ut vid nästa besök!';

export const DEFAULT_POINTS_PURCHASE_MESSAGE =
  'Tack för ditt köp hos {butik}! Ditt köp på {köpesumma} kr har registrerats. Du har nu {kvar_till_bonus} kr kvar till din nästa bonus ({bonus} kr)!';

export const DEFAULT_POINTS_BONUS_MESSAGE =
  'Tack för ditt köp hos {butik}! Ditt köp på {köpesumma} kr har registrerats. Grattis! 🎉 Du har nått en ny bonusnivå ({bonus} kr) att nyttja vid ditt nästa köp! Du har nu {kvar_till_bonus} kr kvar till nästa bonus.';

export const DEFAULT_PURCHASE_MESSAGE = DEFAULT_STAMP_PURCHASE_MESSAGE;
export const DEFAULT_BONUS_MESSAGE = DEFAULT_STAMP_BONUS_MESSAGE;

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

  const amountStr = (params.amount ?? 0).toString();
  const remainingStr = (params.remaining ?? 0).toString();
  const thresholdNum = params.threshold ?? (params.bonusType === 'POINTS' ? 1000 : 10);
  const thresholdStr = thresholdNum.toString();
  const storeNameStr = params.storeName?.trim() || 'vår butik';

  const progressNum =
    params.currentProgress !== undefined
      ? params.currentProgress
      : Math.max(0, thresholdNum - (params.remaining ?? 0));
  const saldoStr = `${progressNum}/${thresholdStr}`;

  const rewardStr =
    params.bonusType === 'STAMPS' && params.rewardDescription?.trim()
      ? params.rewardDescription.trim()
      : (params.reward ?? 100).toString();

  // 1. Butiksnamn & Saldo
  formatted = formatted
    .replace(/\{butiksnamn\}/gi, storeNameStr)
    .replace(/\{butik\}/gi, storeNameStr)
    .replace(/\{store\}/gi, storeNameStr)
    .replace(/\{saldo\}/gi, saldoStr);

  // 2. Svenska taggar för köp/stämplar och bonus
  formatted = formatted
    .replace(/\{köpesumma\}/gi, amountStr)
    .replace(/\{belopp\}/gi, amountStr)
    .replace(/\{summa\}/gi, amountStr)
    .replace(/\{stämplar\}/gi, amountStr)
    .replace(/\{antal\}/gi, amountStr)
    .replace(/\{kvar_till_bonus\}/gi, remainingStr)
    .replace(/\{kvar\}/gi, remainingStr)
    .replace(/\{bonusbelopp\}/gi, rewardStr)
    .replace(/\{belöning\}/gi, rewardStr)
    .replace(/\{bonus\}/gi, rewardStr)
    .replace(/\{bonusgräns\}/gi, thresholdStr);

  // 3. Engelska taggar
  formatted = formatted
    .replace(/\{amount\}/gi, amountStr)
    .replace(/\{remaining\}/gi, remainingStr)
    .replace(/\{reward\}/gi, rewardStr)
    .replace(/\{threshold\}/gi, thresholdStr);

  // 4. Smart ersättning för 'X kr' eller '[X]'
  let xIndex = 0;
  formatted = formatted.replace(/\bX(?=\s*kr\b)/gi, () => {
    xIndex++;
    if (xIndex === 1) return amountStr;
    if (xIndex === 2) return remainingStr;
    return rewardStr;
  });

  formatted = formatted.replace(/\[X\]/g, () => {
    xIndex++;
    if (xIndex === 1) return amountStr;
    if (xIndex === 2) return remainingStr;
    return rewardStr;
  });

  return formatted;
}

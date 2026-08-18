export const DEFAULT_PURCHASE_MESSAGE =
  'Tack för ditt köp på Kamera Stockholm! Ditt köp på {köpesumma} kr har registrerats. Du har nu {kvar_till_bonus} kr kvar till din nästa bonus!';

export const DEFAULT_BONUS_MESSAGE =
  'Tack för ditt köp på Kamera Stockholm! Ditt köp på {köpesumma} kr har registrerats. Grattis! Du har nått en ny bonusnivå och har en belöning att hämta ut vid ditt nästa köp! Du har nu {kvar_till_bonus} kr kvar till din nästa bonus!';

export interface SmsFormatParams {
  amount: number;
  remaining: number;
  reward?: number;
  threshold?: number;
}

export function formatSmsMessage(template: string, params: SmsFormatParams): string {
  if (!template) return '';

  let formatted = template;

  const amountStr = (params.amount ?? 0).toString();
  const remainingStr = (params.remaining ?? 0).toString();
  const rewardStr = (params.reward ?? 100).toString();
  const thresholdStr = (params.threshold ?? 1000).toString();

  // 1. Swedish tag replacements
  formatted = formatted
    .replace(/\{köpesumma\}/gi, amountStr)
    .replace(/\{belopp\}/gi, amountStr)
    .replace(/\{summa\}/gi, amountStr)
    .replace(/\{kvar_till_bonus\}/gi, remainingStr)
    .replace(/\{kvar\}/gi, remainingStr)
    .replace(/\{bonusbelopp\}/gi, rewardStr)
    .replace(/\{bonus\}/gi, rewardStr)
    .replace(/\{bonusgräns\}/gi, thresholdStr);

  // 2. English tag replacements
  formatted = formatted
    .replace(/\{amount\}/gi, amountStr)
    .replace(/\{remaining\}/gi, remainingStr)
    .replace(/\{reward\}/gi, rewardStr)
    .replace(/\{threshold\}/gi, thresholdStr);

  // 3. Smart replacement for literal 'X kr', 'Xkr', '[X]', etc.
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

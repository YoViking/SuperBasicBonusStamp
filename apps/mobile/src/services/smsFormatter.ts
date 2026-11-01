import { LanguageCode, translations } from '../i18n/translations';

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

export function getAllDefaultPurchaseTemplates(): Set<string> {
  const set = new Set<string>(LEGACY_PURCHASE_TEMPLATES);
  for (const lang of Object.values(translations)) {
    set.add(lang.sms.defaultStampPurchase);
    set.add(lang.sms.defaultPointsPurchase);
  }
  return set;
}

export function getAllDefaultBonusTemplates(): Set<string> {
  const set = new Set<string>(LEGACY_BONUS_TEMPLATES);
  for (const lang of Object.values(translations)) {
    set.add(lang.sms.defaultStampBonus);
    set.add(lang.sms.defaultPointsBonus);
  }
  return set;
}

export function normalizePurchaseTemplate(
  template: string | undefined,
  bonusType: 'STAMPS' | 'POINTS',
  language: LanguageCode = 'sv'
): string {
  const trimmed = template?.trim();
  const langSms = translations[language]?.sms || translations.sv.sms;
  const targetDefault =
    bonusType === 'STAMPS'
      ? langSms.defaultStampPurchase
      : langSms.defaultPointsPurchase;

  if (!trimmed || getAllDefaultPurchaseTemplates().has(trimmed)) {
    return targetDefault;
  }
  return trimmed;
}

export function normalizeBonusTemplate(
  template: string | undefined,
  bonusType: 'STAMPS' | 'POINTS',
  language: LanguageCode = 'sv'
): string {
  const trimmed = template?.trim();
  const langSms = translations[language]?.sms || translations.sv.sms;
  const targetDefault =
    bonusType === 'STAMPS'
      ? langSms.defaultStampBonus
      : langSms.defaultPointsBonus;

  if (!trimmed || getAllDefaultBonusTemplates().has(trimmed)) {
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
  language?: LanguageCode;
  currencySymbol?: string;
}

export function formatSmsMessage(template: string, params: SmsFormatParams): string {
  if (!template) return '';

  let formatted = template;
  const isPoints = params.bonusType === 'POINTS';
  const langSms =
    translations[params.language || 'sv']?.sms || translations.sv.sms;
  const currency = params.currencySymbol || 'kr';

  const amountNum = params.amount ?? 0;
  const amountStr = amountNum.toString();
  const remainingNum = params.remaining ?? 0;
  const remainingStr = remainingNum.toString();
  const thresholdNum = params.threshold ?? (isPoints ? 1000 : 10);
  const thresholdStr = thresholdNum.toString();
  const storeNameStr = params.storeName?.trim() || langSms.ourStoreFallback;

  const progressNum =
    params.currentProgress !== undefined
      ? params.currentProgress
      : Math.max(0, thresholdNum - remainingNum);

  const saldoStr = isPoints
    ? `${progressNum} ${langSms.ofWord} ${thresholdStr} ${currency}`
    : `${progressNum} ${langSms.ofWord} ${thresholdStr} ${langSms.stampPlural}`;

  const remainingWithUnitStr = isPoints
    ? `${remainingStr} ${currency}`
    : remainingNum === 1
    ? `1 ${langSms.stampSingular}`
    : `${remainingStr} ${langSms.stampPlural}`;

  const stampsAddedStr =
    amountNum === 1
      ? `1 ${langSms.stampSingular}`
      : `${amountStr} ${langSms.stampPlural}`;
  const purchaseAmountStr = `${amountStr} ${currency}`;

  const rewardNum = params.reward ?? (isPoints ? 100 : 1);
  const rewardStr =
    !isPoints && params.rewardDescription?.trim()
      ? params.rewardDescription.trim()
      : isPoints
      ? `${rewardNum} ${currency} ${langSms.discountWord}`
      : `${rewardNum} ${langSms.freeItemFallback}`;

  const thresholdWithUnitStr = isPoints
    ? `${thresholdStr} ${currency}`
    : `${thresholdStr} ${langSms.stampPlural}`;

  // 1. Butiksnamn & Saldo
  formatted = formatted
    .replace(/\{butiksnamn\}/gi, storeNameStr)
    .replace(/\{butik\}/gi, storeNameStr)
    .replace(/\{store\}/gi, storeNameStr)
    .replace(/\{laden\}/gi, storeNameStr)
    .replace(/\{tienda\}/gi, storeNameStr)
    .replace(
      /\{(saldo|balance|guthaben)\}(\s*(?:stämplar|stämpel|stamps|stamp|stempel|sellos|sello|kr|£|\$|€|sek|gbp|usd|eur|poäng|points|punkte|puntos))?/gi,
      saldoStr
    );

  // 2. Taggar för köp/stämplar och bonus (sv, en, de, es)
  formatted = formatted
    .replace(
      /\{(köpesumma|belopp|summa|betrag|importe)\}(\s*(?:kr|£|\$|€|sek|gbp|usd|eur))?/gi,
      purchaseAmountStr
    )
    .replace(
      /\{(stämplar|antal|stamps|stempel|sellos)\}(\s*(?:stämplar|stämpel|st|stamps|stamp|stempel|sellos|sello))?/gi,
      stampsAddedStr
    )
    .replace(
      /\{(kvar_till_bonus|kvar|remaining|rest|restante)\}(\s*(?:stämplar|stämpel|stamps|stamp|stempel|sellos|sello|kr|£|\$|€|sek|gbp|usd|eur|poäng|points|punkte|puntos))?/gi,
      remainingWithUnitStr
    )
    .replace(
      /\{(bonusbelopp|belöning|bonus|reward|prämie|recompensa)\}(\s*(?:kr|£|\$|€|sek|gbp|usd|eur)(?:\s*(?:rabatt|discount|descuento))?)?/gi,
      rewardStr
    )
    .replace(
      /\{(bonusgräns|threshold|schwelle|límite)\}(\s*(?:stämplar|stämpel|stamps|stamp|stempel|sellos|sello|kr|£|\$|€|sek|gbp|usd|eur|poäng|points|punkte|puntos))?/gi,
      thresholdWithUnitStr
    );

  // 3. {amount}
  formatted = formatted.replace(
    /\{amount\}(\s*(?:kr|£|\$|€|sek|gbp|usd|eur))?/gi,
    isPoints ? purchaseAmountStr : stampsAddedStr
  );

  // 4. Smart ersättning för 'X kr' eller '[X]'
  let xIndex = 0;
  formatted = formatted.replace(/\bX(?=\s*(?:kr|£|\$|€)\b)/gi, () => {
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

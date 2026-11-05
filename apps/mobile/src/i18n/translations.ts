export type LanguageCode = 'sv' | 'en' | 'de' | 'es';
export type CurrencyCode = 'SEK' | 'GBP' | 'USD' | 'EUR';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  flag: string;
}

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'SEK', symbol: 'kr', label: 'SEK (kr)', flag: '🇸🇪' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', flag: '🇬🇧' },
  { code: 'USD', symbol: '$', label: 'USD ($)', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', flag: '🇪🇺' },
];

export interface Translations {
  tabs: {
    pos: string;
    settings: string;
    bonusSms: string;
    articles: string;
    app: string;
    shopify: string;
  };
  appSettings: {
    themeTitle: string;
    themeHelper: string;
    lightLabel: string;
    lightDesc: string;
    darkLabel: string;
    darkDesc: string;
    systemLabel: string;
    systemDesc: string;
    languageTitle: string;
    languageHelper: string;
    currencyTitle: string;
    currencyHelper: string;
    accountTitle: string;
    accountHelper: string;
    logoutBtn: string;
    logoutConfirmTitle: string;
    logoutConfirmMessage: string;
    cancel: string;
  };
  login: {
    subtitle: string;
    registerTitle: string;
    loginTitle: string;
    storeNameLabel: string;
    storeNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    passwordHint: string;
    valStoreNameRequired: string;
    valEmailInvalid: string;
    valPasswordRequired: string;
    valPasswordMinLength: string;
    valPasswordUppercase: string;
    valPasswordLowercase: string;
    valPasswordNumber: string;
    valOtpInvalid: string;
    criteriaMinLength: string;
    criteriaUppercase: string;
    criteriaLowercase: string;
    criteriaNumber: string;
    registerBtn: string;
    loginBtn: string;
    switchToLogin: string;
    switchToRegister: string;
    tabPassword: string;
    tabMagicLink: string;
    magicLinkTitle: string;
    magicLinkSubtitle: string;
    sendMagicLinkBtn: string;
    magicLinkSentTitle: string;
    magicLinkSentMsg: string;
    otpLabel: string;
    otpPlaceholder: string;
    verifyOtpBtn: string;
    resendCodeBtn: string;
    codeResentMsg: string;
    verifyTitle: string;
    verifySubtitle: string;
    emailNotConfirmedTitle: string;
    emailNotConfirmedMsg: string;
    checkEmailInstruction: string;
    missingOtp: string;
    backToLogin: string;
    openOtpVerification: string;
    supabaseNotConfiguredTitle: string;
    supabaseNotConfiguredMsg: string;
    missingCredentialsTitle: string;
    missingCredentialsMsg: string;
    missingStoreNameTitle: string;
    missingStoreNameMsg: string;
    accountCreatedTitle: string;
    accountCreatedMsg: string;
    authErrorTitle: string;
    authErrorDefault: string;
    infoBannerTitle: string;
    infoBannerText1: string;
    infoBannerText2: string;
    infoBannerText3: string;
    demoBtn: string;
  };
  pos: {
    defaultStoreName: string;
    defaultRewardDesc: string;
    stampsBadge: string;
    pointsBadge: string;
    quickBadge: string;
    articlesBadge: string;
    phonePlaceholder: string;
    searchCustomerBtn: string;
    enterPhoneTitle: string;
    enterPhoneMsg: string;
    searchErrorTitle: string;
    newCustomerBadge: string;
    existingCustomerBadge: string;
    gdprDeleteBtn: string;
    gdprAlertTitle: string;
    gdprAlertMsg: string;
    gdprConfirmBtn: string;
    cancel: string;
    errorTitle: string;
    deleteCustomerError: string;
    stampsProgressText: (current: number, threshold: number, remaining: number, reward: string) => string;
    pointsProgressText: (current: number, threshold: number, remaining: number, reward: number, currency: string) => string;
    bonusAvailableTitle: (count: number) => string;
    redeemBonusBtn: (desc: string) => string;
    appliedBonusText: (count: number) => string;
    undoBtn: string;
    howManyStampsTitle: string;
    stampSingular: string;
    stampPlural: string;
    enterPurchaseAmountTitle: (currency: string) => string;
    clearBtn: string;
    scanBarcodeBtn: string;
    scanModalTitle: string;
    scanModalSubtitle: string;
    itemAddedTitle: string;
    itemAddedMsg: (name: string, price: string) => string;
    itemNotFoundTitle: string;
    itemNotFoundMsg: (code: string) => string;
    allCategory: (count: number) => string;
    topSellersCategory: string;
    emptyArticlesText: string;
    cartTitle: (count: number) => string;
    clearCartBtn: string;
    redeemedBonusLabel: string;
    toRegisterStamps: (count: number) => string;
    totalWithStamps: (total: string, stamps: number) => string;
    totalAmount: (total: string) => string;
    checkoutStampsBtn: string;
    checkoutPointsBtn: string;
    missingPhoneTitle: string;
    missingPhoneMsg: string;
    nothingToRegisterTitle: string;
    nothingToRegisterArticles: string;
    nothingToRegisterStamps: string;
    nothingToRegisterPoints: string;
    newBonusTitle: string;
    registeredTitle: string;
    newBonusMsg: string;
    registeredMsg: string;
    noDoneBtn: string;
    yesOpenSmsBtn: string;
    gdprSmsFooter: (storeName: string) => string;
    activeShopifyDiscount: (code: string, amount: number, currency: string) => string;
    redeemShopifyDiscountBtn: string;
    shopifyDiscountRedeemedAlert: string;
  };
  bonusSettings: {
    section1Title: string;
    storeNameLabel: string;
    storeNamePlaceholder: string;
    posModeLabel: string;
    quickModeTitle: string;
    quickModeDesc: string;
    articlesModeTitle: string;
    articlesModeDesc: string;
    section2Title: string;
    section2Helper: string;
    stampCardTitle: string;
    stampCardDesc: string;
    pointsTitle: string;
    pointsDesc: (currency: string) => string;
    stampsThresholdLabel: string;
    stampsRewardDescLabel: string;
    stampsRewardDescPlaceholder: string;
    stampsDiscountValueLabel: (currency: string) => string;
    pointsThresholdLabel: (currency: string) => string;
    pointsRewardLabel: (currency: string) => string;
    section3Title: string;
    section3Helper: string;
    availableTagsLabel: string;
    andWord: string;
    purchaseTemplatePlaceholder: string;
    resetTemplateBtn: string;
    previewLabel: string;
    section4Title: string;
    section4Helper: string;
    bonusTemplatePlaceholder: string;
    saveAllBtn: string;
    savedTitle: string;
    savedMsg: string;
    saveErrorMsg: string;
    tabSettings: string;
    tabOutreach: string;
    outreachFilterTitle: string;
    outreachFilterHelper: string;
    filterAllTitle: string;
    filterAllDesc: string;
    filterHasBonusTitle: string;
    filterHasBonusDesc: string;
    filterCloseToBonusTitle: string;
    filterCloseToBonusDesc: string;
    outreachMessageTitle: string;
    outreachMessageHelper: string;
    defaultCampaignMsg: string;
    defaultReminderHasBonusMsg: string;
    defaultReminderCloseMsg: string;
    includeOptOutLabel: string;
    optOutFooter: (storeName: string) => string;
    outreachQueueTitle: (count: number) => string;
    outreachQueueHelper: string;
    sendNextBtn: (nextIndex: number, total: number, phone: string) => string;
    allSentBadge: string;
    resetQueueBtn: string;
    emptyFilterCustomers: string;
    customerSentStatus: string;
    customerSendSingleBtn: string;
    customerBonusReadyBadge: (count: number) => string;
    searchQueuePlaceholder: string;
    stopBtnLabel: string;
    unblockBtnLabel: string;
    showBlockedBtn: (count: number) => string;
    hideBlockedBtn: string;
    blockedCustomerBadge: string;
  };
  articles: {
    defaultCategory: string;
    searchPlaceholder: string;
    cancelBtn: string;
    hideFormBtn: string;
    newArticleBtn: string;
    editArticleTitle: string;
    addArticleTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    priceLabel: (currency: string) => string;
    categoryLabel: string;
    categoryPlaceholder: string;
    skuLabel: string;
    skuPlaceholder: string;
    scanBtn: string;
    updateArticleBtn: string;
    saveArticleBtn: string;
    cancelEditBtn: string;
    emptySearchText: string;
    emptyListText: string;
    categoryPrefix: string;
    editBtn: string;
    deleteBtn: string;
    scanModalTitle: string;
    scanModalSubtitle: string;
    barcodeScannedTitle: string;
    barcodeScannedMsg: (code: string) => string;
    missingInfoTitle: string;
    missingInfoMsg: string;
    invalidPriceTitle: string;
    invalidPriceMsg: string;
    updatedTitle: string;
    updatedMsg: string;
    savedTitle: string;
    savedMsg: string;
    deleteAlertTitle: string;
    deleteAlertMsg: (name: string) => string;
    deleteConfirmBtn: string;
    deleteErrorTitle: string;
  };
  scanner: {
    defaultTitle: string;
    defaultSubtitle: string;
    loadingCamera: string;
    permissionTitle: string;
    permissionDesc: string;
    allowCameraBtn: string;
    cancelBtn: string;
    torchOn: string;
    torchOff: string;
    closeBtn: string;
  };
  shopify: {
    title: string;
    subTitle: string;
    badgeActive: string;
    badgeInactive: string;
    badgeNotConfigured: string;
    sectionConnectTitle: string;
    sectionConnectDesc: string;
    domainLabel: string;
    domainPlaceholder: string;
    tokenLabel: string;
    tokenPlaceholder: string;
    secretLabel: string;
    secretPlaceholder: string;
    webhookUrlTitle: string;
    webhookUrlHelper: string;
    copyUrlBtn: string;
    urlCopied: string;
    testBtn: string;
    testing: string;
    testSuccess: (shopName: string) => string;
    testError: string;
    saveBtn: string;
    saving: string;
    savedSuccess: string;
    rulesTitle: string;
    rulesDesc: string;
    consentTitle: string;
    consentDesc: string;
    consentRespect: string;
    consentRequire: string;
    consentAlways: string;
    pointsRateLabel: (currency: string) => string;
    productTypesFilterLabel: string;
    productTypesFilterPlaceholder: string;
    productTypesFilterHelper: string;
    discountPrefixLabel: string;
    discountValidityLabel: string;
    syncTitle: string;
    syncDesc: string;
    syncBtn: string;
    syncing: string;
    syncSuccess: (count: number) => string;
    syncError: string;
    tabConfig: string;
    tabDiscounts: string;
    tabOrders: string;
    emptyDiscounts: string;
    emptyOrders: string;
    filterAll: string;
    filterActive: string;
    filterUsed: string;
    codeCopied: string;
    expiresOn: (date: string) => string;
    redeemedInOrder: (order: string) => string;
    inStoreRedeemBtn: string;
    inStoreRedeemConfirm: string;
    inStoreRedeemedSuccess: string;
  };
  sms: {
    defaultStampPurchase: string;
    defaultStampBonus: string;
    defaultPointsPurchase: string;
    defaultPointsBonus: string;
    stampSingular: string;
    stampPlural: string;
    ofWord: string;
    discountWord: string;
    freeItemFallback: string;
    ourStoreFallback: string;
    tagStore: string;
    tagBalance: string;
    tagRemaining: string;
    tagBonus: string;
    tagStamps: string;
    tagAmount: string;
    tagStoreLabel: string;
    tagBalanceLabel: string;
    tagRemainingLabel: string;
    tagBonusLabel: string;
    tagStampsLabel: string;
    tagAmountLabel: string;
  };
}

export const translations: Record<LanguageCode, Translations> = {
  sv: {
    tabs: {
      pos: 'Kassa',
      settings: 'Inställningar',
      bonusSms: 'Bonus & SMS',
      articles: 'Artiklar',
      app: 'App',
      shopify: 'Shopify',
    },
    appSettings: {
      themeTitle: 'Utseende (Tema)',
      themeHelper:
        'Välj om appen ska visas i ljust läge, mörkt läge eller följa enhetens systeminställning.',
      lightLabel: 'Ljust',
      lightDesc: 'Klassiskt ljust utseende',
      darkLabel: 'Mörkt',
      darkDesc: 'Skonsamt i mörkare miljö',
      systemLabel: 'System',
      systemDesc: 'Följer enhetens inställning',
      languageTitle: 'Språk',
      languageHelper: 'Välj vilket språk som ska användas i appen och i standardmallar för SMS.',
      currencyTitle: 'Valuta',
      currencyHelper: 'Välj vilken valuta som ska visas för priser, köpesummor och poänggränser.',
      accountTitle: 'Konto',
      accountHelper: 'Avsluta din nuvarande session eller byt butikskonto.',
      logoutBtn: 'Logga ut',
      logoutConfirmTitle: 'Logga ut',
      logoutConfirmMessage: 'Är du säker på att du vill logga ut från kassan?',
      cancel: 'Avbryt',
    },
    login: {
      subtitle: 'Digitalt stämpelkort & bonussystem för din butik',
      registerTitle: 'Skapa nytt butikskonto',
      loginTitle: 'Logga in i kassan',
      storeNameLabel: 'Butikens namn',
      storeNamePlaceholder: 't.ex. Café Hörnan eller Salong Klipp',
      emailLabel: 'E-postadress',
      emailPlaceholder: 'butik@exempel.se',
      passwordLabel: 'Lösenord',
      passwordPlaceholder: 'Minst 8 tecken (A-Z, a-z, 0-9)',
      passwordHint: 'Minst 8 tecken med stor bokstav, liten bokstav och siffra',
      valStoreNameRequired: 'Butiksnamnet måste innehålla minst 2 tecken.',
      valEmailInvalid: 'Ange en giltig e-postadress.',
      valPasswordRequired: 'Lösenord måste anges.',
      valPasswordMinLength: 'Lösenordet måste vara minst 8 tecken.',
      valPasswordUppercase: 'Lösenordet måste innehålla minst en stor bokstav.',
      valPasswordLowercase: 'Lösenordet måste innehålla minst en liten bokstav.',
      valPasswordNumber: 'Lösenordet måste innehålla minst en siffra.',
      valOtpInvalid: 'Koden måste bestå av 6 siffror.',
      criteriaMinLength: 'Minst 8 tecken',
      criteriaUppercase: 'Stor bokstav (A-Z)',
      criteriaLowercase: 'Liten bokstav (a-z)',
      criteriaNumber: 'Siffra (0-9)',
      registerBtn: 'Skapa butik & Logga in',
      loginBtn: 'Logga in',
      switchToLogin: 'Har du redan ett konto? Logga in här',
      switchToRegister: 'Ny butik? Skapa ett butikskonto här',
      tabPassword: 'Lösenord',
      tabMagicLink: 'Magic Link / Kod',
      magicLinkTitle: 'Logga in med länk eller kod',
      magicLinkSubtitle:
        'Ange din e-post så skickar vi en inloggningslänk och en 6-siffrig kod direkt till din inkorg.',
      sendMagicLinkBtn: 'Skicka inloggningskod / länk',
      magicLinkSentTitle: 'Kolla din inkorg!',
      magicLinkSentMsg:
        'Vi har skickat en länk och kod till din e-post. Klicka på länken på denna enhet eller fyll i den 6-siffriga koden nedan.',
      otpLabel: '6-siffrig kod från mejlet',
      otpPlaceholder: 't.ex. 123456',
      verifyOtpBtn: 'Verifiera och logga in',
      resendCodeBtn: 'Skicka koden igen',
      codeResentMsg: 'En ny kod har skickats till din e-post.',
      verifyTitle: 'Bekräfta ditt konto',
      verifySubtitle:
        'Fyll i den 6-siffriga koden som vi skickade till din e-post för att aktivera ditt butikskonto.',
      emailNotConfirmedTitle: 'E-posten är inte bekräftad',
      emailNotConfirmedMsg:
        'Ditt konto kräver att e-postadressen bekräftas. Fyll i den 6-siffriga koden från mejlet eller klicka på länken.',
      checkEmailInstruction:
        'Klicka på länken i mejlet på denna enhet eller skriv in den 6-siffriga koden här:',
      missingOtp: 'Ange den 6-siffriga koden från mejlet.',
      backToLogin: 'Tillbaka till inloggning',
      openOtpVerification: 'Har du redan fått en kod i mejlet? Klicka här',
      supabaseNotConfiguredTitle: 'Supabase ej konfigurerat än',
      supabaseNotConfiguredMsg:
        'Lägg in EXPO_PUBLIC_SUPABASE_URL och EXPO_PUBLIC_SUPABASE_ANON_KEY i apps/mobile/.env, eller klicka på "Testa i Demo-läge" nedan för att testa appen direkt!',
      missingCredentialsTitle: 'Uppgifter saknas',
      missingCredentialsMsg: 'Ange både e-postadress och lösenord.',
      missingStoreNameTitle: 'Butiksnamn saknas',
      missingStoreNameMsg: 'Ange namnet på din butik.',
      accountCreatedTitle: 'Konto skapat!',
      accountCreatedMsg:
        'Om e-postbekräftelse är påslaget i Supabase, klicka på länken i ditt mejl och logga sedan in.',
      authErrorTitle: 'Inloggningsfel',
      authErrorDefault: 'Något gick fel.',
      infoBannerTitle: 'Supabase är inte kopplat än',
      infoBannerText1: 'Skapa en',
      infoBannerText2: '-fil i',
      infoBannerText3: 'med dina nycklar från Supabase och kör',
      demoBtn: 'Testa i Demo-läge (sparas lokalt på enheten)',
    },
    pos: {
      defaultStoreName: 'Min Butik',
      defaultRewardDesc: '1 gratis vara',
      stampsBadge: 'Stämpelkort',
      pointsBadge: 'Poäng',
      quickBadge: 'Snabbläge',
      articlesBadge: 'Artikelläge',
      phonePlaceholder: 'Telefonnummer...',
      searchCustomerBtn: 'Sök Kund',
      enterPhoneTitle: 'Ange telefonnummer',
      enterPhoneMsg: 'Skriv in kundens telefonnummer först.',
      searchErrorTitle: 'Fel vid sökning',
      newCustomerBadge: 'Ny kund',
      existingCustomerBadge: 'Registrerad kund',
      gdprDeleteBtn: 'Ta bort kund (GDPR)',
      gdprAlertTitle: 'Radera kund (GDPR)',
      gdprAlertMsg:
        'Är du säker på att du vill radera kunden och alla sparade stämplar/poäng? Detta kan inte ångras.',
      gdprConfirmBtn: 'Ja, ta bort',
      cancel: 'Avbryt',
      errorTitle: 'Fel',
      deleteCustomerError: 'Kunde inte radera kunden: ',
      stampsProgressText: (current, threshold, remaining, reward) =>
        `${current} av ${threshold} stämplar (${remaining} kvar till ${reward})`,
      pointsProgressText: (current, threshold, remaining, reward, currency) =>
        `${current} / ${threshold} ${currency} (${remaining} ${currency} kvar till ${reward} ${currency} bonus)`,
      bonusAvailableTitle: (count) => `Kunden har ${count} st bonus att hämta ut!`,
      redeemBonusBtn: (desc) => `Utnyttja 1 bonus (${desc})`,
      appliedBonusText: (count) => `${count} st bonus vald att lösas in`,
      undoBtn: 'Ångra',
      howManyStampsTitle: 'Hur många stämplar vill du ge?',
      stampSingular: 'stämpel',
      stampPlural: 'stämplar',
      enterPurchaseAmountTitle: (currency) => `Ange köpesumma (${currency})`,
      clearBtn: 'Rensa',
      scanBarcodeBtn: 'Scanna streckkod på vara',
      scanModalTitle: 'Scanna vara',
      scanModalSubtitle: 'Rikta kameran mot streckkoden på produkten',
      itemAddedTitle: 'Vara tillagd!',
      itemAddedMsg: (name, price) => `${name} (${price}) lades till i varukorgen.`,
      itemNotFoundTitle: 'Vara hittades inte',
      itemNotFoundMsg: (code) =>
        `Ingen artikel med streckkod/SKU "${code}" hittades.\n\nTips: Koppla streckkoden under Inställningar > Artiklar.`,
      allCategory: (count) => `Alla (${count})`,
      topSellersCategory: 'Toppsäljare',
      emptyArticlesText:
        'Inga artiklar hittades. Lägg till varor under Inställningar > Artiklar, eller byt till Snabbläge!',
      cartTitle: (count) => `Varukorg (${count} st):`,
      clearCartBtn: 'Töm varukorg',
      redeemedBonusLabel: 'Inlöst bonus:',
      toRegisterStamps: (count) => `Att registrera: +${count} stämpel`,
      totalWithStamps: (total, stamps) => `Totalt: ${total} (+${stamps} stämplar)`,
      totalAmount: (total) => `Totalt: ${total}`,
      checkoutStampsBtn: 'Registrera stämpel & Skicka SMS',
      checkoutPointsBtn: 'Slutför köp & Skicka SMS',
      missingPhoneTitle: 'Telefonnummer saknas',
      missingPhoneMsg: 'Ange kundens telefonnummer först.',
      nothingToRegisterTitle: 'Inget att registrera',
      nothingToRegisterArticles: 'Välj minst en artikel eller lös in en bonus.',
      nothingToRegisterStamps: 'Välj minst 1 stämpel eller lös in en bonus.',
      nothingToRegisterPoints: 'Ange köpesumma eller lös in en bonus.',
      newBonusTitle: 'Ny Bonus Uppnådd!',
      registeredTitle: 'Registrerat!',
      newBonusMsg: 'Kunden har nått en ny bonusnivå!\n\nVill du skicka ett SMS till kunden?',
      registeredMsg:
        'Köpet/stämpeln har sparats.\n\nVill du skicka ett bekräftelse-SMS till kunden?',
      noDoneBtn: 'Nej, klart',
      yesOpenSmsBtn: 'Ja, öppna SMS',
      gdprSmsFooter: (storeName) =>
        `\n\nInfo: Vi sparar ditt nummer för bonussystemet hos ${storeName}. Svara STOPP om du vill gå ur.`,
      activeShopifyDiscount: (code, amount, currency) =>
        `Aktiv Shopify-rabattkod: ${code} (${amount} ${currency})`,
      redeemShopifyDiscountBtn: 'Lös in i kassan',
      shopifyDiscountRedeemedAlert: 'Shopify-rabattkoden har lösts in och förbrukats!',
    },
    bonusSettings: {
      section1Title: '1. Butik & Kassaläge',
      storeNameLabel: 'Butikens namn (syns i SMS till kund):',
      storeNamePlaceholder: 't.ex. Café Hörnan',
      posModeLabel: 'Hur vill du använda kassan?',
      quickModeTitle: 'Snabbläge',
      quickModeDesc: 'Slå bara in telefonnummer & ge stämpel/belopp direkt (ingen varukorg)',
      articlesModeTitle: 'Artikelläge',
      articlesModeDesc: 'Välj varor från kategorier eller scanna streckkod till varukorg',
      section2Title: '2. Bonusmodell',
      section2Helper:
        'Välj om dina kunder samlar stämplar (t.ex. var 10:e gratis) eller poäng baserat på köpesumma.',
      stampCardTitle: 'Stämpelkort',
      stampCardDesc: 'Samla antal stämplar (t.ex. 10 st = 1 gratis)',
      pointsTitle: 'Poäng / Belopp',
      pointsDesc: (currency) => `Handla för ett belopp (t.ex. 1000 ${currency} = 100 ${currency} rabatt)`,
      stampsThresholdLabel: 'Antal stämplar för fullt kort:',
      stampsRewardDescLabel: 'Vad får kunden när kortet är fullt? (beskrivning i SMS & kassa):',
      stampsRewardDescPlaceholder: 't.ex. 1 valfri kaffe / 1 gratis klippning',
      stampsDiscountValueLabel: (currency) =>
        `Rabattvärde i ${currency} vid inlösen i varukorg (valfritt):`,
      pointsThresholdLabel: (currency) => `Gräns för bonus (${currency}):`,
      pointsRewardLabel: (currency) => `Bonus att ge i rabatt (${currency}):`,
      section3Title: '3. SMS-mall vid vanligt besök',
      section3Helper:
        'Anpassa meddelandet som skickas till kunden. Tryck på en knapp nedan för att lägga till automatisk uppgift i texten:',
      availableTagsLabel: 'Tillgängliga taggar:',
      andWord: 'och',
      purchaseTemplatePlaceholder: 'Skriv SMS-mallen...',
      resetTemplateBtn: 'Återställ till standardmall',
      previewLabel: 'Förhandsgranskning:',
      section4Title: '4. SMS-mall vid uppnådd bonus',
      section4Helper:
        'Skickas när kunden fyller sitt kort eller når en ny bonusnivå. Tryck på en knapp för att infoga uppgift:',
      bonusTemplatePlaceholder: 'Skriv SMS-mallen vid uppnådd bonus...',
      saveAllBtn: 'Spara alla inställningar',
      savedTitle: 'Sparat!',
      savedMsg: 'Butiksprofilen, kassaläget och bonusreglerna har uppdaterats.',
      saveErrorMsg: 'Kunde inte spara inställningar: ',
      tabSettings: 'Inställningar',
      tabOutreach: 'Utskick & SMS',
      outreachFilterTitle: '1. Välj målgrupp',
      outreachFilterHelper:
        'Välj vilka kunder du vill skicka SMS till. Varje kund får ett eget SMS med sitt aktuella saldo.',
      filterAllTitle: 'Alla kunder',
      filterAllDesc: 'Kampanjer, nyheter & events',
      filterHasBonusTitle: 'Har bonus att hämta',
      filterHasBonusDesc: 'Påminn om outnyttjad bonus',
      filterCloseToBonusTitle: 'Nära bonus',
      filterCloseToBonusDesc: 'Bara lite kvar till belöning',
      outreachMessageTitle: '2. Meddelande',
      outreachMessageHelper:
        'Skriv ditt meddelande eller utgå från mallen nedan. Tryck på en tagg för att infoga kundens uppgifter:',
      defaultCampaignMsg:
        'Hej! Nu händer det grejer hos {butik}! Varmt välkommen in till oss.',
      defaultReminderHasBonusMsg:
        'Hej! Vi vill bara påminna om att du har en bonus ({bonus}) att hämta ut hos {butik}. Varmt välkommen in!',
      defaultReminderCloseMsg:
        'Hej! Du har nu {saldo} hos {butik} och har bara {kvar_till_bonus} kvar till din bonus ({bonus}). Välkommen in!',
      includeOptOutLabel: 'Lägg till "Svara STOPP för att avregistrera"',
      optOutFooter: (storeName) =>
        `\n\nSvara STOPP om du inte vill ha fler utskick från ${storeName}.`,
      outreachQueueTitle: (count) =>
        count === 1
          ? '3. Snabbkö för utskick (1 kund)'
          : `3. Snabbkö för utskick (${count} kunder)`,
      outreachQueueHelper:
        'Öppnar SMS-appen för en kund i taget med kundens aktuella saldo.',
      sendNextBtn: (nextIndex, total, phone) =>
        `Skicka nästa (${nextIndex}/${total}) • ${phone}`,
      allSentBadge: 'Alla kunder i urvalet har fått SMS!',
      resetQueueBtn: 'Börja om utskickskön',
      emptyFilterCustomers: 'Inga registrerade kunder matchar det valda filtret ännu.',
      customerSentStatus: 'Skickad',
      customerSendSingleBtn: 'Öppna SMS',
      customerBonusReadyBadge: (count) => `${count} bonus klar`,
      searchQueuePlaceholder: 'Sök telefonnummer...',
      stopBtnLabel: 'Spärra (STOPP)',
      unblockBtnLabel: 'Tillåt igen',
      showBlockedBtn: (count) => `Visa spärrade nummer (${count} st)`,
      hideBlockedBtn: 'Dölj spärrade nummer',
      blockedCustomerBadge: 'Spärrad från utskick',
    },
    articles: {
      defaultCategory: 'Allmänt',
      searchPlaceholder: 'Sök artikel (namn, kategori, streckkod)...',
      cancelBtn: 'Avbryt',
      hideFormBtn: 'Dölj formulär',
      newArticleBtn: 'Ny artikel',
      editArticleTitle: 'Redigera artikel',
      addArticleTitle: 'Lägg till ny artikel',
      nameLabel: 'Namn på vara / tjänst *',
      namePlaceholder: 't.ex. Cappuccino, Lunchbuffé eller Klippning',
      priceLabel: (currency) => `Pris (${currency}) *`,
      categoryLabel: 'Kategori (valfri)',
      categoryPlaceholder: 't.ex. Kaffe, Bakverk, Behandlingar...',
      skuLabel: 'Streckkod / SKU (valfritt)',
      skuPlaceholder: 'Lämna tomt eller scanna streckkod',
      scanBtn: 'Scanna',
      updateArticleBtn: 'Uppdatera Artikel',
      saveArticleBtn: 'Spara Artikel',
      cancelEditBtn: 'Avbryt redigering',
      emptySearchText: 'Inga artiklar matchade din sökning.',
      emptyListText:
        'Inga artiklar sparade än. Klicka på "+ Ny artikel" om du vill använda Artikelläge i kassan.',
      categoryPrefix: 'Kategori:',
      editBtn: 'Redigera',
      deleteBtn: 'Ta bort',
      scanModalTitle: 'Scanna artikelns streckkod',
      scanModalSubtitle: 'Rikta kameran mot streckkoden på förpackningen',
      barcodeScannedTitle: 'Streckkod avläst!',
      barcodeScannedMsg: (code) => `SKU sattes till: ${code}`,
      missingInfoTitle: 'Info saknas',
      missingInfoMsg: 'Fyll i både artikelnamn och pris.',
      invalidPriceTitle: 'Felaktigt pris',
      invalidPriceMsg: 'Ange ett giltigt nummer för pris.',
      updatedTitle: 'Uppdaterad!',
      updatedMsg: 'Artikeln har sparats.',
      savedTitle: 'Sparat!',
      savedMsg: 'Ny artikel har lagts till.',
      deleteAlertTitle: 'Radera artikel',
      deleteAlertMsg: (name) => `Är du säker på att du vill ta bort "${name}"?`,
      deleteConfirmBtn: 'Ja, ta bort',
      deleteErrorTitle: 'Fel vid radering',
    },
    scanner: {
      defaultTitle: 'Scanna streckkod',
      defaultSubtitle: 'Rikta kameran mot streckkoden på produkten',
      loadingCamera: 'Laddar kameran...',
      permissionTitle: 'Kameraåtkomst behövs',
      permissionDesc:
        'För att scanna streckkoder med mobilen behöver appen tillgång till kameran.',
      allowCameraBtn: 'Tillåt kamera',
      cancelBtn: 'Avbryt',
      torchOn: 'Lampa: På',
      torchOff: 'Lampa: Av',
      closeBtn: 'Stäng',
    },
    shopify: {
      title: 'Shopify-integration',
      subTitle: 'Koppla din nätbutik för automatisk poängintjäning och online-rabattkoder',
      badgeActive: 'Ansluten & Aktiv',
      badgeInactive: 'Inaktiverad',
      badgeNotConfigured: 'Ej konfigurerad',
      sectionConnectTitle: '1. Anslutning & API-nycklar',
      sectionConnectDesc:
        'Skapa en Anpassad app (Custom App) i Shopify Admin (Inställningar > Appar och försäljningskanaler > Utveckla appar).',
      domainLabel: 'Shopify-domän (myshopify.com)',
      domainPlaceholder: 'din-butik.myshopify.com',
      tokenLabel: 'Admin API Access Token',
      tokenPlaceholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxx',
      secretLabel: 'Webhook Signing Secret',
      secretPlaceholder: 'shpss_xxxxxxxxxxxxxxxxxxxxxxxx',
      webhookUrlTitle: 'Webhook-adress för ordrar',
      webhookUrlHelper:
        'Skapa en webhook i Shopify Admin för ämnet "orders/paid" och klistra in denna URL:',
      copyUrlBtn: 'Kopiera URL',
      urlCopied: 'Webhook-URL kopierad till urklipp!',
      testBtn: 'Testa koppling',
      testing: 'Testar anslutning...',
      testSuccess: (shopName: string) => `Anslutning lyckades till "${shopName}"!`,
      testError: 'Kunde inte ansluta till Shopify. Kontrollera dina uppgifter.',
      saveBtn: 'Spara Shopify-inställningar',
      saving: 'Sparar...',
      savedSuccess: 'Shopify-inställningarna har sparats!',
      rulesTitle: '2. Poängregler & Artikelgrupper',
      rulesDesc: 'Välj hur poäng ska intjänas från online-köp och vilka varor som ger bonus.',
      consentTitle: 'Samtycke i kassan (Consent)',
      consentDesc: 'Hur appen hanterar kundens val i Shopifys kassa för marknadsföring:',
      consentRespect: 'Ge poäng men respektera samtycke för kampanjer (Standard)',
      consentRequire: 'Kräv aktivt samtycke för att ge bonuspoäng',
      consentAlways: 'Ge poäng och registrera alltid kunden',
      pointsRateLabel: (currency: string) => `Poäng per 1 ${currency} (standard: 1)`,
      productTypesFilterLabel: 'Begränsa till specifika artikelgrupper / produkttyper',
      productTypesFilterPlaceholder: 'T.ex. Kaffe, Tillbehör (kommaseparerat, tomt = alla)',
      productTypesFilterHelper:
        'Lämna tomt för att ge poäng på hela sortimentet. Skriv produkttyper separerade med komma för att begränsa.',
      discountPrefixLabel: 'Rabattkodsprefix vid uppnådd bonus',
      discountValidityLabel: 'Giltighetstid för rabattkod (dagar)',
      syncTitle: '3. Synka artiklar från Shopify',
      syncDesc: 'Importera eller uppdatera varor och kategorier från din Shopify-katalog till kassan.',
      syncBtn: 'Synka artiklar nu',
      syncing: 'Hämtar artiklar från Shopify...',
      syncSuccess: (count: number) => `Synkroniserade ${count} artiklar från Shopify!`,
      syncError: 'Kunde inte synka artiklar från Shopify.',
      tabConfig: 'Inställningar',
      tabDiscounts: 'Rabatter',
      tabOrders: 'Ordrar',
      emptyDiscounts: 'Inga genererade Shopify-rabattkoder än.',
      emptyOrders: 'Inga Shopify-ordrar mottagna än.',
      filterAll: 'Alla',
      filterActive: 'Aktiva',
      filterUsed: 'Förbrukade',
      codeCopied: 'Rabattkod kopierad!',
      expiresOn: (date: string) => `Giltig t.o.m. ${date}`,
      redeemedInOrder: (order: string) => `Inlöst i order ${order}`,
      inStoreRedeemBtn: 'Lös in i butik',
      inStoreRedeemConfirm: 'Är du säker på att du vill markera koden som förbrukad i kassan?',
      inStoreRedeemedSuccess: 'Rabattkoden har förbrukats i kassan!',
    },
    sms: {
      defaultStampPurchase:
        'Tack för ditt besök hos {butik}! Du har nu {saldo} och har bara {kvar_till_bonus} kvar till din bonus ({bonus}).',
      defaultStampBonus:
        'Tack för ditt besök hos {butik}! Grattis! Du har fyllt ditt stämpelkort och har en bonus ({bonus}) att hämta ut vid nästa besök!',
      defaultPointsPurchase:
        'Tack för ditt besök hos {butik}! Du har nu samlat {saldo} och har bara {kvar_till_bonus} kvar till din bonus ({bonus}).',
      defaultPointsBonus:
        'Tack för ditt besök hos {butik}! Grattis! Du har nått en ny bonusnivå ({bonus}) att nyttja vid ditt nästa köp!',
      stampSingular: 'stämpel',
      stampPlural: 'stämplar',
      ofWord: 'av',
      discountWord: 'rabatt',
      freeItemFallback: 'gratis vara',
      ourStoreFallback: 'vår butik',
      tagStore: '{butik}',
      tagBalance: '{saldo}',
      tagRemaining: '{kvar_till_bonus}',
      tagBonus: '{bonus}',
      tagStamps: '{stämplar}',
      tagAmount: '{köpesumma}',
      tagStoreLabel: 'Butikens namn',
      tagBalanceLabel: 'Kundens saldo',
      tagRemainingLabel: 'Kvar till bonus',
      tagBonusLabel: 'Bonusen',
      tagStampsLabel: 'Nya stämplar',
      tagAmountLabel: 'Köpesumma',
    },
  },
  en: {
    tabs: {
      pos: 'POS',
      settings: 'Settings',
      bonusSms: 'Bonus & SMS',
      articles: 'Items',
      app: 'App',
      shopify: 'Shopify',
    },
    appSettings: {
      themeTitle: 'Appearance (Theme)',
      themeHelper:
        'Choose whether the app is displayed in light mode, dark mode, or follows your device system settings.',
      lightLabel: 'Light',
      lightDesc: 'Classic light appearance',
      darkLabel: 'Dark',
      darkDesc: 'Easy on the eyes in low light',
      systemLabel: 'System',
      systemDesc: 'Follows device setting',
      languageTitle: 'Language',
      languageHelper: 'Select the language used across the app and for default SMS templates.',
      currencyTitle: 'Currency',
      currencyHelper: 'Choose the currency displayed for prices, purchase amounts, and point thresholds.',
      accountTitle: 'Account',
      accountHelper: 'Sign out of your current session or switch store account.',
      logoutBtn: 'Log out',
      logoutConfirmTitle: 'Log out',
      logoutConfirmMessage: 'Are you sure you want to log out of the register?',
      cancel: 'Cancel',
    },
    login: {
      subtitle: 'Digital stamp card & loyalty system for your store',
      registerTitle: 'Create new store account',
      loginTitle: 'Sign in to POS',
      storeNameLabel: 'Store name',
      storeNamePlaceholder: 'e.g. Corner Café or Salon Cut',
      emailLabel: 'Email address',
      emailPlaceholder: 'store@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters (A-Z, a-z, 0-9)',
      passwordHint: 'At least 8 characters with uppercase, lowercase, and a number',
      valStoreNameRequired: 'Store name must be at least 2 characters.',
      valEmailInvalid: 'Please enter a valid email address.',
      valPasswordRequired: 'Password is required.',
      valPasswordMinLength: 'Password must be at least 8 characters.',
      valPasswordUppercase: 'Password must contain at least one uppercase letter.',
      valPasswordLowercase: 'Password must contain at least one lowercase letter.',
      valPasswordNumber: 'Password must contain at least one number.',
      valOtpInvalid: 'The code must be 6 digits.',
      criteriaMinLength: 'At least 8 characters',
      criteriaUppercase: 'Uppercase letter (A-Z)',
      criteriaLowercase: 'Lowercase letter (a-z)',
      criteriaNumber: 'Number (0-9)',
      registerBtn: 'Create store & Sign in',
      loginBtn: 'Sign in',
      switchToLogin: 'Already have an account? Sign in here',
      switchToRegister: 'New store? Create a store account here',
      tabPassword: 'Password',
      tabMagicLink: 'Magic Link / Code',
      magicLinkTitle: 'Sign in with Link or Code',
      magicLinkSubtitle:
        'Enter your email address and we will send a sign-in link and a 6-digit code straight to your inbox.',
      sendMagicLinkBtn: 'Send login link / code',
      magicLinkSentTitle: 'Check your inbox!',
      magicLinkSentMsg:
        'We sent a link and code to your email. Tap the link on this device or enter the 6-digit code below.',
      otpLabel: '6-digit code from email',
      otpPlaceholder: 'e.g. 123456',
      verifyOtpBtn: 'Verify and Sign in',
      resendCodeBtn: 'Resend code',
      codeResentMsg: 'A new code has been sent to your email.',
      verifyTitle: 'Confirm your account',
      verifySubtitle:
        'Enter the 6-digit code sent to your email to activate your store account.',
      emailNotConfirmedTitle: 'Email not confirmed',
      emailNotConfirmedMsg:
        'Your store account requires email confirmation. Enter the 6-digit code from your email or click the link.',
      checkEmailInstruction:
        'Click the link in the email on this device or enter the 6-digit code here:',
      missingOtp: 'Please enter the 6-digit code from the email.',
      backToLogin: 'Back to sign in',
      openOtpVerification: 'Already got a code in your email? Tap here',
      supabaseNotConfiguredTitle: 'Supabase not configured yet',
      supabaseNotConfiguredMsg:
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/mobile/.env, or tap "Try Demo Mode" below to test the app right away!',
      missingCredentialsTitle: 'Missing details',
      missingCredentialsMsg: 'Please enter both email address and password.',
      missingStoreNameTitle: 'Missing store name',
      missingStoreNameMsg: 'Please enter the name of your store.',
      accountCreatedTitle: 'Account created!',
      accountCreatedMsg:
        'If email confirmation is enabled in Supabase, click the link in your email and then sign in.',
      authErrorTitle: 'Sign-in error',
      authErrorDefault: 'Something went wrong.',
      infoBannerTitle: 'Supabase is not connected yet',
      infoBannerText1: 'Create a',
      infoBannerText2: 'file in',
      infoBannerText3: 'with your Supabase keys and run',
      demoBtn: 'Try Demo Mode (saved locally on device)',
    },
    pos: {
      defaultStoreName: 'My Store',
      defaultRewardDesc: '1 free item',
      stampsBadge: 'Stamp Card',
      pointsBadge: 'Points',
      quickBadge: 'Quick Mode',
      articlesBadge: 'Item Mode',
      phonePlaceholder: 'Phone number...',
      searchCustomerBtn: 'Find Customer',
      enterPhoneTitle: 'Enter phone number',
      enterPhoneMsg: 'Please enter the customer phone number first.',
      searchErrorTitle: 'Search error',
      newCustomerBadge: 'New customer',
      existingCustomerBadge: 'Registered customer',
      gdprDeleteBtn: 'Delete customer (GDPR)',
      gdprAlertTitle: 'Delete customer (GDPR)',
      gdprAlertMsg:
        'Are you sure you want to delete this customer and all saved stamps/points? This cannot be undone.',
      gdprConfirmBtn: 'Yes, delete',
      cancel: 'Cancel',
      errorTitle: 'Error',
      deleteCustomerError: 'Could not delete customer: ',
      stampsProgressText: (current, threshold, remaining, reward) =>
        `${current} of ${threshold} stamps (${remaining} left to ${reward})`,
      pointsProgressText: (current, threshold, remaining, reward, currency) =>
        `${current} / ${threshold} ${currency} (${remaining} ${currency} left to ${reward} ${currency} bonus)`,
      bonusAvailableTitle: (count) => `Customer has ${count} bonus reward(s) to claim!`,
      redeemBonusBtn: (desc) => `Redeem 1 bonus (${desc})`,
      appliedBonusText: (count) => `${count} bonus selected to redeem`,
      undoBtn: 'Undo',
      howManyStampsTitle: 'How many stamps do you want to give?',
      stampSingular: 'stamp',
      stampPlural: 'stamps',
      enterPurchaseAmountTitle: (currency) => `Enter purchase amount (${currency})`,
      clearBtn: 'Clear',
      scanBarcodeBtn: 'Scan item barcode',
      scanModalTitle: 'Scan item',
      scanModalSubtitle: 'Point the camera at the product barcode',
      itemAddedTitle: 'Item added!',
      itemAddedMsg: (name, price) => `${name} (${price}) was added to the cart.`,
      itemNotFoundTitle: 'Item not found',
      itemNotFoundMsg: (code) =>
        `No item with barcode/SKU "${code}" was found.\n\nTip: Link the barcode under Settings > Items.`,
      allCategory: (count) => `All (${count})`,
      topSellersCategory: 'Top Sellers',
      emptyArticlesText:
        'No items found. Add items under Settings > Items, or switch to Quick Mode!',
      cartTitle: (count) => `Cart (${count}):`,
      clearCartBtn: 'Clear cart',
      redeemedBonusLabel: 'Redeemed bonus:',
      toRegisterStamps: (count) => `To register: +${count} stamp(s)`,
      totalWithStamps: (total, stamps) => `Total: ${total} (+${stamps} stamps)`,
      totalAmount: (total) => `Total: ${total}`,
      checkoutStampsBtn: 'Register Stamp & Send SMS',
      checkoutPointsBtn: 'Complete Purchase & Send SMS',
      missingPhoneTitle: 'Phone number missing',
      missingPhoneMsg: 'Please enter the customer phone number first.',
      nothingToRegisterTitle: 'Nothing to register',
      nothingToRegisterArticles: 'Select at least one item or redeem a bonus.',
      nothingToRegisterStamps: 'Select at least 1 stamp or redeem a bonus.',
      nothingToRegisterPoints: 'Enter a purchase amount or redeem a bonus.',
      newBonusTitle: 'New Bonus Reached!',
      registeredTitle: 'Registered!',
      newBonusMsg: 'The customer reached a new bonus level!\n\nDo you want to send an SMS to the customer?',
      registeredMsg:
        'The purchase/stamp has been saved.\n\nDo you want to send a confirmation SMS to the customer?',
      noDoneBtn: 'No, done',
      yesOpenSmsBtn: 'Yes, open SMS',
      gdprSmsFooter: (storeName) =>
        `\n\nInfo: We save your number for the loyalty program at ${storeName}. Reply STOP to opt out.`,
      activeShopifyDiscount: (code, amount, currency) =>
        `Active Shopify coupon: ${code} (${amount} ${currency})`,
      redeemShopifyDiscountBtn: 'Redeem at counter',
      shopifyDiscountRedeemedAlert: 'Shopify coupon has been redeemed at counter!',
    },
    bonusSettings: {
      section1Title: '1. Store & POS Mode',
      storeNameLabel: 'Store name (shown in SMS to customer):',
      storeNamePlaceholder: 'e.g. Corner Café',
      posModeLabel: 'How do you want to use the register?',
      quickModeTitle: 'Quick Mode',
      quickModeDesc: 'Just enter phone number & give stamps/amount directly (no cart)',
      articlesModeTitle: 'Item Mode',
      articlesModeDesc: 'Select items from categories or scan barcode into cart',
      section2Title: '2. Bonus Model',
      section2Helper:
        'Choose whether customers collect stamps (e.g. every 10th free) or points based on purchase amount.',
      stampCardTitle: 'Stamp Card',
      stampCardDesc: 'Collect number of stamps (e.g. 10 = 1 free)',
      pointsTitle: 'Points / Amount',
      pointsDesc: (currency) => `Spend an amount (e.g. 1000 ${currency} = 100 ${currency} discount)`,
      stampsThresholdLabel: 'Number of stamps for a full card:',
      stampsRewardDescLabel: 'What does the customer get when the card is full? (shown in SMS & POS):',
      stampsRewardDescPlaceholder: 'e.g. 1 free coffee / 1 free haircut',
      stampsDiscountValueLabel: (currency) =>
        `Discount value in ${currency} when redeemed in cart (optional):`,
      pointsThresholdLabel: (currency) => `Bonus threshold (${currency}):`,
      pointsRewardLabel: (currency) => `Bonus discount amount (${currency}):`,
      section3Title: '3. SMS template for regular visit',
      section3Helper:
        'Customize the message sent to the customer. Tap a button below to insert dynamic details into the text:',
      availableTagsLabel: 'Available tags:',
      andWord: 'and',
      purchaseTemplatePlaceholder: 'Write SMS template...',
      resetTemplateBtn: 'Reset to default template',
      previewLabel: 'Preview:',
      section4Title: '4. SMS template when bonus is reached',
      section4Helper:
        'Sent when the customer fills their card or reaches a new bonus level. Tap a button to insert details:',
      bonusTemplatePlaceholder: 'Write SMS template for reached bonus...',
      saveAllBtn: 'Save all settings',
      savedTitle: 'Saved!',
      savedMsg: 'Store profile, POS mode, and bonus rules have been updated.',
      saveErrorMsg: 'Could not save settings: ',
      tabSettings: 'Settings',
      tabOutreach: 'Campaigns & SMS',
      outreachFilterTitle: '1. Select Audience',
      outreachFilterHelper:
        'Choose which customers to message. Each customer receives an individual SMS with their current balance.',
      filterAllTitle: 'All customers',
      filterAllDesc: 'Campaigns, news & events',
      filterHasBonusTitle: 'Has unclaimed bonus',
      filterHasBonusDesc: 'Remind about ready reward',
      filterCloseToBonusTitle: 'Close to bonus',
      filterCloseToBonusDesc: 'Almost at next reward',
      outreachMessageTitle: '2. Message',
      outreachMessageHelper:
        'Write your message or edit the suggested template below. Tap a tag to insert customer details:',
      defaultCampaignMsg:
        'Hi! Exciting things are happening at {store}! Welcome in.',
      defaultReminderHasBonusMsg:
        'Hi! Just a friendly reminder that you have a bonus ({bonus}) waiting for you at {store}. Welcome in!',
      defaultReminderCloseMsg:
        'Hi! You now have {balance} at {store} and only {remaining} left until your bonus ({bonus}). Welcome in!',
      includeOptOutLabel: 'Add "Reply STOP to opt out"',
      optOutFooter: (storeName) =>
        `\n\nReply STOP if you no longer wish to receive offers from ${storeName}.`,
      outreachQueueTitle: (count) =>
        count === 1
          ? '3. Quick-Send Queue (1 customer)'
          : `3. Quick-Send Queue (${count} customers)`,
      outreachQueueHelper:
        'Opens your SMS app for one customer at a time with their personal balance.',
      sendNextBtn: (nextIndex, total, phone) =>
        `Send next (${nextIndex}/${total}) • ${phone}`,
      allSentBadge: 'All customers in this selection have been messaged!',
      resetQueueBtn: 'Reset send queue',
      emptyFilterCustomers: 'No registered customers match the selected filter yet.',
      customerSentStatus: 'Sent',
      customerSendSingleBtn: 'Open SMS',
      customerBonusReadyBadge: (count) => `${count} bonus ready`,
      searchQueuePlaceholder: 'Search phone number...',
      stopBtnLabel: 'Block (STOP)',
      unblockBtnLabel: 'Allow again',
      showBlockedBtn: (count) => `Show blocked numbers (${count})`,
      hideBlockedBtn: 'Hide blocked numbers',
      blockedCustomerBadge: 'Blocked from campaigns',
    },
    articles: {
      defaultCategory: 'General',
      searchPlaceholder: 'Search item (name, category, barcode)...',
      cancelBtn: 'Cancel',
      hideFormBtn: 'Hide form',
      newArticleBtn: 'New item',
      editArticleTitle: 'Edit item',
      addArticleTitle: 'Add new item',
      nameLabel: 'Item / service name *',
      namePlaceholder: 'e.g. Cappuccino, Lunch buffet or Haircut',
      priceLabel: (currency) => `Price (${currency}) *`,
      categoryLabel: 'Category (optional)',
      categoryPlaceholder: 'e.g. Coffee, Pastries, Treatments...',
      skuLabel: 'Barcode / SKU (optional)',
      skuPlaceholder: 'Leave empty or scan barcode',
      scanBtn: 'Scan',
      updateArticleBtn: 'Update Item',
      saveArticleBtn: 'Save Item',
      cancelEditBtn: 'Cancel editing',
      emptySearchText: 'No items matched your search.',
      emptyListText:
        'No items saved yet. Tap "+ New item" if you want to use Item Mode in the register.',
      categoryPrefix: 'Category:',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      scanModalTitle: 'Scan item barcode',
      scanModalSubtitle: 'Point the camera at the barcode on the package',
      barcodeScannedTitle: 'Barcode scanned!',
      barcodeScannedMsg: (code) => `SKU set to: ${code}`,
      missingInfoTitle: 'Missing info',
      missingInfoMsg: 'Please enter both item name and price.',
      invalidPriceTitle: 'Invalid price',
      invalidPriceMsg: 'Please enter a valid number for the price.',
      updatedTitle: 'Updated!',
      updatedMsg: 'The item has been saved.',
      savedTitle: 'Saved!',
      savedMsg: 'New item has been added.',
      deleteAlertTitle: 'Delete item',
      deleteAlertMsg: (name) => `Are you sure you want to delete "${name}"?`,
      deleteConfirmBtn: 'Yes, delete',
      deleteErrorTitle: 'Error deleting item',
    },
    scanner: {
      defaultTitle: 'Scan barcode',
      defaultSubtitle: 'Point the camera at the product barcode',
      loadingCamera: 'Loading camera...',
      permissionTitle: 'Camera access needed',
      permissionDesc:
        'To scan barcodes with your phone, the app needs access to the camera.',
      allowCameraBtn: 'Allow camera',
      cancelBtn: 'Cancel',
      torchOn: 'Torch: On',
      torchOff: 'Torch: Off',
      closeBtn: 'Close',
    },
    shopify: {
      title: 'Shopify Integration',
      subTitle: 'Connect your online store for automatic loyalty points and discount codes',
      badgeActive: 'Connected & Active',
      badgeInactive: 'Disabled',
      badgeNotConfigured: 'Not configured',
      sectionConnectTitle: '1. Connection & API Credentials',
      sectionConnectDesc:
        'Create a Custom App in Shopify Admin (Settings > Apps and sales channels > Develop apps).',
      domainLabel: 'Shopify Domain (myshopify.com)',
      domainPlaceholder: 'your-store.myshopify.com',
      tokenLabel: 'Admin API Access Token',
      tokenPlaceholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxx',
      secretLabel: 'Webhook Signing Secret',
      secretPlaceholder: 'shpss_xxxxxxxxxxxxxxxxxxxxxxxx',
      webhookUrlTitle: 'Webhook URL for Orders',
      webhookUrlHelper:
        'Create a webhook in Shopify Admin for the topic "orders/paid" and paste this URL:',
      copyUrlBtn: 'Copy URL',
      urlCopied: 'Webhook URL copied to clipboard!',
      testBtn: 'Test Connection',
      testing: 'Testing connection...',
      testSuccess: (shopName: string) => `Successfully connected to "${shopName}"!`,
      testError: 'Could not connect to Shopify. Check your credentials.',
      saveBtn: 'Save Shopify Settings',
      saving: 'Saving...',
      savedSuccess: 'Shopify settings saved successfully!',
      rulesTitle: '2. Points Rules & Product Categories',
      rulesDesc: 'Choose how points are earned from online orders and which products qualify.',
      consentTitle: 'Marketing Consent in Checkout',
      consentDesc: 'How the app handles customer opt-in in Shopify checkout:',
      consentRespect: 'Award points but respect marketing consent for campaigns (Default)',
      consentRequire: 'Require active marketing consent to earn points',
      consentAlways: 'Award points and always enroll customer',
      pointsRateLabel: (currency: string) => `Points per 1 ${currency} (default: 1)`,
      productTypesFilterLabel: 'Restrict to specific product categories / types',
      productTypesFilterPlaceholder: 'E.g. Coffee, Accessories (comma-separated, empty = all)',
      productTypesFilterHelper:
        'Leave empty to award points on all products. Enter comma-separated product types to restrict.',
      discountPrefixLabel: 'Discount code prefix when bonus reached',
      discountValidityLabel: 'Discount code validity (days)',
      syncTitle: '3. Sync Products from Shopify',
      syncDesc: 'Import or update products and categories from your Shopify catalog into the POS.',
      syncBtn: 'Sync Products Now',
      syncing: 'Fetching products from Shopify...',
      syncSuccess: (count: number) => `Successfully synced ${count} products from Shopify!`,
      syncError: 'Could not sync products from Shopify.',
      tabConfig: 'Settings',
      tabDiscounts: 'Discounts',
      tabOrders: 'Orders',
      emptyDiscounts: 'No Shopify discount codes generated yet.',
      emptyOrders: 'No Shopify orders received yet.',
      filterAll: 'All',
      filterActive: 'Active',
      filterUsed: 'Redeemed',
      codeCopied: 'Coupon code copied!',
      expiresOn: (date: string) => `Expires on ${date}`,
      redeemedInOrder: (order: string) => `Redeemed in order ${order}`,
      inStoreRedeemBtn: 'Redeem at counter',
      inStoreRedeemConfirm: 'Are you sure you want to mark this coupon as redeemed at the register?',
      inStoreRedeemedSuccess: 'Coupon marked as redeemed!',
    },
    sms: {
      defaultStampPurchase:
        'Thank you for visiting {store}! You now have {balance} and only {remaining} left until your bonus ({bonus}).',
      defaultStampBonus:
        'Thank you for visiting {store}! Congratulations! You have filled your stamp card and have a bonus ({bonus}) to claim on your next visit!',
      defaultPointsPurchase:
        'Thank you for visiting {store}! You have now collected {balance} and have only {remaining} left until your bonus ({bonus}).',
      defaultPointsBonus:
        'Thank you for visiting {store}! Congratulations! You have reached a new bonus level ({bonus}) to use on your next purchase!',
      stampSingular: 'stamp',
      stampPlural: 'stamps',
      ofWord: 'of',
      discountWord: 'discount',
      freeItemFallback: 'free item',
      ourStoreFallback: 'our store',
      tagStore: '{store}',
      tagBalance: '{balance}',
      tagRemaining: '{remaining}',
      tagBonus: '{bonus}',
      tagStamps: '{stamps}',
      tagAmount: '{amount}',
      tagStoreLabel: 'Store name',
      tagBalanceLabel: 'Customer balance',
      tagRemainingLabel: 'Left to bonus',
      tagBonusLabel: 'The bonus',
      tagStampsLabel: 'New stamps',
      tagAmountLabel: 'Purchase amount',
    },
  },
  de: {
    tabs: {
      pos: 'Kasse',
      settings: 'Einstellungen',
      bonusSms: 'Bonus & SMS',
      articles: 'Artikel',
      app: 'App',
      shopify: 'Shopify',
    },
    appSettings: {
      themeTitle: 'Darstellung (Design)',
      themeHelper:
        'Wählen Sie, ob die App im hellen Modus, dunklen Modus oder gemäß Ihrer Systemeinstellung angezeigt wird.',
      lightLabel: 'Hell',
      lightDesc: 'Klassisches helles Design',
      darkLabel: 'Dunkel',
      darkDesc: 'Angenehm bei wenig Licht',
      systemLabel: 'System',
      systemDesc: 'Folgt der Geräteeinstellung',
      languageTitle: 'Sprache',
      languageHelper: 'Wählen Sie die Sprache für die App und die Standard-SMS-Vorlagen.',
      currencyTitle: 'Währung',
      currencyHelper: 'Wählen Sie die Währung für Preise, Einkaufsbeträge und Punkteschwellen.',
      accountTitle: 'Konto',
      accountHelper: 'Beenden Sie Ihre aktuelle Sitzung oder wechseln Sie das Geschäftskonto.',
      logoutBtn: 'Abmelden',
      logoutConfirmTitle: 'Abmelden',
      logoutConfirmMessage: 'Möchten Sie sich wirklich von der Kasse abmelden?',
      cancel: 'Abbrechen',
    },
    login: {
      subtitle: 'Digitale Stempelkarte & Bonussystem für Ihr Geschäft',
      registerTitle: 'Neues Geschäftskonto erstellen',
      loginTitle: 'An der Kasse anmelden',
      storeNameLabel: 'Name des Geschäfts',
      storeNamePlaceholder: 'z. B. Café Ecke oder Salon Schnitt',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'laden@beispiel.de',
      passwordLabel: 'Passwort',
      passwordPlaceholder: 'Mindestens 8 Zeichen (A-Z, a-z, 0-9)',
      passwordHint: 'Mindestens 8 Zeichen mit Großbuchstabe, Kleinbuchstabe und Zahl',
      valStoreNameRequired: 'Der Geschäftsname muss mindestens 2 Zeichen lang sein.',
      valEmailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      valPasswordRequired: 'Passwort ist erforderlich.',
      valPasswordMinLength: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
      valPasswordUppercase: 'Das Passwort muss mindestens einen Großbuchstaben enthalten.',
      valPasswordLowercase: 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten.',
      valPasswordNumber: 'Das Passwort muss mindestens eine Zahl enthalten.',
      valOtpInvalid: 'Der Code muss aus 6 Ziffern bestehen.',
      criteriaMinLength: 'Mindestens 8 Zeichen',
      criteriaUppercase: 'Großbuchstabe (A-Z)',
      criteriaLowercase: 'Kleinbuchstabe (a-z)',
      criteriaNumber: 'Zahl (0-9)',
      registerBtn: 'Geschäft erstellen & Anmelden',
      loginBtn: 'Anmelden',
      switchToLogin: 'Bereits ein Konto? Hier anmelden',
      switchToRegister: 'Neues Geschäft? Hier Konto erstellen',
      tabPassword: 'Passwort',
      tabMagicLink: 'Magic Link / Code',
      magicLinkTitle: 'Mit Link oder Code anmelden',
      magicLinkSubtitle:
        'Geben Sie Ihre E-Mail-Adresse ein, um einen Anmeldelink und einen 6-stelligen Code direkt in Ihren Posteingang zu erhalten.',
      sendMagicLinkBtn: 'Anmeldelink / Code senden',
      magicLinkSentTitle: 'Posteingang prüfen!',
      magicLinkSentMsg:
        'Wir haben einen Link und Code an Ihre E-Mail gesendet. Tippen Sie auf den Link auf diesem Gerät oder geben Sie den 6-stelligen Code unten ein.',
      otpLabel: '6-stelliger Code aus der E-Mail',
      otpPlaceholder: 'z. B. 123456',
      verifyOtpBtn: 'Bestätigen und anmelden',
      resendCodeBtn: 'Code erneut senden',
      codeResentMsg: 'Ein neuer Code wurde an Ihre E-Mail gesendet.',
      verifyTitle: 'Konto bestätigen',
      verifySubtitle:
        'Geben Sie den 6-stelligen Code ein, um Ihr Geschäftskonto zu aktivieren.',
      emailNotConfirmedTitle: 'E-Mail nicht bestätigt',
      emailNotConfirmedMsg:
        'Ihr Konto erfordert eine E-Mail-Bestätigung. Geben Sie den 6-stelligen Code ein oder klicken Sie auf den Link in der E-Mail.',
      checkEmailInstruction:
        'Klicken Sie auf den Link in der E-Mail auf diesem Gerät oder geben Sie den Code hier ein:',
      missingOtp: 'Bitte geben Sie den 6-stelligen Code aus der E-Mail ein.',
      backToLogin: 'Zurück zur Anmeldung',
      openOtpVerification: 'Haben Sie bereits einen Bestätigungscode? Hier tippen',
      supabaseNotConfiguredTitle: 'Supabase noch nicht konfiguriert',
      supabaseNotConfiguredMsg:
        'Fügen Sie EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/mobile/.env ein oder tippen Sie unten auf „Demo-Modus testen“!',
      missingCredentialsTitle: 'Angaben fehlen',
      missingCredentialsMsg: 'Bitte geben Sie E-Mail-Adresse und Passwort ein.',
      missingStoreNameTitle: 'Geschäftsname fehlt',
      missingStoreNameMsg: 'Bitte geben Sie den Namen Ihres Geschäfts ein.',
      accountCreatedTitle: 'Konto erstellt!',
      accountCreatedMsg:
        'Falls die E-Mail-Bestätigung in Supabase aktiviert ist, klicken Sie auf den Link in Ihrer E-Mail und melden Sie sich danach an.',
      authErrorTitle: 'Anmeldefehler',
      authErrorDefault: 'Etwas ist schiefgelaufen.',
      infoBannerTitle: 'Supabase ist noch nicht verbunden',
      infoBannerText1: 'Erstellen Sie eine',
      infoBannerText2: '-Datei in',
      infoBannerText3: 'mit Ihren Supabase-Schlüsseln und führen Sie',
      demoBtn: 'Demo-Modus testen (wird lokal auf dem Gerät gespeichert)',
    },
    pos: {
      defaultStoreName: 'Mein Geschäft',
      defaultRewardDesc: '1 Gratis-Artikel',
      stampsBadge: 'Stempelkarte',
      pointsBadge: 'Punkte',
      quickBadge: 'Schnellmodus',
      articlesBadge: 'Artikelmodus',
      phonePlaceholder: 'Telefonnummer...',
      searchCustomerBtn: 'Kunde suchen',
      enterPhoneTitle: 'Telefonnummer eingeben',
      enterPhoneMsg: 'Bitte geben Sie zuerst die Telefonnummer des Kunden ein.',
      searchErrorTitle: 'Fehler bei der Suche',
      newCustomerBadge: 'Neuer Kunde',
      existingCustomerBadge: 'Registrierter Kunde',
      gdprDeleteBtn: 'Kunde löschen (DSGVO)',
      gdprAlertTitle: 'Kunde löschen (DSGVO)',
      gdprAlertMsg:
        'Möchten Sie diesen Kunden und alle gespeicherten Stempel/Punkte wirklich löschen? Dies kann nicht rückgängig gemacht werden.',
      gdprConfirmBtn: 'Ja, löschen',
      cancel: 'Abbrechen',
      errorTitle: 'Fehler',
      deleteCustomerError: 'Kunde konnte nicht gelöscht werden: ',
      stampsProgressText: (current, threshold, remaining, reward) =>
        `${current} von ${threshold} Stempeln (noch ${remaining} bis ${reward})`,
      pointsProgressText: (current, threshold, remaining, reward, currency) =>
        `${current} / ${threshold} ${currency} (noch ${remaining} ${currency} bis ${reward} ${currency} Bonus)`,
      bonusAvailableTitle: (count) => `Kunde hat ${count} Bonus-Prämie(n) einzulösen!`,
      redeemBonusBtn: (desc) => `1 Bonus einlösen (${desc})`,
      appliedBonusText: (count) => `${count} Bonus zum Einlösen ausgewählt`,
      undoBtn: 'Rückgängig',
      howManyStampsTitle: 'Wie viele Stempel möchten Sie vergeben?',
      stampSingular: 'Stempel',
      stampPlural: 'Stempel',
      enterPurchaseAmountTitle: (currency) => `Einkaufsbetrag eingeben (${currency})`,
      clearBtn: 'Löschen',
      scanBarcodeBtn: 'Artikel-Barcode scannen',
      scanModalTitle: 'Artikel scannen',
      scanModalSubtitle: 'Kamera auf den Barcode des Produkts richten',
      itemAddedTitle: 'Artikel hinzugefügt!',
      itemAddedMsg: (name, price) => `${name} (${price}) wurde zum Warenkorb hinzugefügt.`,
      itemNotFoundTitle: 'Artikel nicht gefunden',
      itemNotFoundMsg: (code) =>
        `Kein Artikel mit Barcode/SKU „${code}“ gefunden.\n\nTipp: Verknüpfen Sie den Barcode unter Einstellungen > Artikel.`,
      allCategory: (count) => `Alle (${count})`,
      topSellersCategory: 'Bestseller',
      emptyArticlesText:
        'Keine Artikel gefunden. Fügen Sie Artikel unter Einstellungen > Artikel hinzu oder wechseln Sie in den Schnellmodus!',
      cartTitle: (count) => `Warenkorb (${count}):`,
      clearCartBtn: 'Warenkorb leeren',
      redeemedBonusLabel: 'Eingelöster Bonus:',
      toRegisterStamps: (count) => `Zu erfassen: +${count} Stempel`,
      totalWithStamps: (total, stamps) => `Gesamt: ${total} (+${stamps} Stempel)`,
      totalAmount: (total) => `Gesamt: ${total}`,
      checkoutStampsBtn: 'Stempel erfassen & SMS senden',
      checkoutPointsBtn: 'Kauf abschließen & SMS senden',
      missingPhoneTitle: 'Telefonnummer fehlt',
      missingPhoneMsg: 'Bitte geben Sie zuerst die Telefonnummer des Kunden ein.',
      nothingToRegisterTitle: 'Nichts zu erfassen',
      nothingToRegisterArticles: 'Wählen Sie mindestens einen Artikel oder lösen Sie einen Bonus ein.',
      nothingToRegisterStamps: 'Wählen Sie mindestens 1 Stempel oder lösen Sie einen Bonus ein.',
      nothingToRegisterPoints: 'Geben Sie einen Einkaufsbetrag ein oder lösen Sie einen Bonus ein.',
      newBonusTitle: 'Neuer Bonus erreicht!',
      registeredTitle: 'Erfasst!',
      newBonusMsg: 'Der Kunde hat eine neue Bonusstufe erreicht!\n\nMöchten Sie eine SMS an den Kunden senden?',
      registeredMsg:
        'Der Einkauf/Stempel wurde gespeichert.\n\nMöchten Sie eine Bestätigungs-SMS an den Kunden senden?',
      noDoneBtn: 'Nein, fertig',
      yesOpenSmsBtn: 'Ja, SMS öffnen',
      gdprSmsFooter: (storeName) =>
        `\n\nInfo: Wir speichern Ihre Nummer für das Bonussystem bei ${storeName}. Antworten Sie mit STOP zum Abmelden.`,
      activeShopifyDiscount: (code, amount, currency) =>
        `Aktiver Shopify-Rabattcode: ${code} (${amount} ${currency})`,
      redeemShopifyDiscountBtn: 'An der Kasse einlösen',
      shopifyDiscountRedeemedAlert: 'Der Shopify-Gutschein wurde an der Kasse eingelöst!',
    },
    bonusSettings: {
      section1Title: '1. Geschäft & Kassenmodus',
      storeNameLabel: 'Name des Geschäfts (wird in SMS an Kunden angezeigt):',
      storeNamePlaceholder: 'z. B. Café Ecke',
      posModeLabel: 'Wie möchten Sie die Kasse nutzen?',
      quickModeTitle: 'Schnellmodus',
      quickModeDesc: 'Nur Telefonnummer eingeben & Stempel/Betrag direkt vergeben (kein Warenkorb)',
      articlesModeTitle: 'Artikelmodus',
      articlesModeDesc: 'Artikel aus Kategorien wählen oder Barcode in den Warenkorb scannen',
      section2Title: '2. Bonusmodell',
      section2Helper:
        'Wählen Sie, ob Ihre Kunden Stempel sammeln (z. B. jeder 10. gratis) oder Punkte basierend auf dem Einkaufsbetrag.',
      stampCardTitle: 'Stempelkarte',
      stampCardDesc: 'Anzahl Stempel sammeln (z. B. 10 Stk. = 1 gratis)',
      pointsTitle: 'Punkte / Betrag',
      pointsDesc: (currency) => `Für einen Betrag einkaufen (z. B. 1000 ${currency} = 100 ${currency} Rabatt)`,
      stampsThresholdLabel: 'Anzahl Stempel für eine volle Karte:',
      stampsRewardDescLabel: 'Was erhält der Kunde bei voller Karte? (Anzeige in SMS & Kasse):',
      stampsRewardDescPlaceholder: 'z. B. 1 Gratis-Kaffee / 1 Gratis-Haarschnitt',
      stampsDiscountValueLabel: (currency) =>
        `Rabattwert in ${currency} beim Einlösen im Warenkorb (optional):`,
      pointsThresholdLabel: (currency) => `Bonusschwelle (${currency}):`,
      pointsRewardLabel: (currency) => `Bonus-Rabattbetrag (${currency}):`,
      section3Title: '3. SMS-Vorlage bei normalem Besuch',
      section3Helper:
        'Passen Sie die Nachricht an den Kunden an. Tippen Sie unten auf eine Schaltfläche, um dynamische Angaben einzufügen:',
      availableTagsLabel: 'Verfügbare Platzhalter:',
      andWord: 'und',
      purchaseTemplatePlaceholder: 'SMS-Vorlage eingeben...',
      resetTemplateBtn: 'Auf Standardvorlage zurücksetzen',
      previewLabel: 'Vorschau:',
      section4Title: '4. SMS-Vorlage bei erreichtem Bonus',
      section4Helper:
        'Wird gesendet, wenn der Kunde seine Karte füllt oder eine neue Bonusstufe erreicht. Tippen Sie auf eine Schaltfläche zum Einfügen:',
      bonusTemplatePlaceholder: 'SMS-Vorlage für erreichten Bonus eingeben...',
      saveAllBtn: 'Alle Einstellungen speichern',
      savedTitle: 'Gespeichert!',
      savedMsg: 'Geschäftsprofil, Kassenmodus und Bonusregeln wurden aktualisiert.',
      saveErrorMsg: 'Einstellungen konnten nicht gespeichert werden: ',
      tabSettings: 'Einstellungen',
      tabOutreach: 'Kampagnen & SMS',
      outreachFilterTitle: '1. Zielgruppe wählen',
      outreachFilterHelper:
        'Wählen Sie aus, welchen Kunden Sie eine SMS senden möchten. Jeder Kunde erhält eine eigene SMS mit seinem aktuellen Guthaben.',
      filterAllTitle: 'Alle Kunden',
      filterAllDesc: 'Aktionen, Neuigkeiten & Events',
      filterHasBonusTitle: 'Bonus abholbereit',
      filterHasBonusDesc: 'An offenen Bonus erinnern',
      filterCloseToBonusTitle: 'Kurz vor Bonus',
      filterCloseToBonusDesc: 'Nur noch wenig bis zur Prämie',
      outreachMessageTitle: '2. Nachricht',
      outreachMessageHelper:
        'Schreiben Sie Ihre Nachricht oder passen Sie die Vorlage an. Tippen Sie auf einen Platzhalter, um Kundendaten einzufügen:',
      defaultCampaignMsg:
        'Hallo! Bei {laden} gibt es Neuigkeiten! Schauen Sie gerne vorbei.',
      defaultReminderHasBonusMsg:
        'Hallo! Wir möchten Sie daran erinnern, dass noch ein Bonus ({bonus}) bei {laden} auf Sie wartet. Herzlich willkommen!',
      defaultReminderCloseMsg:
        'Hallo! Sie haben jetzt {guthaben} bei {laden} und es fehlen nur noch {rest} bis zu Ihrem Bonus ({bonus}). Bis bald!',
      includeOptOutLabel: '„Antworten Sie mit STOP zum Abmelden“ anfügen',
      optOutFooter: (storeName) =>
        `\n\nAntworten Sie mit STOP, wenn Sie keine weiteren Nachrichten von ${storeName} wünschen.`,
      outreachQueueTitle: (count) =>
        count === 1
          ? '3. Warteschlange (1 Kunde)'
          : `3. Warteschlange (${count} Kunden)`,
      outreachQueueHelper:
        'Öffnet die SMS-App für jeweils einen Kunden mit persönlichem Guthaben.',
      sendNextBtn: (nextIndex, total, phone) =>
        `Nächster (${nextIndex}/${total}) • ${phone}`,
      allSentBadge: 'Alle Kunden in dieser Auswahl haben eine SMS erhalten!',
      resetQueueBtn: 'Warteschlange zurücksetzen',
      emptyFilterCustomers: 'Noch keine registrierten Kunden entsprechen dem gewählten Filter.',
      customerSentStatus: 'Gesendet',
      customerSendSingleBtn: 'SMS öffnen',
      customerBonusReadyBadge: (count) => `${count} Bonus bereit`,
      searchQueuePlaceholder: 'Telefonnummer suchen...',
      stopBtnLabel: 'Sperren (STOP)',
      unblockBtnLabel: 'Wieder erlauben',
      showBlockedBtn: (count) => `Gesperrte Nummern anzeigen (${count})`,
      hideBlockedBtn: 'Gesperrte Nummern ausblenden',
      blockedCustomerBadge: 'Für Kampagnen gesperrt',
    },
    articles: {
      defaultCategory: 'Allgemein',
      searchPlaceholder: 'Artikel suchen (Name, Kategorie, Barcode)...',
      cancelBtn: 'Abbrechen',
      hideFormBtn: 'Formular ausblenden',
      newArticleBtn: 'Neuer Artikel',
      editArticleTitle: 'Artikel bearbeiten',
      addArticleTitle: 'Neuen Artikel hinzufügen',
      nameLabel: 'Name der Ware / Dienstleistung *',
      namePlaceholder: 'z. B. Cappuccino, Mittagsbuffet oder Haarschnitt',
      priceLabel: (currency) => `Preis (${currency}) *`,
      categoryLabel: 'Kategorie (optional)',
      categoryPlaceholder: 'z. B. Kaffee, Gebäck, Behandlungen...',
      skuLabel: 'Barcode / SKU (optional)',
      skuPlaceholder: 'Leer lassen oder Barcode scannen',
      scanBtn: 'Scannen',
      updateArticleBtn: 'Artikel aktualisieren',
      saveArticleBtn: 'Artikel speichern',
      cancelEditBtn: 'Bearbeitung abbrechen',
      emptySearchText: 'Keine Artikel entsprachen Ihrer Suche.',
      emptyListText:
        'Noch keine Artikel gespeichert. Tippen Sie auf „+ Neuer Artikel“, um den Artikelmodus in der Kasse zu nutzen.',
      categoryPrefix: 'Kategorie:',
      editBtn: 'Bearbeiten',
      deleteBtn: 'Löschen',
      scanModalTitle: 'Artikel-Barcode scannen',
      scanModalSubtitle: 'Kamera auf den Barcode der Verpackung richten',
      barcodeScannedTitle: 'Barcode gescannt!',
      barcodeScannedMsg: (code) => `SKU wurde gesetzt auf: ${code}`,
      missingInfoTitle: 'Angaben fehlen',
      missingInfoMsg: 'Bitte geben Sie sowohl Artikelname als auch Preis ein.',
      invalidPriceTitle: 'Ungültiger Preis',
      invalidPriceMsg: 'Bitte geben Sie eine gültige Zahl für den Preis ein.',
      updatedTitle: 'Aktualisiert!',
      updatedMsg: 'Der Artikel wurde gespeichert.',
      savedTitle: 'Gespeichert!',
      savedMsg: 'Neuer Artikel wurde hinzugefügt.',
      deleteAlertTitle: 'Artikel löschen',
      deleteAlertMsg: (name) => `Möchten Sie „${name}“ wirklich löschen?`,
      deleteConfirmBtn: 'Ja, löschen',
      deleteErrorTitle: 'Fehler beim Löschen',
    },
    scanner: {
      defaultTitle: 'Barcode scannen',
      defaultSubtitle: 'Kamera auf den Barcode des Produkts richten',
      loadingCamera: 'Kamera wird geladen...',
      permissionTitle: 'Kamerazugriff erforderlich',
      permissionDesc:
        'Um Barcodes mit dem Smartphone zu scannen, benötigt die App Zugriff auf die Kamera.',
      allowCameraBtn: 'Kamera erlauben',
      cancelBtn: 'Abbrechen',
      torchOn: 'Licht: Ein',
      torchOff: 'Licht: Aus',
      closeBtn: 'Schließen',
    },
    shopify: {
      title: 'Shopify-Integration',
      subTitle: 'Verbinden Sie Ihren Onlineshop für automatische Bonuspunkte und Gutscheincodes',
      badgeActive: 'Verbunden & Aktiv',
      badgeInactive: 'Deaktiviert',
      badgeNotConfigured: 'Nicht konfiguriert',
      sectionConnectTitle: '1. Verbindung & API-Schlüssel',
      sectionConnectDesc:
        'Erstellen Sie eine benutzerdefinierte App im Shopify Admin (Einstellungen > Apps und Vertriebskanäle > Apps entwickeln).',
      domainLabel: 'Shopify-Domain (myshopify.com)',
      domainPlaceholder: 'ihr-shop.myshopify.com',
      tokenLabel: 'Admin-API-Zugriffstoken',
      tokenPlaceholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxx',
      secretLabel: 'Webhook-Signiergeheimnis',
      secretPlaceholder: 'shpss_xxxxxxxxxxxxxxxxxxxxxxxx',
      webhookUrlTitle: 'Webhook-URL für Bestellungen',
      webhookUrlHelper:
        'Erstellen Sie einen Webhook im Shopify Admin für das Thema "orders/paid" und fügen Sie diese URL ein:',
      copyUrlBtn: 'URL kopieren',
      urlCopied: 'Webhook-URL in Zwischenablage kopiert!',
      testBtn: 'Verbindung testen',
      testing: 'Verbindung wird getestet...',
      testSuccess: (shopName: string) => `Erfolgreich mit "${shopName}" verbunden!`,
      testError: 'Verbindung zu Shopify fehlgeschlagen. Überprüfen Sie Ihre Daten.',
      saveBtn: 'Shopify-Einstellungen speichern',
      saving: 'Speichern...',
      savedSuccess: 'Shopify-Einstellungen erfolgreich gespeichert!',
      rulesTitle: '2. Punkteregeln & Produktkategorien',
      rulesDesc: 'Legen Sie fest, wie Punkte für Online-Bestellungen gesammelt werden und welche Artikel zählen.',
      consentTitle: 'Marketing-Einwilligung im Checkout',
      consentDesc: 'Wie die App mit der Kundenauswahl im Shopify-Checkout umgeht:',
      consentRespect: 'Punkte vergeben, aber Einwilligung für Kampagnen respektieren (Standard)',
      consentRequire: 'Aktive Marketing-Einwilligung zum Sammeln von Punkten verlangen',
      consentAlways: 'Punkte vergeben und Kunden immer einschreiben',
      pointsRateLabel: (currency: string) => `Punkte pro 1 ${currency} (Standard: 1)`,
      productTypesFilterLabel: 'Auf bestimmte Produktkategorien beschränken',
      productTypesFilterPlaceholder: 'Z.B. Kaffee, Zubehör (kommagetrennt, leer = alle)',
      productTypesFilterHelper:
        'Leer lassen, um Punkte für das gesamte Sortiment zu vergeben. Kommagetrennte Produkttypen eingeben.',
      discountPrefixLabel: 'Gutscheincode-Präfix bei erreichtem Bonus',
      discountValidityLabel: 'Gutscheingültigkeit (Tage)',
      syncTitle: '3. Artikel aus Shopify synchronisieren',
      syncDesc: 'Artikel und Kategorien aus Ihrem Shopify-Katalog in die Kasse importieren.',
      syncBtn: 'Artikel jetzt synchronisieren',
      syncing: 'Artikel werden aus Shopify geladen...',
      syncSuccess: (count: number) => `${count} Artikel erfolgreich aus Shopify synchronisiert!`,
      syncError: 'Artikel konnten nicht aus Shopify synchronisiert werden.',
      tabConfig: 'Setup',
      tabDiscounts: 'Rabatte',
      tabOrders: 'Bestellungen',
      emptyDiscounts: 'Noch keine Shopify-Gutscheincodes generiert.',
      emptyOrders: 'Noch keine Shopify-Bestellungen empfangen.',
      filterAll: 'Alle',
      filterActive: 'Aktiv',
      filterUsed: 'Eingelöst',
      codeCopied: 'Gutscheincode kopiert!',
      expiresOn: (date: string) => `Gültig bis ${date}`,
      redeemedInOrder: (order: string) => `Eingelöst in Bestellung ${order}`,
      inStoreRedeemBtn: 'An der Kasse einlösen',
      inStoreRedeemConfirm: 'Möchten Sie diesen Gutscheincode wirklich an der Kasse als eingelöst markieren?',
      inStoreRedeemedSuccess: 'Gutscheincode an der Kasse eingelöst!',
    },
    sms: {
      defaultStampPurchase:
        'Danke für Ihren Besuch bei {laden}! Sie haben jetzt {guthaben} und es fehlen nur noch {rest} bis zu Ihrem Bonus ({bonus}).',
      defaultStampBonus:
        'Danke für Ihren Besuch bei {laden}! Glückwunsch! Ihre Stempelkarte ist voll und Sie haben einen Bonus ({bonus}) für Ihren nächsten Besuch!',
      defaultPointsPurchase:
        'Danke für Ihren Besuch bei {laden}! Sie haben jetzt {guthaben} gesammelt und es fehlen nur noch {rest} bis zu Ihrem Bonus ({bonus}).',
      defaultPointsBonus:
        'Danke für Ihren Besuch bei {laden}! Glückwunsch! Sie haben eine neue Bonusstufe ({bonus}) für Ihren nächsten Einkauf erreicht!',
      stampSingular: 'Stempel',
      stampPlural: 'Stempel',
      ofWord: 'von',
      discountWord: 'Rabatt',
      freeItemFallback: 'Gratis-Artikel',
      ourStoreFallback: 'unserem Geschäft',
      tagStore: '{laden}',
      tagBalance: '{guthaben}',
      tagRemaining: '{rest}',
      tagBonus: '{bonus}',
      tagStamps: '{stempel}',
      tagAmount: '{betrag}',
      tagStoreLabel: 'Geschäftsname',
      tagBalanceLabel: 'Kundenguthaben',
      tagRemainingLabel: 'Noch bis Bonus',
      tagBonusLabel: 'Der Bonus',
      tagStampsLabel: 'Neue Stempel',
      tagAmountLabel: 'Einkaufsbetrag',
    },
  },
  es: {
    tabs: {
      pos: 'Caja',
      settings: 'Ajustes',
      bonusSms: 'Bono y SMS',
      articles: 'Artículos',
      app: 'App',
      shopify: 'Shopify',
    },
    appSettings: {
      themeTitle: 'Apariencia (Tema)',
      themeHelper:
        'Elige si la aplicación se muestra en modo claro, modo oscuro o sigue la configuración del sistema de tu dispositivo.',
      lightLabel: 'Claro',
      lightDesc: 'Apariencia clara clásica',
      darkLabel: 'Oscuro',
      darkDesc: 'Cómodo con poca luz',
      systemLabel: 'Sistema',
      systemDesc: 'Sigue el ajuste del dispositivo',
      languageTitle: 'Idioma',
      languageHelper:
        'Selecciona el idioma que se usará en la aplicación y en las plantillas predeterminadas de SMS.',
      currencyTitle: 'Moneda',
      currencyHelper:
        'Elige la moneda que se mostrará para los precios, importes de compra y límites de puntos.',
      accountTitle: 'Cuenta',
      accountHelper: 'Cierra tu sesión actual o cambia de cuenta de tienda.',
      logoutBtn: 'Cerrar sesión',
      logoutConfirmTitle: 'Cerrar sesión',
      logoutConfirmMessage: '¿Estás seguro de que quieres cerrar sesión en la caja?',
      cancel: 'Cancelar',
    },
    login: {
      subtitle: 'Tarjeta de sellos digital y sistema de fidelización para tu tienda',
      registerTitle: 'Crear nueva cuenta de tienda',
      loginTitle: 'Iniciar sesión en la caja',
      storeNameLabel: 'Nombre de la tienda',
      storeNamePlaceholder: 'p. ej. Café Esquina o Salón Corte',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'tienda@ejemplo.es',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Mínimo 8 caracteres (A-Z, a-z, 0-9)',
      passwordHint: 'Mínimo 8 caracteres con mayúscula, minúscula y un número',
      valStoreNameRequired: 'El nombre de la tienda debe tener al menos 2 caracteres.',
      valEmailInvalid: 'Introduce un correo electrónico válido.',
      valPasswordRequired: 'La contraseña es obligatoria.',
      valPasswordMinLength: 'La contraseña debe tener al menos 8 caracteres.',
      valPasswordUppercase: 'La contraseña debe contener al menos una letra mayúscula.',
      valPasswordLowercase: 'La contraseña debe contener al menos una letra minúscula.',
      valPasswordNumber: 'La contraseña debe contener al menos un número.',
      valOtpInvalid: 'El código debe tener 6 dígitos.',
      criteriaMinLength: 'Mínimo 8 caracteres',
      criteriaUppercase: 'Mayúscula (A-Z)',
      criteriaLowercase: 'Minúscula (a-z)',
      criteriaNumber: 'Número (0-9)',
      registerBtn: 'Crear tienda e Iniciar sesión',
      loginBtn: 'Iniciar sesión',
      switchToLogin: '¿Ya tienes una cuenta? Inicia sesión aquí',
      switchToRegister: '¿Nueva tienda? Crea una cuenta aquí',
      tabPassword: 'Contraseña',
      tabMagicLink: 'Magic Link / Código',
      magicLinkTitle: 'Iniciar sesión con enlace o código',
      magicLinkSubtitle:
        'Introduce tu correo y te enviaremos un enlace de inicio de sesión y un código de 6 dígitos directo a tu bandeja de entrada.',
      sendMagicLinkBtn: 'Enviar enlace / código',
      magicLinkSentTitle: '¡Revisa tu correo!',
      magicLinkSentMsg:
        'Te hemos enviado un enlace y un código a tu correo. Toca el enlace en este dispositivo o introduce el código de 6 dígitos abajo.',
      otpLabel: 'Código de 6 dígitos del correo',
      otpPlaceholder: 'p. ej. 123456',
      verifyOtpBtn: 'Verificar e iniciar sesión',
      resendCodeBtn: 'Reenviar código',
      codeResentMsg: 'Se ha enviado un nuevo código a tu correo.',
      verifyTitle: 'Confirma tu cuenta',
      verifySubtitle:
        'Introduce el código de 6 dígitos enviado a tu correo para activar la cuenta de tu tienda.',
      emailNotConfirmedTitle: 'Correo no confirmado',
      emailNotConfirmedMsg:
        'Tu cuenta requiere confirmación por correo. Introduce el código de 6 dígitos o haz clic en el enlace del correo.',
      checkEmailInstruction:
        'Haz clic en el enlace del correo en este dispositivo o introduce el código de 6 dígitos aquí:',
      missingOtp: 'Por favor, introduce el código de 6 dígitos del correo.',
      backToLogin: 'Volver a iniciar sesión',
      openOtpVerification: '¿Ya tienes un código en tu correo? Toca aquí',
      supabaseNotConfiguredTitle: 'Supabase aún no configurado',
      supabaseNotConfiguredMsg:
        'Añade EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en apps/mobile/.env, ¡o pulsa "Probar modo Demo" abajo para probar la app ahora mismo!',
      missingCredentialsTitle: 'Faltan datos',
      missingCredentialsMsg: 'Por favor, introduce el correo electrónico y la contraseña.',
      missingStoreNameTitle: 'Falta el nombre de la tienda',
      missingStoreNameMsg: 'Por favor, introduce el nombre de tu tienda.',
      accountCreatedTitle: '¡Cuenta creada!',
      accountCreatedMsg:
        'Si la confirmación por correo está activada en Supabase, haz clic en el enlace de tu correo y luego inicia sesión.',
      authErrorTitle: 'Error de inicio de sesión',
      authErrorDefault: 'Algo salió mal.',
      infoBannerTitle: 'Supabase aún no está conectado',
      infoBannerText1: 'Crea un archivo',
      infoBannerText2: 'en',
      infoBannerText3: 'con tus claves de Supabase y ejecuta',
      demoBtn: 'Probar modo Demo (se guarda localmente en el dispositivo)',
    },
    pos: {
      defaultStoreName: 'Mi Tienda',
      defaultRewardDesc: '1 artículo gratis',
      stampsBadge: 'Sellos',
      pointsBadge: 'Puntos',
      quickBadge: 'Modo rápido',
      articlesBadge: 'Modo artículos',
      phonePlaceholder: 'Teléfono...',
      searchCustomerBtn: 'Buscar Cliente',
      enterPhoneTitle: 'Introducir teléfono',
      enterPhoneMsg: 'Por favor, introduce primero el número de teléfono del cliente.',
      searchErrorTitle: 'Error de búsqueda',
      newCustomerBadge: 'Nuevo cliente',
      existingCustomerBadge: 'Cliente registrado',
      gdprDeleteBtn: 'Eliminar cliente (RGPD)',
      gdprAlertTitle: 'Eliminar cliente (RGPD)',
      gdprAlertMsg:
        '¿Estás seguro de que quieres eliminar a este cliente y todos sus sellos/puntos guardados? Esta acción no se puede deshacer.',
      gdprConfirmBtn: 'Sí, eliminar',
      cancel: 'Cancelar',
      errorTitle: 'Error',
      deleteCustomerError: 'No se pudo eliminar el cliente: ',
      stampsProgressText: (current, threshold, remaining, reward) =>
        `${current} de ${threshold} sellos (faltan ${remaining} para ${reward})`,
      pointsProgressText: (current, threshold, remaining, reward, currency) =>
        `${current} / ${threshold} ${currency} (faltan ${remaining} ${currency} para bono de ${reward} ${currency})`,
      bonusAvailableTitle: (count) => `¡El cliente tiene ${count} bono(s) para canjear!`,
      redeemBonusBtn: (desc) => `Canjear 1 bono (${desc})`,
      appliedBonusText: (count) => `${count} bono(s) seleccionado(s) para canjear`,
      undoBtn: 'Deshacer',
      howManyStampsTitle: '¿Cuántos sellos quieres dar?',
      stampSingular: 'sello',
      stampPlural: 'sellos',
      enterPurchaseAmountTitle: (currency) => `Introducir importe de compra (${currency})`,
      clearBtn: 'Borrar',
      scanBarcodeBtn: 'Escanear código de barras',
      scanModalTitle: 'Escanear artículo',
      scanModalSubtitle: 'Apunta la cámara al código de barras del producto',
      itemAddedTitle: '¡Artículo añadido!',
      itemAddedMsg: (name, price) => `${name} (${price}) se añadió al carrito.`,
      itemNotFoundTitle: 'Artículo no encontrado',
      itemNotFoundMsg: (code) =>
        `No se encontró ningún artículo con el código/SKU "${code}".\n\nConsejo: Vincula el código en Ajustes > Artículos.`,
      allCategory: (count) => `Todos (${count})`,
      topSellersCategory: 'Más vendidos',
      emptyArticlesText:
        'No se encontraron artículos. ¡Añade productos en Ajustes > Artículos o cambia al Modo rápido!',
      cartTitle: (count) => `Carrito (${count}):`,
      clearCartBtn: 'Vaciar carrito',
      redeemedBonusLabel: 'Bono canjeado:',
      toRegisterStamps: (count) => `A registrar: +${count} sello(s)`,
      totalWithStamps: (total, stamps) => `Total: ${total} (+${stamps} sellos)`,
      totalAmount: (total) => `Total: ${total}`,
      checkoutStampsBtn: 'Registrar sello y Enviar SMS',
      checkoutPointsBtn: 'Completar compra y Enviar SMS',
      missingPhoneTitle: 'Falta el número de teléfono',
      missingPhoneMsg: 'Por favor, introduce primero el número de teléfono del cliente.',
      nothingToRegisterTitle: 'Nada que registrar',
      nothingToRegisterArticles: 'Selecciona al menos un artículo o canjea un bono.',
      nothingToRegisterStamps: 'Selecciona al menos 1 sello o canjea un bono.',
      nothingToRegisterPoints: 'Introduce un importe de compra o canjea un bono.',
      newBonusTitle: '¡Nuevo Bono Alcanzado!',
      registeredTitle: '¡Registrado!',
      newBonusMsg:
        '¡El cliente ha alcanzado un nuevo nivel de bono!\n\n¿Quieres enviar un SMS al cliente?',
      registeredMsg:
        'La compra/sello se ha guardado.\n\n¿Quieres enviar un SMS de confirmación al cliente?',
      noDoneBtn: 'No, listo',
      yesOpenSmsBtn: 'Sí, abrir SMS',
      gdprSmsFooter: (storeName) =>
        `\n\nInfo: Guardamos tu número para el programa de fidelización de ${storeName}. Responde STOP para darte de baja.`,
      activeShopifyDiscount: (code, amount, currency) =>
        `Cupón activo de Shopify: ${code} (${amount} ${currency})`,
      redeemShopifyDiscountBtn: 'Canjear en caja',
      shopifyDiscountRedeemedAlert: '¡El cupón de Shopify ha sido canjeado en caja!',
    },
    bonusSettings: {
      section1Title: '1. Tienda y Modo de Caja',
      storeNameLabel: 'Nombre de la tienda (visible en el SMS al cliente):',
      storeNamePlaceholder: 'p. ej. Café Esquina',
      posModeLabel: '¿Cómo quieres usar la caja?',
      quickModeTitle: 'Modo rápido',
      quickModeDesc: 'Solo introduce el teléfono y da sellos/importe directamente (sin carrito)',
      articlesModeTitle: 'Modo artículos',
      articlesModeDesc: 'Selecciona productos por categorías o escanea códigos de barras al carrito',
      section2Title: '2. Modelo de Bono',
      section2Helper:
        'Elige si tus clientes coleccionan sellos (p. ej. cada 10 gratis) o puntos basados en el importe de compra.',
      stampCardTitle: 'Tarjeta de sellos',
      stampCardDesc: 'Colecciona cantidad de sellos (p. ej. 10 = 1 gratis)',
      pointsTitle: 'Puntos / Importe',
      pointsDesc: (currency) => `Compra por un importe (p. ej. 1000 ${currency} = 100 ${currency} dto.)`,
      stampsThresholdLabel: 'Cantidad de sellos para completar la tarjeta:',
      stampsRewardDescLabel: '¿Qué recibe el cliente al completar la tarjeta? (en SMS y caja):',
      stampsRewardDescPlaceholder: 'p. ej. 1 café gratis / 1 corte gratis',
      stampsDiscountValueLabel: (currency) =>
        `Valor de descuento en ${currency} al canjear en el carrito (opcional):`,
      pointsThresholdLabel: (currency) => `Límite para bono (${currency}):`,
      pointsRewardLabel: (currency) => `Bono de descuento a otorgar (${currency}):`,
      section3Title: '3. Plantilla SMS para visita habitual',
      section3Helper:
        'Personaliza el mensaje enviado al cliente. Pulsa un botón abajo para insertar datos automáticos en el texto:',
      availableTagsLabel: 'Etiquetas disponibles:',
      andWord: 'y',
      purchaseTemplatePlaceholder: 'Escribe la plantilla de SMS...',
      resetTemplateBtn: 'Restablecer plantilla predeterminada',
      previewLabel: 'Vista previa:',
      section4Title: '4. Plantilla SMS al alcanzar un bono',
      section4Helper:
        'Se envía cuando el cliente completa su tarjeta o alcanza un nuevo bono. Pulsa un botón para insertar datos:',
      bonusTemplatePlaceholder: 'Escribe la plantilla de SMS al alcanzar bono...',
      saveAllBtn: 'Guardar todos los ajustes',
      savedTitle: '¡Guardado!',
      savedMsg: 'El perfil de la tienda, el modo de caja y las reglas de bono se han actualizado.',
      saveErrorMsg: 'No se pudieron guardar los ajustes: ',
      tabSettings: 'Ajustes',
      tabOutreach: 'Campañas y SMS',
      outreachFilterTitle: '1. Elegir destinatarios',
      outreachFilterHelper:
        'Elige a qué clientes quieres enviar un SMS. Cada cliente recibirá su propio SMS con su saldo actual.',
      filterAllTitle: 'Todos los clientes',
      filterAllDesc: 'Campañas, novedades y eventos',
      filterHasBonusTitle: 'Con bono disponible',
      filterHasBonusDesc: 'Recordar bono sin canjear',
      filterCloseToBonusTitle: 'Cerca del bono',
      filterCloseToBonusDesc: 'Falta poco para el premio',
      outreachMessageTitle: '2. Mensaje',
      outreachMessageHelper:
        'Escribe tu mensaje o usa la plantilla sugerida. Pulsa una etiqueta para insertar los datos del cliente:',
      defaultCampaignMsg:
        '¡Hola! ¡Tenemos novedades en {tienda}! Te esperamos.',
      defaultReminderHasBonusMsg:
        '¡Hola! Te recordamos que tienes un bono ({bonus}) listo para canjear en {tienda}. ¡Te esperamos!',
      defaultReminderCloseMsg:
        '¡Hola! Ahora tienes {saldo} en {tienda} y solo te faltan {restante} para tu bono ({bonus}). ¡Te esperamos!',
      includeOptOutLabel: 'Añadir "Responde STOP para darte de baja"',
      optOutFooter: (storeName) =>
        `\n\nResponde STOP si no deseas recibir más mensajes de ${storeName}.`,
      outreachQueueTitle: (count) =>
        count === 1
          ? '3. Cola de envío (1 cliente)'
          : `3. Cola de envío (${count} clientes)`,
      outreachQueueHelper:
        'Abre la app de SMS para un cliente a la vez con su saldo personal.',
      sendNextBtn: (nextIndex, total, phone) =>
        `Siguiente (${nextIndex}/${total}) • ${phone}`,
      allSentBadge: '¡Todos los clientes seleccionados han recibido su SMS!',
      resetQueueBtn: 'Reiniciar cola de envío',
      emptyFilterCustomers: 'Aún no hay clientes registrados que coincidan con este filtro.',
      customerSentStatus: 'Enviado',
      customerSendSingleBtn: 'Abrir SMS',
      customerBonusReadyBadge: (count) => `${count} bono listo`,
      searchQueuePlaceholder: 'Buscar teléfono...',
      stopBtnLabel: 'Bloquear (STOP)',
      unblockBtnLabel: 'Permitir de nuevo',
      showBlockedBtn: (count) => `Mostrar números bloqueados (${count})`,
      hideBlockedBtn: 'Ocultar números bloqueados',
      blockedCustomerBadge: 'Bloqueado para campañas',
    },
    articles: {
      defaultCategory: 'General',
      searchPlaceholder: 'Buscar artículo (nombre, categoría, código)...',
      cancelBtn: 'Cancelar',
      hideFormBtn: 'Ocultar formulario',
      newArticleBtn: 'Nuevo artículo',
      editArticleTitle: 'Editar artículo',
      addArticleTitle: 'Añadir nuevo artículo',
      nameLabel: 'Nombre del producto / servicio *',
      namePlaceholder: 'p. ej. Cappuccino, Menú del día o Corte de pelo',
      priceLabel: (currency) => `Precio (${currency}) *`,
      categoryLabel: 'Categoría (opcional)',
      categoryPlaceholder: 'p. ej. Café, Bollería, Tratamientos...',
      skuLabel: 'Código de barras / SKU (opcional)',
      skuPlaceholder: 'Dejar vacío o escanear código',
      scanBtn: 'Escanear',
      updateArticleBtn: 'Actualizar Artículo',
      saveArticleBtn: 'Guardar Artículo',
      cancelEditBtn: 'Cancelar edición',
      emptySearchText: 'Ningún artículo coincidió con tu búsqueda.',
      emptyListText:
        'Aún no hay artículos guardados. Pulsa "+ Nuevo artículo" si quieres usar el Modo artículos en la caja.',
      categoryPrefix: 'Categoría:',
      editBtn: 'Editar',
      deleteBtn: 'Eliminar',
      scanModalTitle: 'Escanear código del artículo',
      scanModalSubtitle: 'Apunta la cámara al código de barras del envase',
      barcodeScannedTitle: '¡Código escaneado!',
      barcodeScannedMsg: (code) => `SKU establecido en: ${code}`,
      missingInfoTitle: 'Falta información',
      missingInfoMsg: 'Completa tanto el nombre del artículo como el precio.',
      invalidPriceTitle: 'Precio no válido',
      invalidPriceMsg: 'Introduce un número válido para el precio.',
      updatedTitle: '¡Actualizado!',
      updatedMsg: 'El artículo ha sido guardado.',
      savedTitle: '¡Guardado!',
      savedMsg: 'Se ha añadido el nuevo artículo.',
      deleteAlertTitle: 'Eliminar artículo',
      deleteAlertMsg: (name) => `¿Estás seguro de que quieres eliminar "${name}"?`,
      deleteConfirmBtn: 'Sí, eliminar',
      deleteErrorTitle: 'Error al eliminar',
    },
    scanner: {
      defaultTitle: 'Escanear código de barras',
      defaultSubtitle: 'Apunta la cámara al código de barras del producto',
      loadingCamera: 'Cargando cámara...',
      permissionTitle: 'Se necesita acceso a la cámara',
      permissionDesc:
        'Para escanear códigos de barras con el móvil, la aplicación necesita acceso a la cámara.',
      allowCameraBtn: 'Permitir cámara',
      cancelBtn: 'Cancelar',
      torchOn: 'Linterna: Encendida',
      torchOff: 'Linterna: Apagada',
      closeBtn: 'Cerrar',
    },
    shopify: {
      title: 'Integración con Shopify',
      subTitle: 'Conecta tu tienda online para acumular puntos y generar cupones automáticamente',
      badgeActive: 'Conectado y Activo',
      badgeInactive: 'Desactivado',
      badgeNotConfigured: 'No configurado',
      sectionConnectTitle: '1. Conexión y Claves API',
      sectionConnectDesc:
        'Crea una App personalizada en Shopify Admin (Configuración > Aplicaciones y canales de venta > Desarrollar aplicaciones).',
      domainLabel: 'Dominio de Shopify (myshopify.com)',
      domainPlaceholder: 'tu-tienda.myshopify.com',
      tokenLabel: 'Token de acceso a la API de administración',
      tokenPlaceholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxx',
      secretLabel: 'Secreto de firma de Webhook',
      secretPlaceholder: 'shpss_xxxxxxxxxxxxxxxxxxxxxxxx',
      webhookUrlTitle: 'URL de Webhook para pedidos',
      webhookUrlHelper:
        'Crea un webhook en Shopify Admin para el tema "orders/paid" y pega esta URL:',
      copyUrlBtn: 'Copiar URL',
      urlCopied: '¡URL del webhook copiada al portapapeles!',
      testBtn: 'Probar conexión',
      testing: 'Probando conexión...',
      testSuccess: (shopName: string) => `¡Conexión exitosa con "${shopName}"!`,
      testError: 'No se pudo conectar a Shopify. Revisa tus credenciales.',
      saveBtn: 'Guardar configuración de Shopify',
      saving: 'Guardando...',
      savedSuccess: '¡Configuración de Shopify guardada con éxito!',
      rulesTitle: '2. Reglas de Puntos y Categorías',
      rulesDesc: 'Elige cómo se ganan los puntos en pedidos online y qué productos aplican.',
      consentTitle: 'Consentimiento de Marketing en el Checkout',
      consentDesc: 'Cómo maneja la app la elección del cliente en la pantalla de pago de Shopify:',
      consentRespect: 'Otorgar puntos pero respetar el consentimiento para campañas (Predeterminado)',
      consentRequire: 'Requerir consentimiento activo de marketing para ganar puntos',
      consentAlways: 'Otorgar puntos y registrar siempre al cliente',
      pointsRateLabel: (currency: string) => `Puntos por 1 ${currency} (predeterminado: 1)`,
      productTypesFilterLabel: 'Restringir a categorías de productos específicas',
      productTypesFilterPlaceholder: 'Ej. Café, Accesorios (separados por comas, vacío = todos)',
      productTypesFilterHelper:
        'Deja vacío para otorgar puntos en todos los productos. Escribe tipos de producto separados por comas.',
      discountPrefixLabel: 'Prefijo del código de descuento al alcanzar el bono',
      discountValidityLabel: 'Validez del cupón de descuento (días)',
      syncTitle: '3. Sincronizar artículos de Shopify',
      syncDesc: 'Importa o actualiza productos y categorías desde tu catálogo de Shopify al TPV.',
      syncBtn: 'Sincronizar artículos ahora',
      syncing: 'Obteniendo artículos de Shopify...',
      syncSuccess: (count: number) => `¡Se sincronizaron exitosamente ${count} artículos de Shopify!`,
      syncError: 'No se pudieron sincronizar los artículos de Shopify.',
      tabConfig: 'Ajustes',
      tabDiscounts: 'Cupones',
      tabOrders: 'Pedidos',
      emptyDiscounts: 'Aún no se han generado cupones de Shopify.',
      emptyOrders: 'Aún no se han recibido pedidos de Shopify.',
      filterAll: 'Todos',
      filterActive: 'Activos',
      filterUsed: 'Canjeados',
      codeCopied: '¡Código de cupón copiado!',
      expiresOn: (date: string) => `Válido hasta ${date}`,
      redeemedInOrder: (order: string) => `Canjeado en pedido ${order}`,
      inStoreRedeemBtn: 'Canjear en tienda',
      inStoreRedeemConfirm: '¿Estás seguro de que deseas marcar este cupón como canjeado en caja?',
      inStoreRedeemedSuccess: '¡Cupón de descuento canjeado en caja!',
    },
    sms: {
      defaultStampPurchase:
        '¡Gracias por tu visita a {tienda}! Ahora tienes {saldo} y solo te faltan {restante} para tu bono ({bonus}).',
      defaultStampBonus:
        '¡Gracias por tu visita a {tienda}! ¡Felicidades! Has completado tu tarjeta de sellos y tienes un bono ({bonus}) para canjear en tu próxima visita.',
      defaultPointsPurchase:
        '¡Gracias por tu visita a {tienda}! Ahora has acumulado {saldo} y solo te faltan {restante} para tu bono ({bonus}).',
      defaultPointsBonus:
        '¡Gracias por tu visita a {tienda}! ¡Felicidades! Has alcanzado un nuevo nivel de bono ({bonus}) para usar en tu próxima compra.',
      stampSingular: 'sello',
      stampPlural: 'sellos',
      ofWord: 'de',
      discountWord: 'de descuento',
      freeItemFallback: 'artículo gratis',
      ourStoreFallback: 'nuestra tienda',
      tagStore: '{tienda}',
      tagBalance: '{saldo}',
      tagRemaining: '{restante}',
      tagBonus: '{bonus}',
      tagStamps: '{sellos}',
      tagAmount: '{importe}',
      tagStoreLabel: 'Nombre de la tienda',
      tagBalanceLabel: 'Saldo del cliente',
      tagRemainingLabel: 'Falta para el bono',
      tagBonusLabel: 'El bono',
      tagStampsLabel: 'Nuevos sellos',
      tagAmountLabel: 'Importe de compra',
    },
  },
};

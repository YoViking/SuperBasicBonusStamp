export type LanguageCode = 'sv' | 'en';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export interface Translations {
  tabs: {
    pos: string;
    settings: string;
    bonusSms: string;
    articles: string;
    app: string;
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
    registerBtn: string;
    loginBtn: string;
    switchToLogin: string;
    switchToRegister: string;
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
      passwordPlaceholder: 'Minst 6 tecken',
      registerBtn: 'Skapa butik & Logga in',
      loginBtn: 'Logga in',
      switchToLogin: 'Har du redan ett konto? Logga in här',
      switchToRegister: 'Ny butik? Skapa ett butikskonto här',
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
      infoBannerTitle: '💡 Supabase är inte kopplat än',
      infoBannerText1: 'Skapa en',
      infoBannerText2: '-fil i',
      infoBannerText3: 'med dina nycklar från Supabase och kör',
      demoBtn: '🚀 Testa i Demo-läge (sparas lokalt på enheten)',
    },
    pos: {
      defaultStoreName: 'Min Butik',
      defaultRewardDesc: '1 gratis vara',
      stampsBadge: '⭐ Stämpelkort',
      pointsBadge: '💰 Poäng',
      quickBadge: '⚡ Snabbläge',
      articlesBadge: '🛒 Artikelläge',
      phonePlaceholder: 'Kundens telefonnummer...',
      searchCustomerBtn: 'Sök Kund',
      enterPhoneTitle: 'Ange telefonnummer',
      enterPhoneMsg: 'Skriv in kundens telefonnummer först.',
      searchErrorTitle: 'Fel vid sökning',
      newCustomerBadge: '✨ Ny kund',
      existingCustomerBadge: '👋 Registrerad kund',
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
      bonusAvailableTitle: (count) => `🎁 Kunden har ${count} st bonus att hämta ut!`,
      redeemBonusBtn: (desc) => `Utnyttja 1 bonus (${desc})`,
      appliedBonusText: (count) => `✓ ${count} st bonus vald att lösas in`,
      undoBtn: 'Ångra',
      howManyStampsTitle: 'Hur många stämplar vill du ge?',
      stampSingular: 'stämpel',
      stampPlural: 'stämplar',
      enterPurchaseAmountTitle: (currency) => `Ange köpesumma (${currency})`,
      clearBtn: 'Rensa',
      scanBarcodeBtn: '📷 Scanna streckkod på vara',
      scanModalTitle: 'Scanna vara',
      scanModalSubtitle: 'Rikta kameran mot streckkoden på produkten',
      itemAddedTitle: 'Vara tillagd!',
      itemAddedMsg: (name, price) => `${name} (${price}) lades till i varukorgen.`,
      itemNotFoundTitle: 'Vara hittades inte',
      itemNotFoundMsg: (code) =>
        `Ingen artikel med streckkod/SKU "${code}" hittades.\n\nTips: Koppla streckkoden under Inställningar > Artiklar.`,
      allCategory: (count) => `Alla (${count})`,
      topSellersCategory: '🔥 Toppsäljare',
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
      newBonusTitle: '🎉 Ny Bonus Uppnådd! 🎉',
      registeredTitle: 'Registrerat!',
      newBonusMsg: 'Kunden har nått en ny bonusnivå!\n\nVill du skicka ett SMS till kunden?',
      registeredMsg:
        'Köpet/stämpeln har sparats.\n\nVill du skicka ett bekräftelse-SMS till kunden?',
      noDoneBtn: 'Nej, klart',
      yesOpenSmsBtn: 'Ja, öppna SMS',
      gdprSmsFooter: (storeName) =>
        `\n\nInfo: Vi sparar ditt nummer för bonussystemet hos ${storeName}. Svara STOPP om du vill gå ur.`,
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
      availableTagsLabel: 'Tillgängliga taggar:',
      andWord: 'och',
      purchaseTemplatePlaceholder: 'Skriv SMS-mallen...',
      resetTemplateBtn: 'Återställ till standardmall',
      previewLabel: 'Förhandsgranskning:',
      section4Title: '4. SMS-mall vid uppnådd bonus',
      section4Helper: 'Skickas när kunden fyller sitt kort eller når en ny bonusnivå.',
      bonusTemplatePlaceholder: 'Skriv SMS-mallen vid uppnådd bonus...',
      saveAllBtn: 'Spara alla inställningar',
      savedTitle: 'Sparat!',
      savedMsg: 'Butiksprofilen, kassaläget och bonusreglerna har uppdaterats.',
      saveErrorMsg: 'Kunde inte spara inställningar: ',
    },
    articles: {
      defaultCategory: 'Allmänt',
      searchPlaceholder: '🔍 Sök artikel (namn, kategori, streckkod)...',
      cancelBtn: 'Avbryt',
      hideFormBtn: 'Dölj formulär',
      newArticleBtn: '＋ Ny artikel',
      editArticleTitle: 'Redigera artikel',
      addArticleTitle: 'Lägg till ny artikel',
      nameLabel: 'Namn på vara / tjänst *',
      namePlaceholder: 't.ex. Cappuccino, Lunchbuffé eller Klippning',
      priceLabel: (currency) => `Pris (${currency}) *`,
      categoryLabel: 'Kategori (valfri)',
      categoryPlaceholder: 't.ex. Kaffe, Bakverk, Behandlingar...',
      skuLabel: 'Streckkod / SKU (valfritt)',
      skuPlaceholder: 'Lämna tomt eller scanna streckkod',
      scanBtn: '📷 Scanna',
      updateArticleBtn: 'Uppdatera Artikel',
      saveArticleBtn: 'Spara Artikel',
      cancelEditBtn: 'Avbryt redigering',
      emptySearchText: 'Inga artiklar matchade din sökning.',
      emptyListText:
        'Inga artiklar sparade än. Klicka på "＋ Ny artikel" om du vill använda Artikelläge i kassan.',
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
      torchOn: '🔦 Lampa: På',
      torchOff: '💡 Lampa: Av',
      closeBtn: '✕ Stäng',
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
    },
  },
  en: {
    tabs: {
      pos: 'POS',
      settings: 'Settings',
      bonusSms: 'Bonus & SMS',
      articles: 'Items',
      app: 'App',
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
      passwordPlaceholder: 'At least 6 characters',
      registerBtn: 'Create store & Sign in',
      loginBtn: 'Sign in',
      switchToLogin: 'Already have an account? Sign in here',
      switchToRegister: 'New store? Create a store account here',
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
      infoBannerTitle: '💡 Supabase is not connected yet',
      infoBannerText1: 'Create a',
      infoBannerText2: 'file in',
      infoBannerText3: 'with your Supabase keys and run',
      demoBtn: '🚀 Try Demo Mode (saved locally on device)',
    },
    pos: {
      defaultStoreName: 'My Store',
      defaultRewardDesc: '1 free item',
      stampsBadge: '⭐ Stamp Card',
      pointsBadge: '💰 Points',
      quickBadge: '⚡ Quick Mode',
      articlesBadge: '🛒 Item Mode',
      phonePlaceholder: 'Customer phone number...',
      searchCustomerBtn: 'Find Customer',
      enterPhoneTitle: 'Enter phone number',
      enterPhoneMsg: 'Please enter the customer phone number first.',
      searchErrorTitle: 'Search error',
      newCustomerBadge: '✨ New customer',
      existingCustomerBadge: '👋 Registered customer',
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
      bonusAvailableTitle: (count) => `🎁 Customer has ${count} bonus reward(s) to claim!`,
      redeemBonusBtn: (desc) => `Redeem 1 bonus (${desc})`,
      appliedBonusText: (count) => `✓ ${count} bonus selected to redeem`,
      undoBtn: 'Undo',
      howManyStampsTitle: 'How many stamps do you want to give?',
      stampSingular: 'stamp',
      stampPlural: 'stamps',
      enterPurchaseAmountTitle: (currency) => `Enter purchase amount (${currency})`,
      clearBtn: 'Clear',
      scanBarcodeBtn: '📷 Scan item barcode',
      scanModalTitle: 'Scan item',
      scanModalSubtitle: 'Point the camera at the product barcode',
      itemAddedTitle: 'Item added!',
      itemAddedMsg: (name, price) => `${name} (${price}) was added to the cart.`,
      itemNotFoundTitle: 'Item not found',
      itemNotFoundMsg: (code) =>
        `No item with barcode/SKU "${code}" was found.\n\nTip: Link the barcode under Settings > Items.`,
      allCategory: (count) => `All (${count})`,
      topSellersCategory: '🔥 Top Sellers',
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
      newBonusTitle: '🎉 New Bonus Reached! 🎉',
      registeredTitle: 'Registered!',
      newBonusMsg: 'The customer reached a new bonus level!\n\nDo you want to send an SMS to the customer?',
      registeredMsg:
        'The purchase/stamp has been saved.\n\nDo you want to send a confirmation SMS to the customer?',
      noDoneBtn: 'No, done',
      yesOpenSmsBtn: 'Yes, open SMS',
      gdprSmsFooter: (storeName) =>
        `\n\nInfo: We save your number for the loyalty program at ${storeName}. Reply STOP to opt out.`,
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
      availableTagsLabel: 'Available tags:',
      andWord: 'and',
      purchaseTemplatePlaceholder: 'Write SMS template...',
      resetTemplateBtn: 'Reset to default template',
      previewLabel: 'Preview:',
      section4Title: '4. SMS template when bonus is reached',
      section4Helper: 'Sent when the customer fills their card or reaches a new bonus level.',
      bonusTemplatePlaceholder: 'Write SMS template for reached bonus...',
      saveAllBtn: 'Save all settings',
      savedTitle: 'Saved!',
      savedMsg: 'Store profile, POS mode, and bonus rules have been updated.',
      saveErrorMsg: 'Could not save settings: ',
    },
    articles: {
      defaultCategory: 'General',
      searchPlaceholder: '🔍 Search item (name, category, barcode)...',
      cancelBtn: 'Cancel',
      hideFormBtn: 'Hide form',
      newArticleBtn: '＋ New item',
      editArticleTitle: 'Edit item',
      addArticleTitle: 'Add new item',
      nameLabel: 'Item / service name *',
      namePlaceholder: 'e.g. Cappuccino, Lunch buffet or Haircut',
      priceLabel: (currency) => `Price (${currency}) *`,
      categoryLabel: 'Category (optional)',
      categoryPlaceholder: 'e.g. Coffee, Pastries, Treatments...',
      skuLabel: 'Barcode / SKU (optional)',
      skuPlaceholder: 'Leave empty or scan barcode',
      scanBtn: '📷 Scan',
      updateArticleBtn: 'Update Item',
      saveArticleBtn: 'Save Item',
      cancelEditBtn: 'Cancel editing',
      emptySearchText: 'No items matched your search.',
      emptyListText:
        'No items saved yet. Tap "＋ New item" if you want to use Item Mode in the register.',
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
      torchOn: '🔦 Torch: On',
      torchOff: '💡 Torch: Off',
      closeBtn: '✕ Close',
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
    },
  },
};

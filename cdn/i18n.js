const myPluralRules = {
    ru: (n) => {
            console.log("n:", n)
            const absN = Math.abs(n) % 100;
            const n1 = absN % 10;

            if (absN > 10 && absN < 20) return 0;  // 12 заводов, 17 фабрик
            if (n1 > 1 && n1 < 5)       return 2;  //  2 завода,  42 фабрики
            if (n1 == 1)                return 1;  //  1 завод,    1 фабрика
            /* else */                  return 0;  //  0 заводов, 27 фабрик
        },

    en: (c) => (c === 1 ? 0 : 1) // TODO.
};

// Реактивное хранилище (используем глобальный объект Vue)
const i18nState = Vue.reactive({
    locale: 'en',
    fb_locale: 'en',
    messages: {}
});

(async () => {
    const en = await import(`./i18n/en.js`) // load fallback locale
    const en_messages = en.default;
    i18nState.messages['en'] = en_messages;
})();

const min = Math.min;
const max = Math.max;
window.$t = function(key, value, params = {}) {
    const locale = i18nState.locale;
    const fb_locale = i18nState.fb_locale;
    const msg = i18nState.messages[locale][key] || i18nState.messages[fb_locale][key] || key;
    if (value == undefined)
        return msg;

    // разбираемся с падежами 
    const forms = Array.isArray(msg) ? msg : msg.split('|').map(s => s.trim());
    let text = forms.length == 0 ? forms
        : (forms[myPluralRules[locale](value)] || forms[0]);

    // Подставляем {n} и другие параметры
    const allParams = typeof value == "object" ? value : { n: value, ...params };
    for (let p in allParams) {
        text = text.replace(new RegExp(`{${p}}`, 'g'), allParams[p]);
    }

    return text;
};

// Функция смены языка
window.$setLocale = async function(locale) {
    console.log(`$setLocale(${locale})`)
    if (!i18nState.messages[locale]) {
        const module = await import(`./i18n/${locale}.js`)
        const messages = module.default;
        console.log("messages: ", messages)
        i18nState.messages[locale] = messages;
    }
    i18nState.locale = locale;
};


const pluralRules = {
    en: (c) => (c === 1 ? 0 : 1),
};

// Реактивное хранилище (используем глобальный объект Vue)
const i18n = Vue.reactive({
    locale: 'en',
    fb_locale: 'en',
    messages: {}
});

(async () => {
    // сразу дозагрузим английскую раскладку
    const en = await import(`./i18n/en.js`) // load fallback locale
    const en_messages = en.default;
    i18n.messages['en'] = en_messages;
})();

const min = Math.min;
const max = Math.max;
window.$t = function(key, value, params = {}) {
    const locale = i18n.locale;
    const messages = i18n.messages;
    const fbfb_locale = i18n.fb_locale;
    const fb_locale = messages[locale].fb_locale ?? fbfb_locale;

    const msg = messages[locale][key] ?? // есть перевод в текущей локали
                i18n.messages[fb_locale][key] ?? // фолбек локаль
                key; // перевод вообще не найден
    // если не нужна падежная подстановка
    if (value == undefined)
        return msg;

    // разбираемся с падежами 
    const forms = Array.isArray(msg) ? msg : msg.split('|').map(s => s.trim());
    let text = forms.length == 0 ? forms
        : (forms[pluralRules[locale](value)] ?? forms[0]);

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
    if (!i18n.messages[locale]) {
        const module = await import(`./i18n/${locale}.js`)
        const messages = module.default;
        i18n.messages[locale] = messages;
        console.log("messages: ", messages)

        const fb_locale = messages.fb_locale;
        const fbfb_locale = i18n.fb_locale;
        console.log("fb_locale: ", fb_locale)

        if (messages.fb_locale)
            await window.$setLocale(messages.fb_locale);

        pluralRules[locale] = pluralRules[locale] ??
                              messages.pluralRule ??
                              pluralRules[fb_locale] ??
                              pluralRules[fbfb_locale];
    }
    i18n.locale = locale;
};


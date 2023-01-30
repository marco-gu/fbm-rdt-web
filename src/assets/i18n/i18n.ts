import { createI18n } from "vue-i18n";
import en from "./en.json";
import zh from "./zh.json";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  legacy: false,
  globalInjection: true,
  messages: { en, zh },
});

export default i18n;

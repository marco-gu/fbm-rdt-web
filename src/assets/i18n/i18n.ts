import { createI18n } from "vue-i18n";
import en from "./en.json";
import zh from "./zh.json";
import da from "./da.json";
import ar from "./ar.json";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  legacy: false,
  globalInjection: true,
  messages: { en, zh, da, ar },
});

export default i18n;

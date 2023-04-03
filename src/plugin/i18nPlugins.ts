import { inject, provide, ref } from "vue";
import { I18nOptions } from "vue-i18n";

const createI18n = (config: any) => ({
  category: ref(config.category),
  locale: ref(config.locale),
  message: config.messages,
  globalInjection: true,
});

const i18nSymbol = Symbol();

export function provideI18n(i18nConfig: I18nOptions) {
  const i18n = createI18n(i18nConfig);
  provide(i18nSymbol, i18n);
}

export function useI18n(): any {
  const i18n = inject(i18nSymbol);
  if (!i18n) throw new Error("No i18n provided!");
  return i18n;
}

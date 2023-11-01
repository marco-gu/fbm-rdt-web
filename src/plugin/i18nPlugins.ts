import { inject, provide, ref } from "vue";

const createI18n = (config: any) => ({
  screenNm: ref(config.screenNm),
  locale: ref(config.locale),
  message: config.messages,
  $t(key: string) {
    return this.message[this.screenNm.value][this.locale.value][key];
  },
});

const i18nSymbol = Symbol();

export function provideI18n(i18nConfig: any) {
  const i18n = createI18n(i18nConfig);
  provide(i18nSymbol, i18n);
}

export function useI18n(): any {
  const i18n = inject(i18nSymbol);
  if (!i18n) throw new Error("No i18n provided!");
  return i18n;
}

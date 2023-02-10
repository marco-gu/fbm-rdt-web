import { Module } from "vuex";
import RootState from "../state";

export interface LanguageState {
  currentLang: string;
}

const languageModule: Module<LanguageState, RootState> = {
  state: {
    currentLang: "en",
  },
  getters: {
    getCurrentLanguage(state: any) {
      return state.currentLang;
    },
  },
  actions: {
    setCurrentLang(context: any, payload: string) {
      context.commit("setCurrentLang", payload);
    },
  },
  mutations: {
    setCurrentLang(state: LanguageState, payload: string) {
      state.currentLang = payload;
    },
  },
  namespaced: true,
};
export default languageModule;

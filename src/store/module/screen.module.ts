import { Module } from "vuex";
import RootState from "../state";

export interface ScreenState {
  screenHeight: number;
}

const screenModule: Module<ScreenState, RootState> = {
  state: {
    screenHeight: 0,
  },
  getters: {
    getScreenHeight(state: any) {
      alert(state.screenHeight);
      return state.screenHeight;
    },
  },
  actions: {
    saveScreenHeight(context: any, payload: any) {
      context.commit("setScreenHeight", payload);
    },
  },
  mutations: {
    setScreenHeight(state: any, payload: any) {
      state.screenHeight = payload.screenHeight;
    },
  },
  namespaced: true,
};
export default screenModule;

import { Module } from "vuex";
import RootState from "../state";

export interface ScreenState {
  screenHeight: number;
  softKeyStatus: boolean;
}

const screenModule: Module<ScreenState, RootState> = {
  state: {
    screenHeight: 0,
    softKeyStatus: false,
  },
  getters: {
    getScreenHeight(state: any) {
      return state.screenHeight;
    },
  },
  actions: {
    saveScreenHeight(context: any, payload: any) {
      context.commit("setScreenHeight", payload);
    },
    saveSoftKeyStatus(context: any, payload: any) {
      context.commit("setSoftKeyStatus", payload);
    },
  },
  mutations: {
    setScreenHeight(state: any, payload: any) {
      state.screenHeight = payload.screenHeight;
    },
    setSoftKeyStatus(state: any, payload: any) {
      state.softKeyStatus = payload.softKeyStatus;
    },
  },
  namespaced: true,
};
export default screenModule;

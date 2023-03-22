import { Module } from "vuex";
import RootState from "../state";

export interface CommonState {
  scanDevice: string;
  isLogin: boolean;
}

const commonModule: Module<CommonState, RootState> = {
  state: {
    scanDevice: "camera",
    isLogin: false,
  },
  getters: {
    getScanDevice(state: any) {
      return state.scanDevice;
    },
    getIsLogin(state: any) {
      return state.isLogin;
    },
  },
  actions: {
    setScanDevice(context: any, payload: string) {
      context.commit("setScanDevice", payload);
    },
    setIsLogin(context: any) {
      context.commit("setIsLogin");
    },
  },
  mutations: {
    setScanDevice(state: CommonState, payload: string) {
      state.scanDevice = payload;
    },
    setIsLogin(state: CommonState) {
      state.isLogin = true;
    },
  },
  namespaced: true,
};
export default commonModule;

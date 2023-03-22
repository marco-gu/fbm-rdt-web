import { Module } from "vuex";
import RootState from "../state";

export interface CommonState {
  scanDevice: string;
  isLogin: boolean;
  isAnimation: boolean;
}

const commonModule: Module<CommonState, RootState> = {
  state: {
    scanDevice: "camera",
    isLogin: false,
    isAnimation: true,
  },
  getters: {
    getScanDevice(state: any) {
      return state.scanDevice;
    },
    getIsLogin(state: any) {
      return state.isLogin;
    },
    getIsAnimation(state: any) {
      return state.isAnimation;
    },
  },
  actions: {
    setScanDevice(context: any, payload: string) {
      context.commit("setScanDevice", payload);
    },
    setIsLogin(context: any) {
      context.commit("setIsLogin");
    },
    setStopAnimation(context: any) {
      context.commit("setStopAnimation");
    },
  },
  mutations: {
    setScanDevice(state: CommonState, payload: string) {
      state.scanDevice = payload;
    },
    setIsLogin(state: CommonState) {
      state.isLogin = true;
    },
    setStopAnimation(state: CommonState) {
      state.isAnimation = false;
    },
  },
  namespaced: true,
};
export default commonModule;

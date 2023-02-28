import { Module } from "vuex";
import RootState from "../state";

export interface CommonState {
  scanDevice: string;
}

const commonModule: Module<CommonState, RootState> = {
  state: {
    scanDevice: "camera",
  },
  getters: {
    getScanDevice(state: any) {
      return state.scanDevice;
    },
  },
  actions: {
    setScanDevice(context: any, payload: string) {
      context.commit("setScanDevice", payload);
    },
  },
  mutations: {
    setScanDevice(state: CommonState, payload: string) {
      state.scanDevice = payload;
    },
  },
  namespaced: true,
};
export default commonModule;

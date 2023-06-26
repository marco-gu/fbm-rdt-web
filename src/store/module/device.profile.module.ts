import { Module } from "vuex";
import RootState from "../state";

export interface DeviceProfileState {
  deviceProfile: any;
}

const deviceProfileModule: Module<DeviceProfileState, RootState> = {
  state: {
    deviceProfile: {
      type: 1,
    },
  },
  actions: {
    saveDeviceProfile(context: any, payload: any) {
      context.commit("setDeviceProfile", payload);
    },
  },
  mutations: {
    setDeviceProfile(state: any, payload: any) {
      state.deviceProfile.type = payload;
    },
  },
  namespaced: true,
};
export default deviceProfileModule;

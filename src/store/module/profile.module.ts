import { Module } from "vuex";
import RootState from "../state";

export interface ProfileState {
  profile: any;
}

const profileModule: Module<ProfileState, RootState> = {
  state: {
    profile: {},
  },
  actions: {
    saveProfile(context: any, payload: any) {
      context.commit("setProfile", payload);
    },
  },
  mutations: {
    setProfile(state: any, payload: any) {
      state.profile = payload.profile;
    },
  },
  namespaced: true,
};
export default profileModule;

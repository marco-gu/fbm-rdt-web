
import { Module } from "vuex";
import RootState from "../state";

export interface CommonState {
}

const commonModule: Module<CommonState, RootState> = {
  namespaced: true,
};
export default commonModule;
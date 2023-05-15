import { TaskLPList } from "@/models/profile";
import { Module } from "vuex";
import RootState from "../state";

export interface LpState {
  taskLpList: TaskLPList[];
}

const LpModule: Module<LpState, RootState> = {
  state: {
    taskLpList: [],
  },
  actions: {
    saveTaskLps(context: any, payload: TaskLPList[]) {
      context.commit("setTaskLps", payload);
    },
  },
  mutations: {
    setTaskLps(state: LpState, payload: TaskLPList[]) {
      state.taskLpList = payload;
    },
  },
  namespaced: true,
};
export default LpModule;

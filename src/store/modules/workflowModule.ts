import { Module } from "vuex";
import RootState from "../state";
import { post } from "@/service/http";
import { EngineResponseDto } from "@/utils/process.render";

export interface WorkflowState {
  params: any[];
  sessionId: number;
  response: EngineResponseDto;
}
const workflowModule: Module<WorkflowState, RootState> = {
  state: {
    params: [],
    sessionId: 0,
    response: {} as EngineResponseDto,
  },
  actions: {
    addParam(context, payload) {
      context.commit("addParam", payload);
    },
    clearParam(context, payload) {
      context.commit("clearParam", payload);
    },
    onSubmit(context, payload) {
      const params = {
        sessionId: context.state.sessionId,
        actionKey: "Submit",
        countryAbbreviatedName: "GBR",
        capturedValues: [],
      };
      if (context.state.params.length > 0) {
        context.state.params.forEach((t: any) => {
          const temp = {
            attributeName: t.attributeName,
            dataType: "STRING",
            value: t.value,
          } as never;
          params.capturedValues.push(temp);
        });
      }
      const url = "";
      post(url, params).then((data) => {
        context.commit("onSubmit", data);
        context.commit("clearParam");
      });
    },
  },
  mutations: {
    addParam(state, payload) {
      state.params.push(payload);
    },
    clearParam(state, payload) {
      state.params = [];
    },
    onSubmit(state, payload) {
      state.response = payload;
      state.sessionId = payload.sessionId;
    },
  },
  namespaced: true,
};
export default workflowModule;

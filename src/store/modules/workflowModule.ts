import { Module } from "vuex";
import RootState from "../state";
import { get } from "@/service/http";
import { CapturedValue } from "@/entity/request.entity";
import { parseLineView, parseXML } from "@/utils/util.parse";
import { ScreenEntity, ScreenLineEntity } from "@/entity/screen.entity";

export interface WorkflowState {
  capturedValues: CapturedValue[];
  sessionID: number;
  screenTitle: string;
  screenEntity: ScreenEntity;
  linesView: Map<number, ScreenLineEntity>;
  isLoadingVisible: boolean;
  isRenderView: boolean;
}
const workflowModule: Module<WorkflowState, RootState> = {
  state: {
    capturedValues: [],
    sessionID: -1,
    screenTitle: "",
    screenEntity: {} as ScreenEntity,
    linesView: new Map() as Map<number, ScreenLineEntity>,
    isLoadingVisible: false,
    isRenderView: false,
  },
  actions: {
    saveCapturedValue(context, payload: CapturedValue) {
      context.commit("saveCapturedValue", payload);
    },
    onCancel(context) {
      context.state.isLoadingVisible = true;
      let url = "GBR?";
      context.state.capturedValues.forEach((cv: CapturedValue) => {
        url += cv.attributeName + "=" + cv.value + "&";
      });
      url += "type=Cancel";
      get(url, context.state.sessionID).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onSubmit(context) {
      context.state.isLoadingVisible = true;
      let url = "GBR?";
      context.state.capturedValues.forEach((cv: CapturedValue) => {
        url += cv.attributeName + "=" + cv.value + "&";
      });
      url += "type=Submit";
      get(url, context.state.sessionID).then((data) => {
        context.commit("onSubmit", data);
      });
    },
  },
  mutations: {
    saveRenderStatus(state, payload) {
      state.isRenderView = payload;
    },
    saveCapturedValue(state, payload: CapturedValue) {
      let newCapturedValue = true;
      state.capturedValues.forEach((capturedValue) => {
        if (capturedValue.attributeName == payload.attributeName) {
          capturedValue.value = payload.value;
          newCapturedValue = false;
        }
      });
      if (newCapturedValue) {
        state.capturedValues.push(payload);
      }
    },
    onSubmit(state, payload) {
      state.isLoadingVisible = false;
      const screenEntity = parseXML(payload);
      const map = parseLineView(screenEntity);
      state.linesView = map;
      state.screenTitle = screenEntity.screenTitle;
      state.capturedValues = screenEntity.capturedValues;
      state.isRenderView = true;
    },
    saveScreenEntity(state, payload) {
      state.screenEntity = payload;
      state.sessionID = payload.sessionID;
      state.screenTitle = payload.screenTitle;
      state.capturedValues = payload.capturedValues;
      // if (!localStorage.getItem("sessionID")) {
      //   localStorage.setItem("sessionID", payload.sessionID);
      //   localStorage.setItem("screenEntity", JSON.stringify(payload));
      // }
    },
  },
  namespaced: true,
};
export default workflowModule;

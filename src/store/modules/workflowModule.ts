import { Module } from "vuex";
import RootState from "../state";
import { get } from "@/service/http";
import { CapturedValue } from "@/entity/request.entity";
import { composeRowData, parseXML } from "@/utils/util.parse";
import { ScreenModel, ScreenLineEntity } from "@/entity/screen.entity";

export interface WorkflowState {
  screenModel: ScreenModel;
  capturedValues: CapturedValue[];
  sessionID: number;
  title: string;
  screenEntity: ScreenModel;
  rowsEntity: Map<number, ScreenLineEntity>;
  isLoadingVisible: boolean;
  isRenderView: boolean;
  isOptionShow: boolean;
  country: string;
  functionKeys: [];
}
const workflowModule: Module<WorkflowState, RootState> = {
  state: {
    screenModel: {} as ScreenModel,
    capturedValues: [],
    sessionID: -1,
    title: "",
    screenEntity: {} as ScreenModel,
    rowsEntity: new Map() as Map<number, ScreenLineEntity>,
    isLoadingVisible: false,
    isRenderView: false,
    isOptionShow: false,
    country: "",
    functionKeys: [],
  },
  actions: {
    saveCapturedValue(context, payload: CapturedValue) {
      context.commit("saveCapturedValue", payload);
    },
    onCancel(context) {
      context.state.isLoadingVisible = true;
      let url = context.state.country == "" ? "GBR" : context.state.country;
      url = url + "?";
      context.state.capturedValues.forEach((cv: CapturedValue) => {
        url += cv.attributeName + "=" + cv.value + "&";
      });
      url += "type=Cancel";
      get("RDTEngine/" + url, context.state.sessionID).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onSubmit(context) {
      context.state.isLoadingVisible = true;
      let url = context.state.country == "" ? "GBR" : context.state.country;
      url = url + "?";
      context.state.capturedValues.forEach((cv: CapturedValue) => {
        url += cv.attributeName + "=" + cv.value + "&";
      });
      url += "type=Submit";
      get("RDTEngine/" + url, context.state.sessionID).then((data) => {
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
      // const map = composeRowData(screenEntity);
      // state.rowsEntity = map;
      // state.title = screenEntity.title;
      // state.capturedValues = screenEntity.capturedValues;
      // state.sessionID = screenEntity.sessionID;
      state.isRenderView = true;
    },
    saveScreenEntity(state, payload) {
      state.screenEntity = payload;
      state.sessionID = payload.sessionID;
      state.title = payload.title;
      state.capturedValues = payload.capturedValues;
    },
    saveOptionsStatus(state, payload) {
      state.isOptionShow = payload;
    },
    saveCountry(state, payload) {
      state.country = payload;
      state.isOptionShow = false;
      state.capturedValues = [];
      state.sessionID = -1;
    },
    saveScreenModel(state, payload) {
      state.screenModel = payload;
    },
  },
  namespaced: true,
};
export default workflowModule;

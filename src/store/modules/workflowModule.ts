import { Module } from "vuex";
import RootState from "../state";
import { get, post } from "@/service/http";
import { CapturedValue, EngineRequset } from "@/entity/request.entity";
import { parseXML } from "@/utils/util.parse";
import { ScreenModel, ScreenLineEntity } from "@/entity/screen.entity";
import { UserSettingDto } from "@/entity/response.entity";
import { composeScreenData } from "@/utils/type3.parse";

export interface WorkflowState {
  screenModel: ScreenModel;
  capturedValues: CapturedValue[];
  sessionID: number;
  title: string;
  screenEntity: ScreenModel;
  rowsEntity: Map<number, ScreenLineEntity>;
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
      const request = {} as EngineRequset;
      request.sessionId = localStorage.getItem("sessionId") as string;
      request.countryAbbreviatedName = "GBR";
      request.actionKey = "Cancel";
      request.capturedValues = [];
      request.userSettingDto = {} as UserSettingDto;
      post("RDTEngine", request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onSubmit(context) {
      const request = {} as EngineRequset;
      request.sessionId = localStorage.getItem("sessionId") as string;
      request.countryAbbreviatedName = "GBR";
      request.actionKey = "Submit";
      request.capturedValues = [];
      request.userSettingDto = {} as UserSettingDto;
      context.state.capturedValues.forEach((cv: CapturedValue) => {
        const capturedValue = {} as CapturedValue;
        capturedValue.attributeName = cv.attributeName;
        capturedValue.value = cv.value;
        request.capturedValues.push(capturedValue);
      });
      post("RDTEngine", request).then((data) => {
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
      state.isRenderView = true;
      state.capturedValues = [];
      state.screenModel = composeScreenData(payload);
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

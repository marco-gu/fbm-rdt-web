import { Module } from "vuex";
import RootState from "../state";
import { post } from "@/service/http";
import { CapturedValue, EngineRequset } from "@/entity/request.entity";
import { parseXML } from "@/utils/util.parse";
import {
  ScreenModel,
  ScreenLineEntity,
  ActionKeyEnum,
} from "@/entity/screen.entity";
import { UserSettingDto } from "@/entity/response.entity";
import { composeScreenData } from "@/utils/type3.parse";

export interface WorkflowState {
  screenModel: ScreenModel;
  subFormModel: ScreenModel;
  rowsEntity: Map<number, ScreenLineEntity>;
  isRenderView: boolean;
  isSubFormShow: boolean;
}
const workflowModule: Module<WorkflowState, RootState> = {
  state: {
    screenModel: {} as ScreenModel,
    subFormModel: {} as ScreenModel,
    rowsEntity: new Map() as Map<number, ScreenLineEntity>,
    isRenderView: false,
    isSubFormShow: false,
  },
  actions: {
    saveCapturedValue(context, payload: CapturedValue) {
      context.commit("saveCapturedValue", payload);
    },
    onCancel(context) {
      const request = {} as EngineRequset;
      request.actionKey = ActionKeyEnum.CANCEL;
      request.capturedValues = [];
      request.userSettingDto = {} as UserSettingDto;
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onSubmit(context) {
      const request = {} as EngineRequset;
      request.actionKey = ActionKeyEnum.SUBMIT;
      request.capturedValues = [];
      request.userSettingDto = {} as UserSettingDto;
      context.state.screenModel.capturedValues.forEach((cv: CapturedValue) => {
        const capturedValue = {} as CapturedValue;
        capturedValue.attributeName = cv.attributeName;
        capturedValue.value = cv.value;
        request.capturedValues.push(capturedValue);
      });
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
  },
  mutations: {
    saveRenderStatus(state, payload) {
      state.isRenderView = payload;
    },
    saveCapturedValue(state, payload: CapturedValue) {
      state.screenModel.capturedValues.forEach((capturedValue) => {
        if (capturedValue.attributeName == payload.attributeName) {
          capturedValue.value = payload.value;
        }
      });
      state.isRenderView = false;
    },
    onSubmit(state, payload) {
      state.isRenderView = true;
      state.screenModel.focus = "";
      state.screenModel.capturedValues = [];
      state.screenModel = composeScreenData(payload);
    },
    saveSubForm(state, payload) {
      state.subFormModel = composeScreenData(payload);
      state.isRenderView = true;
    },
    clearSubForm(state, payload) {
      state.subFormModel = {} as ScreenModel;
      state.isRenderView = true;
    },
  },
  namespaced: true,
};
export default workflowModule;

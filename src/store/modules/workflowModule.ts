import { Module } from "vuex";
import RootState from "../state";
import { post } from "@/service/http";
import {
  CapturedValue,
  EngineRequset,
  UserSettingDto,
} from "@/entity/request.entity";
import { ScreenModel, ActionKeyEnum } from "@/entity/screen.entity";
import { composeScreenData } from "@/utils/type3.parse";
import _ from "lodash";

export interface WorkflowState {
  screenModel: ScreenModel;
  subFormModel: ScreenModel;
  isMainViewRender: boolean;
  isSubFormRender: boolean;
  subFromWorkFlowId: string;
  subFromWorkNodeId: string;
}
const workflowModule: Module<WorkflowState, RootState> = {
  state: {
    screenModel: {} as ScreenModel,
    subFormModel: {} as ScreenModel,
    isMainViewRender: false,
    isSubFormRender: false,
    subFromWorkFlowId: "",
    subFromWorkNodeId: "",
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
      request.screenDepth = 0;
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },

    /**
     * @param context
     * @param payload: screen depth: 0: main screen; 1: sub form
     */
    onSubmit(context, payload) {
      const request = {} as EngineRequset;
      request.actionKey = ActionKeyEnum.SUBMIT;
      request.capturedValues = [];
      request.userSettingDto = {} as UserSettingDto;
      request.screenDepth = payload;
      const capturedValues =
        payload == 0
          ? context.state.screenModel.capturedValues
          : context.state.subFormModel.capturedValues;
      if (capturedValues.length > 0) {
        capturedValues.forEach((cv: CapturedValue) => {
          const capturedValue = {} as CapturedValue;
          capturedValue.attributeName = cv.attributeName;
          capturedValue.value = cv.value;
          request.capturedValues.push(capturedValue);
        });
      }
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
  },
  mutations: {
    saveRenderStatus(state, payload) {
      state.isMainViewRender = payload;
    },
    saveSubFormRenderStatus(state, payload) {
      state.isSubFormRender = payload;
      state.isMainViewRender = true;
    },
    saveCapturedValue(state, payload: CapturedValue) {
      state.screenModel.capturedValues.forEach((capturedValue) => {
        if (capturedValue.attributeName == payload.attributeName) {
          capturedValue.value = payload.value;
        }
      });
      state.isMainViewRender = false;
    },
    onSubmit(state, payload) {
      state.isMainViewRender = true;
      state.screenModel.focus = "";
      state.screenModel.capturedValues = [];
      state.screenModel = composeScreenData(payload, {} as ScreenModel);
    },
    saveSubForm(state, payload) {
      state.isMainViewRender = true;
      state.isSubFormRender = true;
      state.subFormModel = composeScreenData(payload, {} as ScreenModel);
      state.subFromWorkFlowId = state.screenModel.workFlowId;
      state.subFromWorkNodeId = state.screenModel.workNodeId;
    },
    clearSubForm(state, payload) {
      state.subFormModel = {} as ScreenModel;
      state.isMainViewRender = true;
    },
    nextFocus(state, payload) {
      state.screenModel.capturedValues.forEach((t: any, index: number) => {
        if (t.attributeName == payload.attributeName) {
          if (payload.direction == "up") {
            if (index - 1 > -1) {
              state.screenModel.focus =
                state.screenModel.capturedValues[index - 1].attributeName;
            }
          } else {
            if (index + 1 < state.screenModel.capturedValues.length)
              state.screenModel.focus =
                state.screenModel.capturedValues[index + 1].attributeName;
          }
        }
      });
      state.isMainViewRender = true;
    },
  },
  namespaced: true,
};
export default workflowModule;

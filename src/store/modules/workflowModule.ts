import { Module } from "vuex";
import RootState from "../state";
import { post } from "@/service/http";
import {
  CapturedValue,
  EngineRequset,
  SubScreenDto,
  UserSettingDto,
} from "@/entity/request.entity";
import {
  ScreenModel,
  ActionKeyEnum,
  WorkFlowCollection,
} from "@/entity/screen.entity";
import { composeScreen } from "@/utils/type3.parse";
import _ from "lodash";
import { composeEmptyRowsForLegacy, parseLegacyXML } from "@/utils/type1.parse";

export interface WorkflowState {
  screenModel: ScreenModel;
  subScreenModel: ScreenModel;
  screenDepth: number;
  isRender: boolean;
}
const workflowModule: Module<WorkflowState, RootState> = {
  state: {
    screenModel: {} as ScreenModel,
    subScreenModel: {} as ScreenModel,
    screenDepth: 0,
    isRender: false,
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
      request.screenDepth = context.state.screenDepth;
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onSubmit(context) {
      const request = {} as EngineRequset;
      request.actionKey = ActionKeyEnum.SUBMIT;
      request.userSettingDto = {} as UserSettingDto;
      request.capturedValues = [];
      if (context.state.screenDepth == 0) {
        request.screenDepth = 0;
        request.capturedValues = context.state.screenModel.capturedValues;
        // clear sub screen model
      } else {
        request.screenDepth = 1;
        request.capturedValues = context.state.subScreenModel.capturedValues;
      }
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onClickSubBtn(context) {
      const request = {} as EngineRequset;
      request.actionKey =
        context.state.screenModel.workFlowCollection.subFormAction;
      request.userSettingDto = {} as UserSettingDto;
      request.capturedValues = [];
      request.screenDepth = 1;
      request.capturedValues = context.state.subScreenModel.capturedValues;
      request.subScreenDto = {} as SubScreenDto;
      request.subScreenDto.startWorkFlowId =
        context.state.screenModel.workFlowCollection.subWorkFlowId;
      request.subScreenDto.startWorkNodeId =
        context.state.screenModel.workFlowCollection.subWorkNodeId;
      request.actionKey =
        context.state.screenModel.workFlowCollection.subFormAction;
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
  },
  mutations: {
    onCloseRender(state) {
      state.isRender = false;
    },
    onOpenSubScreen(state) {
      state.screenDepth = 1;
      state.isRender = true;
    },
    onCloseSubScreen(state) {
      state.screenDepth = 0;
      state.isRender = true;
    },
    saveCapturedValue(state, payload: CapturedValue) {
      state.isRender = false;
      const capturedValue =
        state.screenDepth == 0
          ? state.screenModel.capturedValues
          : state.subScreenModel.capturedValues;
      capturedValue.forEach((capturedValue) => {
        if (capturedValue.attributeName == payload.attributeName) {
          capturedValue.value = payload.value;
        }
      });
    },
    onSubmit(state, payload) {
      const screenModel = {} as ScreenModel;
      screenModel.workFlowCollection = {} as WorkFlowCollection;
      if (!_.isEmpty(payload.legacyOutPutXML)) {
        console.log(payload);
        state.screenModel = composeScreen(parseLegacyXML(payload), screenModel);
        // const screenRows = _.cloneDeep(state.screenModel.screenRows);
        composeEmptyRowsForLegacy(state.screenModel.screenRows);

        state.isRender = true;
      } else {
        state.screenDepth = payload.screenDepth;
        if (state.screenDepth == 0) {
          state.screenDepth = 0;
          if (!_.isEmpty(state.subScreenModel)) {
            state.subScreenModel = {} as ScreenModel;
          }
          if (!_.isUndefined(state.screenModel.workFlowCollection)) {
            screenModel.workFlowCollection.preWorkFlowId =
              state.screenModel.workFlowCollection.workFlowId;
            screenModel.workFlowCollection.preWorkNodeId =
              state.screenModel.workFlowCollection.workNodeId;
          }
          state.screenModel = composeScreen(payload, screenModel);
        } else {
          state.screenDepth = 1;
          if (!_.isUndefined(state.subScreenModel.workFlowCollection)) {
            screenModel.workFlowCollection.preWorkFlowId =
              state.subScreenModel.workFlowCollection.workFlowId;
            screenModel.workFlowCollection.preWorkNodeId =
              state.subScreenModel.workFlowCollection.workNodeId;
          }
          state.subScreenModel = composeScreen(payload, screenModel);
          state.subScreenModel.workFlowCollection.triggerByWorkFlowId =
            state.screenModel.workFlowCollection.workFlowId;
          state.subScreenModel.workFlowCollection.triggerByWorkNodeId =
            state.screenModel.workFlowCollection.workNodeId;
        }
        state.isRender = true;
      }
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
      state.isRender = true;
    },
  },
  namespaced: true,
};
export default workflowModule;

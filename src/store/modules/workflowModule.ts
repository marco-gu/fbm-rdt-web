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
  SelectedItem,
} from "@/entity/screen.entity";
import { composeScreen } from "@/utils/type3.parse";
import _ from "lodash";
import { composeEmptyRowsForLegacy, parseLegacyXML } from "@/utils/type1.parse";
import { EngineResponse } from "@/entity/response.entity";

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
      request.userSettingDto = {} as UserSettingDto;
      request.capturedValues = [];
      request.screenDepth = context.state.screenDepth;
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onSubmit(context, actionKey: string) {
      const request = {} as EngineRequset;
      request.actionKey = ActionKeyEnum.SUBMIT;
      request.userSettingDto = {} as UserSettingDto;
      request.screenDepth = context.state.screenDepth;
      request.capturedValues =
        context.state.screenDepth == 0
          ? context.state.screenModel.capturedValues
          : context.state.subScreenModel.capturedValues;
      post(request).then((data) => {
        context.commit("onSubmit", data);
      });
    },
    onClickSubBtn(context) {
      const request = {} as EngineRequset;
      request.userSettingDto = {} as UserSettingDto;
      request.capturedValues = [];
      request.screenDepth = 1;
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
    saveSelectedItem(state, payload: SelectedItem) {
      if (state.screenDepth == 0) {
        state.screenModel.selectedItem = payload;
      } else {
        state.subScreenModel.selectedItem = payload;
      }
    },
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
    onSubmit(state, payload: EngineResponse) {
      const screenModel = {} as ScreenModel;
      screenModel.workFlowCollection = {} as WorkFlowCollection;
      screenModel.capturedValues = [] as CapturedValue[];
      screenModel.singleListCollection = new Map();
      screenModel.selectedItem = {} as SelectedItem;
      if (!_.isEmpty(payload.legacyOutPutXML)) {
        state.screenModel = composeScreen(parseLegacyXML(payload), screenModel);
        composeEmptyRowsForLegacy(state.screenModel.screenRows);
      } else {
        state.screenDepth = payload.screenDepth;
        if (state.screenDepth == 0) {
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
      }
      state.isRender = true;
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
    onNextPage(state) {
      if (state.screenDepth == 0) {
        if (state.screenModel.currentPage < state.screenModel.totalPage) {
          state.screenModel.currentPage++;
          state.isRender = true;
        }
      }
    },
    onPreviousPage(state) {
      if (state.screenDepth == 0) {
        if (state.screenModel.currentPage > 1) {
          state.screenModel.currentPage--;
          state.isRender = true;
        }
      }
    },
    moveToNextFocus(state, payload) {
      const sortFocus =
        state.screenDepth == 0
          ? state.screenModel.sortFocus
          : state.subScreenModel.sortFocus;
      sortFocus.forEach((t, index) => {
        if (t[1].attributeName == payload) {
          if (state.screenDepth == 0) {
            if (index + 1 < sortFocus.length) {
              state.screenModel.focus = sortFocus[index + 1][1].attributeName;
            }
          }
        }
      });
    },
    setCurrentFocus(state, payload) {
      if (state.screenDepth == 0) {
        console.log(payload);
        state.screenModel.focus = payload;
      } else {
        state.subScreenModel.focus = payload;
      }
    },
  },
  namespaced: true,
};
export default workflowModule;

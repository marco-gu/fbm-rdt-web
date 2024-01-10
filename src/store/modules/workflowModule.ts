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
import { EngineResponse, FieldDto } from "@/entity/response.entity";

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
      if (_.isUndefined(actionKey)) {
        request.actionKey = ActionKeyEnum.SUBMIT;
      } else {
        request.actionKey = actionKey;
      }
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
    onSubmitSubForm(context, actionKey: string) {
      const request = {} as EngineRequset;
      request.userSettingDto = {} as UserSettingDto;
      request.capturedValues = [];
      request.screenDepth = 1;
      request.subScreenDto = {} as SubScreenDto;
      request.subScreenDto.startWorkFlowId =
        context.state.screenModel.workFlowCollection.subWorkFlowId;
      request.subScreenDto.startWorkNodeId =
        context.state.screenModel.workFlowCollection.subWorkNodeId;
      if (_.isUndefined(actionKey)) {
        request.actionKey =
          context.state.screenModel.workFlowCollection.subFormAction;
      } else {
        request.actionKey = actionKey;
      }
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
    moveToNextPage(state) {
      if (state.screenDepth == 0) {
        if (state.screenModel.currentPage < state.screenModel.totalPage) {
          state.screenModel.currentPage++;
          state.isRender = true;
        }
      }
    },
    moveToPreviousPage(state) {
      if (state.screenDepth == 0) {
        if (state.screenModel.currentPage > 1) {
          state.screenModel.currentPage--;
          state.isRender = true;
        }
      }
    },
    moveToNextFocus(state, attributeName) {
      const sortFocus =
        state.screenDepth == 0
          ? state.screenModel.sortFocus
          : state.subScreenModel.sortFocus;
      sortFocus.forEach((t, index) => {
        if (t[1].attributeName == attributeName) {
          if (state.screenDepth == 0) {
            if (index + 1 < sortFocus.length) {
              const currentPage = t[1].pageNumer;
              const nextFocusPage = sortFocus[index + 1][1].pageNumer;
              if (currentPage !== nextFocusPage) {
                state.screenModel.currentPage = nextFocusPage;
                state.isRender = true;
              }
              state.screenModel.focus = sortFocus[index + 1][1].attributeName;
            } else {
              state.screenModel.focus = sortFocus[0][1].attributeName;
            }
          }
        }
      });
    },
    setCurrentFocus(state, focus) {
      if (state.screenDepth == 0) {
        state.screenModel.focus = focus;
      } else {
        state.subScreenModel.focus = focus;
      }
    },
    clearMsgInfo(state) {
      state.screenModel.showMessage = false;
      state.screenModel.msgField = {} as FieldDto;
    },
  },
  namespaced: true,
};
export default workflowModule;

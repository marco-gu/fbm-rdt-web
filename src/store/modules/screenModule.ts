import { MsgInfo } from "@/entity/screen.entity";
import { Module } from "vuex";
import RootState from "../state";

const emptyMsgContent: MsgInfo = {
  message: "",
  color: "",
  y: 0,
};
const MSG_DISMISS_TIME = 3000;
export interface ScreenState {
  showMessage: boolean;
  messageContent: MsgInfo;
}
const screenModule: Module<ScreenState, RootState> = {
  state: {
    showMessage: false,
    messageContent: emptyMsgContent,
  },
  actions: {
    showMessageAutoDismiss(context) {
      context.commit("toggleMessage", true);
      setTimeout(() => {
        context.commit("toggleMessage", false);
        context.commit("setMessageContent", emptyMsgContent);
      }, MSG_DISMISS_TIME);
    },
    showMessage(context, payload: boolean) {
      context.commit("toggleMessage", payload);
    },
    setMessageContent(context, payload: MsgInfo) {
      context.commit("setMessageContent", payload);
    },
  },
  mutations: {
    toggleMessage(state, payload) {
      state.showMessage = payload;
    },
    setMessageContent(state, payload) {
      state.messageContent = payload;
    },
  },
  namespaced: true,
};
export default screenModule;

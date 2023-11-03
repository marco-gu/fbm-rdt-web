import { Module } from "vuex";
import RootState from "../state";
import { get, post } from "@/service/http";
import { EngineResponseDto, FieldDto } from "@/utils/process.render";
import { XmlDocument } from "xmldoc";

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
      let temp = "GBR?";
      // let temp = "GBR?I_Field01=RDT222&I_Field02=RDTadmin&type=Submit";
      let last = "";
      params.capturedValues.forEach((t: any) => {
        if (last != t.attributeName) {
          temp += t.attributeName + "=" + t.value + "&";
          last = t.attributeName;
        }
        // if (last) {
        //   if (last != t.attributeName) {
        //     temp += t.attributeName + "=" + t.value + "&";
        //   }
        // } else {
        //   last = t.attributeName;
        // }
      });
      temp += "type=Submit";
      console.log("--------" + temp);
      get(temp).then((data) => {
        console.log(data);
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
      const temp = {} as EngineResponseDto;
      temp.fields = [];
      const doc = new XmlDocument(payload);
      doc.children.forEach((t: any) => {
        const element = {} as FieldDto;
        if (t.name == "field") {
          element.color = t.attr.color;
          element.coordinateX = t.attr.x;
          element.coordinateY = t.attr.y;
          element.attributeType = t.attr.typ;
          element.value = t.attr.value;
          element.attributeName = t.attr.id;
        }
        if (element.coordinateX) {
          temp.fields.push(element);
        }
      });
      temp.sessionId = 22;
      state.response = temp;
      state.sessionId = payload.sessionId;
    },
  },
  namespaced: true,
};
export default workflowModule;

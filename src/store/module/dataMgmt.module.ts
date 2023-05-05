import { DataMgmt } from "@/models/data.management";
import { ProfileDisplayAttribute, SelectedCarton } from "@/models/profile";
import { Module } from "vuex";
import RootState from "../state";

export interface DataMgmtState {
  dataMgmt: DataMgmt;
  profile: ProfileDisplayAttribute[];
  mixcartonItem: any;
  selectedCartonHeader: any;
  selectedCartonDetail: SelectedCarton;
}

const dataMgmtModule: Module<DataMgmtState, RootState> = {
  state: {
    dataMgmt: {
      client: "",
      profileName: "",
      so: "",
      po: "",
      sku: "",
      scanType: "",
      updateDatetime: "",
      scannedCartonNumber: 0,
      allCartonNumber: 0,
      uploadStatus: false,
      finishStatus: false,
      totalCBM: "",
      totalWeight: "",
      taskID: "",
      containerNumber: "",
      lpID: "",
    },
    profile: [],
    mixcartonItem: {},
    selectedCartonHeader: {
      taskID: "",
      cartonID: "",
    },
    selectedCartonDetail: {
      client: "",
      so: "",
      po: "",
      sku: "",
      operation: "",
      cartonID: "",
      scanDate: "",
      hub: "",
      quantity: "",
      style: "",
      lpID: "",
    },
  },
  actions: {
    saveDataMgmt(context: any, payload: DataMgmt) {
      context.commit("setDataMgmt", payload);
    },
    saveProfile(context: any, payload: ProfileDisplayAttribute[]) {
      context.commit("setProfile", payload);
    },
    saveSelectedCartonHeader(context: any, payload: any) {
      context.commit("setSelectedCartonHeader", payload);
    },
    saveSelectedCartonDetail(context: any, payload: any) {
      context.commit("setSelectedCartonDetail", payload);
    },
    saveMixCartonItem(context: any, payload: any) {
      context.commit("setMixCartonItem", payload);
    },
  },
  mutations: {
    setDataMgmt(state: DataMgmtState, payload: DataMgmt) {
      state.dataMgmt = payload;
    },
    setProfile(state: DataMgmtState, payload: ProfileDisplayAttribute[]) {
      state.profile = payload;
    },
    setSelectedCartonHeader(state: DataMgmtState, payload: any) {
      state.selectedCartonHeader = payload;
    },
    setSelectedCartonDetail(state: DataMgmtState, payload: any) {
      state.selectedCartonDetail = payload;
    },
    setMixCartonItem(state: DataMgmtState, payload: any) {
      state.mixcartonItem = payload;
    },
  },
  namespaced: true,
};
export default dataMgmtModule;

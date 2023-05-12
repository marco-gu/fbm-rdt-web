import { DataMgmt } from "@/models/data.management";
import { Carton, ProfileDisplayAttribute, CartonItem } from "@/models/profile";
import { Module } from "vuex";
import RootState from "../state";

export interface DataMgmtState {
  dataMgmt: DataMgmt;
  dataMgmtList: DataMgmt[];
  cartonList: Carton[];
  profile: ProfileDisplayAttribute[];
  cartonMixItem: any;
  cartonItem: CartonItem;
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
    dataMgmtList: [],
    cartonList: [],
    profile: [],
    cartonMixItem: {},
    cartonItem: {
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
    saveDataMgmt(context: any, payload: DataMgmt[]) {
      context.commit("setDataMgmt", payload);
    },
    saveDataMgmtItem(context: any, payload: DataMgmt) {
      context.commit("setDataMgmtItem", payload);
    },
    saveProfile(context: any, payload: ProfileDisplayAttribute[]) {
      context.commit("setProfile", payload);
    },
    saveCartonList(context: any, payload: Carton[]) {
      context.commit("setCartonList", payload);
    },
    saveCartonItem(context: any, payload: any) {
      context.commit("setCartonItem", payload);
    },
    saveMixCartonItem(context: any, payload: any) {
      context.commit("setMixCartonItem", payload);
    },
  },
  mutations: {
    setDataMgmt(state: DataMgmtState, payload: DataMgmt[]) {
      state.dataMgmtList = payload;
    },
    setDataMgmtItem(state: DataMgmtState, payload: DataMgmt) {
      state.dataMgmt = payload;
    },
    setProfile(state: DataMgmtState, payload: ProfileDisplayAttribute[]) {
      state.profile = payload;
    },
    setCartonList(state: DataMgmtState, payload: any) {
      state.cartonList = payload;
    },
    setCartonItem(state: DataMgmtState, payload: any) {
      state.cartonItem = payload;
    },
    setMixCartonItem(state: DataMgmtState, payload: any) {
      state.cartonMixItem = payload;
    },
  },
  namespaced: true,
};
export default dataMgmtModule;

import { ImageModel } from "@/models/image";
import { Module } from "vuex";
import RootState from "../state";

export interface CargoImageState {
  cargoImages: ImageModel[];
}

const cargoImageModule: Module<CargoImageState, RootState> = {
  state: {
    cargoImages: [],
  },
  actions: {
    saveCargoImages(context: any, payload: ImageModel[]) {
      context.commit("setCargoImages", payload);
    },
  },
  mutations: {
    setCargoImages(state: CargoImageState, payload: ImageModel[]) {
      state.cargoImages = payload;
    },
  },
  namespaced: true,
};
export default cargoImageModule;

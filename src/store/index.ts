import { InjectionKey } from "vue";
import {
  createLogger,
  createStore,
  Store,
  useStore as baseUseStore,
} from "vuex";
import RootState, { State } from "./state";
import workflowModule from "./modules/workflowModule";

const debug = process.env.NODE_ENV !== "production";
export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    workflowModule,
  },
  // strict: debug,
  plugins: debug ? [createLogger()] : [],
});
export const key: InjectionKey<Store<RootState>> = Symbol("vue-store");
export function useStore<T = State>() {
  return baseUseStore<T>(key);
}

import { InjectionKey } from "vue";
import {
  createLogger,
  createStore,
  Store,
  useStore as baseUseStore,
} from "vuex";
import profileModule from "./module/profile.module";
import languageModule from "./module/language.module";

import RootState, { State } from "./state";
import screenModule from "./module/screen.module";
import commonModule from "./module/common.module";
import dataMgmtModule from "./module/dataMgmt.module";

const debug = process.env.NODE_ENV !== "product";
export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    profileModule,
    languageModule,
    screenModule,
    commonModule,
    dataMgmtModule,
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
export const key: InjectionKey<Store<RootState>> = Symbol("vue-store");
export function useStore<T = State>() {
  return baseUseStore<T>(key);
}

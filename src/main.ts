import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store, { key } from "./store";
import { Dialog, Loading, Notify, Quasar } from "quasar";
import "./styles/quasar.scss";
import "@maersk-global/fonts/maeu/fonts.css";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
import i18n from "./assets/i18n/i18n";

const quasarUserOptions = {
  config: {},
  plugins: { Loading, Notify, Dialog },
};

createApp(App)
  .use(Quasar, quasarUserOptions)
  .use(store, key)
  .use(router)
  .use(i18n)
  .mount("#app");

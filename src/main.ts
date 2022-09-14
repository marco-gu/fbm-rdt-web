import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { Loading, Notify, Quasar } from "quasar";
import "./styles/quasar.scss";
import "@quasar/extras/material-icons/material-icons.css";

const quasarUserOptions = {
  config: {},
  plugins: { Loading, Notify },
};

createApp(App)
  .use(Quasar, quasarUserOptions)
  .use(store)
  .use(router)
  .mount("#app");

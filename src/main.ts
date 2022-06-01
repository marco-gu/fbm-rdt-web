import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { Loading, Quasar } from "quasar";
import "./styles/quasar.scss";
import "@quasar/extras/material-icons/material-icons.css";

const quasarUserOptions = {
  config: {},
  plugins: { Loading },
};

createApp(App)
  .use(Quasar, quasarUserOptions)
  .use(store)
  .use(router)
  .mount("#app");

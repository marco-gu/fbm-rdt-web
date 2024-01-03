import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store, { key } from "./store";
import "./styles/index.scss";
// import { Quasar } from "quasar";
// import "./styles/quasar.scss";
// import "@quasar/extras/material-icons/material-icons.css";
// import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
const quasarUserOptions = {
  config: {},
  plugins: {},
};

createApp(App)
  .use(store, key)
  // .use(Quasar, quasarUserOptions)
  .use(router)
  .mount("#app");

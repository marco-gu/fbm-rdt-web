import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store, { key } from "./store";
import "./styles/index.scss";
import "./styles/fontawesome-free-6.5.1-web/scss/fontawesome.scss";
import "./styles/fontawesome-free-6.5.1-web/scss/solid.scss";
import "./styles/fontawesome-free-6.5.1-web/scss/regular.scss";
if (process.env.VUE_APP_IS_ANDROID_SIMULATOR === "true") {
  require("./styles/android.web.scss");
}

// import "font-awesome/css/font-awesome.min.css";
// import "font-awesome/scss/font-awesome.scss";

// our project needs Solid + Brands
// import "font-awesome/scss/solid.scss";
// import "font-awesome/scss/brands.scss";
// import "font-awesome/scss/font-awesome.scss";
// import { Quasar } from "quasar";
// import "./styles/quasar.scss";
// import "@quasar/extras/material-icons/material-icons.css";
// import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
// const quasarUserOptions = {
//   config: {},
//   plugins: {},
// };

createApp(App)
  .use(store, key)
  // .use(Quasar, quasarUserOptions)
  .use(router)
  .mount("#app");

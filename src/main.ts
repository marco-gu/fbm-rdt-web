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
if (process.env.VUE_APP_IS_SIMULATOR === "true") {
  require("./styles/electron.web.scss");
}
createApp(App).use(store, key).use(router).mount("#app");

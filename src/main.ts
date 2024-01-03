import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store, { key } from "./store";
import "./styles/index.scss";
import "./styles/fontawesome-free-6.5.1-web/scss/fontawesome.scss";
import "./styles/fontawesome-free-6.5.1-web/scss/solid.scss";
import "./styles/fontawesome-free-6.5.1-web/scss/regular.scss";
createApp(App).use(store, key).use(router).mount("#app");

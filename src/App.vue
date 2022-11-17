<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { provideI18n } from "./plugin/i18nPlugins";
const App = defineComponent({
  setup() {
    provideI18n({
      locale: "en",
      messages: {
        MessageCode: {
          zh: require("../src/assets/lang/MessageCode/zh.json"),
          en: require("../src/assets/lang/MessageCode/en.json"),
        },
        LoginView: {
          zh: require("../src/assets/lang/LoginView/zh.json"),
          en: require("../src/assets/lang/LoginView/en.json"),
        },
        ForgotPwdComponent: {
          zh: require("../src/assets/lang/ForgotPwdComponent/zh.json"),
          en: require("../src/assets/lang/ForgotPwdComponent/en.json"),
        },
        LpSearchView: {
          zh: require("../src/assets/lang/LpSearchView/zh.json"),
          en: require("../src/assets/lang/LpSearchView/en.json"),
        },
        SettingView: {
          zh: require("../src/assets/lang/SettingView/zh.json"),
          en: require("../src/assets/lang/SettingView/en.json"),
        },
        ResetPwdView: {
          zh: require("../src/assets/lang/ResetPwdView/zh.json"),
          en: require("../src/assets/lang/ResetPwdView/en.json"),
        },
      },
    });
    const router = useRouter();
    bridge.register("reLogin", () => {
      router.push({ name: "login", params: { message: "TOKEN EXPIRED" } });
    });
  },
});
export default App;
</script>

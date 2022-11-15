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
      locale: "en/",
      messages: {
        MessageCode: {
          zh: require("../src/assets/lang/zh/MessageCode/zh.json"),
          en: require("../src/assets/lang/en/MessageCode/en.json"),
        },
        LoginView: {
          zh: require("../src/assets/lang/zh/LoginView/zh.json"),
          en: require("../src/assets/lang/en/LoginView/en.json"),
        },
        ForgotPwdComponent: {
          zh: require("../src/assets/lang/zh/ForgotPwdComponent/zh.json"),
          en: require("../src/assets/lang/en/ForgotPwdComponent/en.json"),
        },
        LpSearchView: {
          zh: require("../src/assets/lang/zh/LpSearchView/zh.json"),
          en: require("../src/assets/lang/en/LpSearchView/en.json"),
        },
        SettingView: {
          zh: require("../src/assets/lang/zh/SettingView/zh.json"),
          en: require("../src/assets/lang/en/SettingView/en.json"),
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

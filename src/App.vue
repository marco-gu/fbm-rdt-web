<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, onMounted, watch } from "vue";
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { provideI18n } from "./plugin/i18nPlugins";
import { useI18n } from "vue-i18n";
import { useStore } from "@/store";
const App = defineComponent({
  setup() {
    const i18n = useI18n();
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

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
        ProfileManagementView: {
          zh: require("../src/assets/lang/ProfileManagementView/zh.json"),
          en: require("../src/assets/lang/ProfileManagementView/en.json"),
        },
        DataManagementView: {
          zh: require("../src/assets/lang/DataManagementView/zh.json"),
          en: require("../src/assets/lang/DataManagementView/en.json"),
        },
        ContinueMyJobView: {
          zh: require("../src/assets/lang/ContinueMyJobView/zh.json"),
          en: require("../src/assets/lang/ContinueMyJobView/en.json"),
        },
      },
    });
    const router = useRouter();
    bridge.register("reLogin", () => {
      router.push({ name: "login", params: { message: "TOKEN EXPIRED" } });
    });
    bridge.register("onKeyCodeClick", (keycode: string) => {
      console.log("CUSTOM_KEY_CODE_WEBVIEW ===> " + keycode);
    });

    onMounted(() => {
      // store i18n in store for changing
      const store = useStore();
      watch(
        () => store.getters["languageModule/currentLang"],
        (newVal) => {
          const currentLang = i18n.locale.value;
          if (currentLang !== newVal) {
            i18n.locale.value = newVal;
          }
        },
        {
          immediate: true,
        }
      );
    });
  },
});
export default App;
</script>

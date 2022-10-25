<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { provideI18n } from "./plugin/i18nPlugins";
const App = defineComponent({
  setup() {
    provideI18n({
      locale: "zh",
      messages: {
        LoginView: {
          zh: require("../src/assets/lang/zh/LoginView/zh.json"),
          en: require("../src/assets/lang/en/LoginView/en.json"),
        },
      },
    });
    const router = useRouter();
    bridge.register("getDeviceBrand", (res: string) => {
      console.log("get device brand", res);
    });
    bridge.register("reLogin", () => {
      router.push({ name: "login", params: { message: "TOKEN EXPIRED" } });
    });
  },
});
export default App;
</script>

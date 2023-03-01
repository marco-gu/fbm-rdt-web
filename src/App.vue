<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, onMounted, watch } from "vue";
import bridge from "dsbridge";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useStore } from "@/store";
import { routeTableLoggedIn, searchRoute } from "@/router/route-table";
import { useQuasar } from "quasar";
const App = defineComponent({
  setup() {
    const i18n = useI18n();
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    let isLoggedIn = false;
    const deviceHeight = window.innerHeight;
    store.dispatch("screenModule/saveScreenHeight", {
      screenHeight: deviceHeight,
    });

    bridge.register("reLogin", () => {
      isLoggedIn = false;
      router.push({ name: "login", params: { message: "TOKEN EXPIRED" } });
    });
    bridge.register("onKeyCodeClick", (keycode: string) => {
      console.log("CUSTOM_KEY_CODE_WEBVIEW ===> " + keycode);
    });

    onMounted(() => {
      bridge.call("getSettingLanguage", null, (res: string) => {
        i18n.locale.value = res;
        store.dispatch("languageModule/setCurrentLang", res);
      });
      bridge.call("fetchUserToken", null, (res: string) => {
        isLoggedIn = !!res;
      });
      // override back pressed event
      bridge.register("onBackPressed", () => {
        const currentRoute = route.path;
        if (isLoggedIn) {
          const matchedItem = searchRoute(routeTableLoggedIn[0], currentRoute);
          if (matchedItem.parent) {
            router.push({
              path: matchedItem.parent.path,
              query: matchedItem.matched.query || route.query || null,
            });
          }
        } else {
          router.push("/");
        }
      });
      bridge.call("getScanDevice", (res: string) => {
        store.dispatch("commonModule/setScanDevice", res);
      });
    });
    // store i18n in store for changing
    watch(
      () => store.state.languageModule.currentLang,
      (newVal) => {
        i18n.locale.value = newVal;
      },
      {
        immediate: true,
      }
    );

    const $q = useQuasar();
    const myIcons: any = {
      "app:checkboxOn": "img:checkbox_on.svg",
      "app:checkboxOff": "img:checkbox_off.svg",
    };
    $q.iconMapFn = (iconName) => {
      const icon = myIcons[iconName];
      if (icon != void 0) {
        return { icon: icon };
      }
    };
  },
});
export default App;
</script>

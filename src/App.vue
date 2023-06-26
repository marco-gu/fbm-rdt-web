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
    const deviceHeight = window.innerHeight;
    store.dispatch("screenModule/saveScreenHeight", {
      screenHeight: deviceHeight,
    });
    bridge.register("onKeyCodeClick", (keycode: string) => {
      console.log("CUSTOM_KEY_CODE_WEBVIEW ===> " + keycode);
    });
    bridge.register("backHome", () => {
      router.push("/home");
    });

    bridge.register("openFAQ", () => {
      router.push("/faq");
    });

    bridge.register("goLogin", () => {
      router.replace("/");
    });

    onMounted(() => {
      bridge.call("getSettingLanguage", null, (res: string) => {
        i18n.locale.value = res;
        store.dispatch("languageModule/setCurrentLang", res);
      });
      bridge.call("getScanDeviceType", null, (res: string) => {
        store.dispatch("deviceProfileModule/saveDeviceProfile", res);
      });
      bridge.register("onBackPressed", () => {
        const isLoggedIn = store.state.commonModule.isLogin;
        const currentRoute = route.path;
        if (currentRoute == "/faq") {
          router.push("/");
        } else {
          if (isLoggedIn) {
            const matchedItem = searchRoute(
              routeTableLoggedIn[0],
              currentRoute
            );
            if (matchedItem.parent) {
              router.push({
                path: matchedItem.parent.path,
                query: matchedItem.matched.query || route.query || null,
              });
            }
          } else {
            router.push("/");
          }
        }
      });
      bridge.call("getScanDevice", (res: string) => {
        store.dispatch("commonModule/setScanDevice", res);
      });
    });
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
<style>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>

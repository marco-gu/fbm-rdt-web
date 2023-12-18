<template>
  <router-view v-if="isShow"></router-view>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { get, post } from "./service/http";
import { useStore } from "./store";
import { parseXML } from "./utils/util.parse";
import response from "./assets/mock/New_RDT_Response.json";
import loginResponse from "./assets/mock/New_RDT_Login_Response.json";
import { EngineResponse } from "./entity/response.entity";
import { composeScreenData } from "./utils/type3.parse";

export default defineComponent({
  setup() {
    const store = useStore();
    const isShow = ref(false);
    const url = "RDTEngine";
    const route = useRoute();
    const router = useRouter();
    onMounted(() => {
      window.addEventListener("keyup", handleKeyDown);
      post(url, engineRequest).then((data: any) => {
        store.commit("workflowModule/saveScreenModel", composeScreenData(data));
        isShow.value = true;
      });
      // const data = response as unknown as EngineResponse;
      // store.commit("workflowModule/saveScreenModel", composeScreenData(data));
      // isShow.value = true;
    });
    onUnmounted(() => {
      window.removeEventListener("keyup", handleKeyDown);
    });
    const engineRequest = {
      countryAbbreviatedName: "gbr",
    };
    const handleKeyDown = (event: any) => {
      if (route.path == "/") {
        {
          switch (event.keyCode) {
            case 13:
              store.dispatch("workflowModule/onSubmit");
              break;
            case 27:
              store.dispatch("workflowModule/onCancel");
              break;
            case 18:
              {
                store.commit(
                  "workflowModule/saveOptionsStatus",
                  !store.state.workflowModule.isOptionShow
                );
                const iconElement = document.getElementById("icon") as any;
                if (store.state.workflowModule.isOptionShow) {
                  router.push("/options/");
                  iconElement.setAttribute("class", "fa-solid fa-minus");
                } else {
                  router.push("/");
                  iconElement.setAttribute("class", "fa-solid fa-plus");
                }
              }
              break;
          }
        }
      } else {
        if (event.keyCode == 18) {
          store.commit("workflowModule/saveOptionsStatus", false);
          const iconElement = document.getElementById("icon") as any;
          router.push("/");
          iconElement.setAttribute("class", "fa-solid fa-plus");
        } else if (event.keyCode == 88) {
          if (route.name == "OptionDetailsView") {
            store.commit("workflowModule/saveOptionsStatus", false);
            const iconElement = document.getElementById("icon") as any;
            router.push("/");
            iconElement.setAttribute("class", "fa-solid fa-plus");
          } else if (route.name == "GenericSettingView") {
            router.push("/options/");
          } else if (route.name == "ServerSelectionView") {
            router.push("/options/setting");
          }
        }
      }
    };
    return {
      isShow,
    };
  },
});
</script>

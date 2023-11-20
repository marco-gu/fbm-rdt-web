<template>
  <div>
    <div id="content" class="content-container">
      <router-view v-if="isShow"></router-view>
      <!-- <q-inner-loading
        :showing="visible"
        label-class="text-teal"
        label="Loading..."
        color="primary"
        label-style="font-size: 1.1em"
      >
      </q-inner-loading> -->
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { get } from "./service/http";
import { useStore } from "./store";
import { parseXML } from "./utils/util.parse";

export default defineComponent({
  setup() {
    const store = useStore();
    const isShow = ref(false);
    const url = "RDTEngine/GBR";
    const visible = ref(true);
    const route = useRoute();
    const router = useRouter();
    onMounted(() => {
      window.addEventListener("keyup", handleKeyDown);
    });
    onUnmounted(() => {
      window.removeEventListener("keyup", handleKeyDown);
    });
    get(url, -1).then((data) => {
      store.commit("workflowModule/saveScreenEntity", parseXML(data));
      isShow.value = true;
      visible.value = false;
    });
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
        }
      }
    };
    watch(store.state.workflowModule, () => {
      visible.value = store.state.workflowModule.isLoadingVisible;
    });
    return {
      isShow,
      visible,
    };
  },
});
</script>
<style scoped lang="scss">
.content-container {
  margin: 0px;
  height: 330px;
  position: relative;
}
</style>

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
import { useRoute } from "vue-router";
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
          }
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

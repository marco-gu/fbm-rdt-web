<template>
  <div style="width: 260px">
    <header-component></header-component>
    <div id="content" class="content-container">
      <router-view v-if="isShow"></router-view>
      <q-inner-loading
        :showing="visible"
        label-class="text-teal"
        label="Loading..."
        color="primary"
        label-style="font-size: 1.1em"
      >
      </q-inner-loading>
    </div>
    <bottom-component></bottom-component>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import BottomComponent from "./components/BottomComponent.vue";
import HeaderComponent from "./components/HeaderComponent.vue";
import { get } from "./service/http";
import { useStore } from "./store";
import { parseXML } from "./utils/util.parse";

export default defineComponent({
  components: {
    HeaderComponent,
    BottomComponent,
  },
  setup() {
    const store = useStore();
    const isShow = ref(false);
    const url = "GBR";
    const visible = ref(true);
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
      switch (event.keyCode) {
        case 13:
          store.dispatch("workflowModule/onSubmit");
          break;
        case 27:
          store.dispatch("workflowModule/onCancel");
          break;
      }
    };
    watch(store.state.workflowModule, () => {
      visible.value = store.state.workflowModule.isLoadingVisible;
    });
    // if (localStorage.getItem("sessionID")) {
    //   const response = localStorage.getItem("screenEntity") as any;
    //   store.commit("workflowModule/saveScreenEntity", JSON.parse(response));
    //   isShow.value = true;
    // } else {
    //   get(url, -1).then((data) => {
    //     store.commit("workflowModule/saveScreenEntity", parseXML(data));
    //     isShow.value = true;
    //   });
    // }
    return {
      isShow,
      visible,
    };
  },
});
</script>
<style scoped lang="scss">
.content-container {
  margin: 10px 0px;
  height: 280px;
  position: relative;
}
</style>

<template>
  <div style="width: 260px">
    <header-component></header-component>
    <div id="content" class="content-container">
      <router-view v-if="isShow"></router-view>
    </div>
    <bottom-component></bottom-component>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
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
    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });
    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
    get(url, -1).then((data) => {
      store.commit("workflowModule/saveScreenEntity", parseXML(data));
      isShow.value = true;
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
    };
  },
});
</script>
<style scoped lang="scss">
.content-container {
  margin: 10px 0px;
  height: 240px;
  position: relative;
}
</style>

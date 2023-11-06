<template>
  <div style="width: 230px">
    <header-component v-if="isShow"></header-component>
    <div style="height: 230px"><router-view v-if="isShow"></router-view></div>
    <bottom-component v-if="isShow"></bottom-component>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
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
    if (localStorage.getItem("sessionID")) {
      const response = localStorage.getItem("screenEntity") as any;
      store.commit("workflowModule/saveScreenEntity", JSON.parse(response));
      isShow.value = true;
    } else {
      get(url, -1).then((data) => {
        store.commit("workflowModule/saveScreenEntity", parseXML(data));
        isShow.value = true;
      });
    }
    return {
      isShow,
    };
  },
});
</script>

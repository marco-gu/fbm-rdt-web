<template>
  <div style="width: 230px">
    <header-component></header-component>
    <div style="height: 230px"><router-view v-if="isShow"></router-view></div>
    <bottom-component></bottom-component>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
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
      // window.addEventListener("");
    });
    get(url, -1).then((data) => {
      store.commit("workflowModule/saveScreenEntity", parseXML(data));
      isShow.value = true;
    });
    const handleEnterKey = () => {
      alert("1111");
      store.dispatch("workflowModule/onSubmit");
    };
    const handleEscKey = () => {
      store.dispatch("workflowModule/onCancel");
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
      handleEnterKey,
      handleEscKey,
    };
  },
});
</script>

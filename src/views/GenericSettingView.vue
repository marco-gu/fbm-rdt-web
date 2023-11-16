<template>
  <div>
    Server
    <button @click="exit()">exit</button>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, onMounted, onUnmounted } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();
    onMounted(() => {
      window.addEventListener("keyup", handleKeyDown);
    });
    onUnmounted(() => {
      window.removeEventListener("keyup", handleKeyDown);
    });
    const handleKeyDown = (event: any) => {
      switch (event.keyCode) {
        case 13:
          alert("GenericSettingView 13");
          break;
        case 27:
          alert("GenericSettingView 27");
          break;
      }
    };
    const exit = () => {
      store.commit("workflowModule/saveGenericStatus", false);
    };
    return {
      exit,
    };
  },
});
</script>

<template>
  <router-view />
  <div style="display: flex; justify-content: space-between">
    <button style="width: 100px" @click="onSubmit">Back</button>
    <button style="margin-left: 20px; width: 100px" @click="onSubmit">
      Next
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, watch } from "vue";
import { useStore } from "./store";

export default defineComponent({
  setup() {
    const store = useStore();
    const onSubmit = () => {
      const param = store.state.workflowModule.params;
      store.dispatch("workflowModule/onSubmit", param);
    };
    return {
      onSubmit,
    };
  },
});
</script>

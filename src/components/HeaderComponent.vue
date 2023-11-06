<template>
  <div
    style="
      margin-bottom: 10px;
      background-color: #64b2d4;
      padding: 10px 5px;
      color: white;
      font-weight: bold;
      border-radius: 2px;
    "
  >
    {{ header }}
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, ref } from "vue";
const HeaderComponent = defineComponent({
  setup() {
    const header = ref(null);
    const store = useStore();
    store.subscribe((mutation, state) => {
      if (state.workflowModule.screenTitle) {
        header.value = store.state.workflowModule.screenTitle as any;
      }
    });
    header.value = store.state.workflowModule.screenTitle as any;
    return {
      header,
    };
  },
});
export default HeaderComponent;
</script>

<template>
  <div
    style="
      display: flex;
      background-color: #64b2d4;
      justify-content: space-between;
      padding: 10px 10px 10px 5px;
      color: white;
      font-weight: bold;
      border-radius: 2px;
    "
  >
    <div>{{ header }}</div>
    <div>
      <i class="fa-solid fa-gear"></i>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, ref } from "vue";
const HeaderComponent = defineComponent({
  setup() {
    const header = ref("Login NewRDT");
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

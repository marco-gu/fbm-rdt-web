<template>
  <div
    style="
      display: flex;
      justify-content: space-between;
      padding: 5px 40px;
      background-color: #64b2d4;
      border-radius: 2px;
    "
  >
    <div style="color: white" @click="back">
      <i class="fa-solid fa-arrow-left"></i>
    </div>
    <div style="color: white" @click="submit">
      <i class="fa-solid fa-arrow-right"></i>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent } from "vue";
const BottomComponent = defineComponent({
  setup() {
    const store = useStore();
    const back = () => {
      store.dispatch("workflowModule/onCancel");
    };
    const submit = () => {
      store.dispatch("workflowModule/onSubmit");
    };
    return {
      back,
      submit,
    };
  },
});
export default BottomComponent;
</script>

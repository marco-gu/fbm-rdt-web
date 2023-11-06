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
    <div style="color: white">
      <i class="fa-solid fa-arrow-left" @click="back"></i>
    </div>
    <div style="color: white">
      <i class="fa-solid fa-arrow-right" @click="submit"></i>
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
      console.log("back");
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

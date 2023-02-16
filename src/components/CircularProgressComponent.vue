<template>
  <q-circular-progress
    show-value
    :value="value"
    size="50px"
    :thickness="0.25"
    color="secondary"
    class="q-ma-md"
    track-color="light-blue"
    ><slot></slot
  ></q-circular-progress>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, toRefs, watch } from "vue";
const CircularProgressComponent = defineComponent({
  props: {
    progress: {
      type: Number,
      default: 0,
    },
  },
  emits: [],
  setup(props) {
    const { progress } = toRefs(props);
    const value = ref(0);
    onMounted(() => {
      const circles: HTMLCollection = document.getElementsByTagName("circle");
      for (let i = 0; i < circles.length; i++) {
        circles[i].setAttribute("stroke-linecap", "round");
      }
    });
    watch(
      value,
      (newValue) => {
        progress.value = newValue;
      },
      { immediate: true }
    );
    return { value };
  },
});
export default CircularProgressComponent;
</script>
<style scoped></style>

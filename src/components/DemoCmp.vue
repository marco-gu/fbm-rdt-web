<template>
  <q-circular-progress
    :value="value"
    size="50px"
    :thickness="0.22"
    color="secondary"
    class="q-ma-md"
    track-color="light-blue"
  />
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, toRefs, watch } from "vue";
const DemoCmp = defineComponent({
  props: {},
  emits: [],
  setup(props, context) {
    onMounted(() => {
      const circles: HTMLCollection = document.getElementsByTagName("circle");
      for (let i = 0; i < circles.length; i++) {
        circles[i].setAttribute("stroke-linecap", "round");
      }
    });
    return { value: 61 };
  },
});
export default DemoCmp;
</script>
<style scoped></style>

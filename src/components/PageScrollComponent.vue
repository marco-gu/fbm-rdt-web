<template>
  <q-scroll-area
    id="scroll-area"
    :thumb-style="thumbStyle"
    :bar-style="barStyle"
  >
    <slot> </slot>
  </q-scroll-area>
</template>
<script lang="ts">
import { defineComponent, onMounted, toRefs, watch } from "vue";
enum PageMode {
  VIEW,
  LONGPRESS,
  EDIT,
}
const PageScrollComponent = defineComponent({
  props: {
    pageMode: {
      type: Number,
    },
  },
  setup(props) {
    // default
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    });
    const { pageMode } = toRefs(props);
    watch(pageMode, (newValue) => {
      alert("");
    });
    return {
      thumbStyle: {
        right: "4px",
        borderRadius: "5px",
        backgroundColor: "black",
        width: "5px",
        opacity: 0.75,
      },

      barStyle: {
        right: "4px",
        borderRadius: "9px",
        backgroundColor: "black",
        width: "5px",
        opacity: 0.2,
      },
    };
  },
});
export default PageScrollComponent;
</script>

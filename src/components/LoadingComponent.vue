<template>
  <div class="loading-container" v-if="persistent">
    <div class="loading">
      <q-spinner-dots color="primary" size="45px" />
    </div>
    <div class="overlay"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, ref, toRefs, watch } from "vue";
const LoadingComponent = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const persistent = ref(false);
    const { visible } = toRefs(props);
    watch(
      visible,
      (newValue) => {
        setTimeout(() => {
          persistent.value = newValue;
        }, 300);
      },
      { immediate: true }
    );
    return {
      persistent,
    };
  },
});
export default LoadingComponent;
</script>
<style lang="scss" scoped>
.loading-container {
  width: 100vw;
  height: 100vh;
  z-index: 990;
  position: fixed;
  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
  }
  .overlay {
    position: absolute;
    background-color: rgba(222, 222, 222, 0.5);
    height: 100%;
    width: 100%;
    z-index: 995;
  }
}
</style>

<template>
  <div class="container" v-if="persistent">
    <q-card class="notify">
      <q-card-section>
        {{ prompt }}
      </q-card-section>
    </q-card>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";
const NotifyComponent = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
  },
  emits: ["close"],
  setup(props, context) {
    const persistent = ref(false);
    const prompt = ref();
    const { visible, message } = toRefs(props);
    watch(visible, (newValue) => {
      persistent.value = newValue;
      prompt.value = message.value;
      if (persistent.value) {
        setTimeout(() => {
          context.emit("close");
        }, 2000);
      }
    });
    return {
      persistent,
      prompt,
    };
  },
});
export default NotifyComponent;
</script>
<style lang="scss" scoped>
.container {
  position: fixed;
  height: 100vh;
  z-index: 990;
  width: 200px;
  left: 50%;
  margin-left: -100px;
}
.notify {
  bottom: 200px;
  animation-name: move;
  animation-duration: 1.5s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
}
@keyframes move {
  0% {
    transform: translateY(200px);
  }
  100% {
    transform: translateY(50px);
  }
}
</style>

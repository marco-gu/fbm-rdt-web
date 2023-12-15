<template>
  <div
    class="line-item label-container"
    style="width: 100%; flex-direction: column"
  >
    <div class="label-block" style="width: 100%">
      <span :style="{ color: messages.value.color }">
        {{ messages.value.message }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs } from "vue";
const MessageComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const messages = details.value as any;
    return {
      messages,
    };
  },
});
export default MessageComponent;
</script>

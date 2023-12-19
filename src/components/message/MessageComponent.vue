<template>
  <div
    class="line-item label-container"
    style="
      width: 90%;
      flex-direction: column;
      border: 1px solid red;
      text-align: center;
      margin: 0 auto;
      padding: 3px 0px;
    "
    :style="{
      borderColor: messages[0].value.color,
    }"
  >
    <div class="label-block" style="width: 100%">
      <span :style="{ color: messages[0].value.color }">
        {{ messages[0].value.message }}
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

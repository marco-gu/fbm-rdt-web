<template>
  <div
    class="line-item label-container msg-box"
    :style="{
      borderColor: messages[0].value.color,
    }"
  >
    <div class="label-block" style="width: 100%">
      <span class="svg-container">
        <svg
          height="18px"
          viewBox="0 0 24 24"
          width="18px"
          :fill="messages[0].value.color"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
          />
        </svg>
        <svg
          v-if="false"
          height="18px"
          viewBox="0 0 24 24"
          width="18px"
          :fill="messages[0].value.color"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
      </span>
      <!-- <img src="../../assets/icons/error.svg" /> -->
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
<style lang="scss" scoped>
.msg-box {
  width: calc(100% - 30px);
  flex-direction: column;
  border: 1px solid;
  text-align: center;
  margin: 0 auto;
  padding: 3px 0px;
}
.svg-container {
  margin-right: 10px;
  display: inline-block;
  position: relative;
  width: 19px;
  height: 19px;
  svg {
    position: absolute;
    top: 5px;
    right: 2px;
  }
}
</style>

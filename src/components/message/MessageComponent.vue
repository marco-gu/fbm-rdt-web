<template>
  <div
    class="line-item label-container msg-box"
    @click="hideMsgBox"
    :class="{ show: store.state.screenModule.showMessage }"
  >
    <div class="label-block">
      <div style="padding: 6px">
        <!-- :style="{
        borderColor: store.state.screenModule.messageContent.color,
      }" -->
        <span class="svg-container">
          <svg
            v-if="store.state.screenModule.messageContent.color === 'red'"
            height="22px"
            width="22px"
            viewBox="0 0 24 24"
            fill="#ffc58f"
          >
            <!-- :fill="store.state.screenModule.messageContent.color" -->
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
          <svg
            v-else
            height="18px"
            viewBox="0 0 24 24"
            width="18px"
            fill="#ffc58f"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </span>
        <!-- :style="{ color: store.state.screenModule.messageContent.color }" -->
        <span>
          {{ store.state.screenModule.messageContent.message }}
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, ref } from "vue";
import defaultStyle from "@/assets/device/default.json";
const MessageComponent = defineComponent({
  setup() {
    const store = useStore();
    const rowHeight = ref(defaultStyle.rowHeight);
    const hideMsgBox = () => {
      store.dispatch("screenModule/showMessage", false);
    };
    return {
      hideMsgBox,
      store,
      rowHeight,
    };
  },
});
export default MessageComponent;
</script>
<style lang="scss" scoped>
.msg-box {
  position: absolute;
  margin: 0 auto;
  bottom: 43px;
  height: 532px;
  align-items: flex-start;
  display: none;
  width: 100%;
  z-index: 100;
  .label-block {
    font-size: 24px;
    // padding: 6px;
    border: 1px solid;
    text-align: center;
    word-wrap: break-word;
    white-space: pre-wrap;
    // width: 100%;
    width: 329px;
    color: #ffc58f;
    background-color: #007acc;
    border: 1px solid #ffc58f;
  }
  &.show {
    display: flex;
    visibility: visible;
    // animation: fadein 0.5s;
    justify-content: center;
    align-items: center;
    background-color: #001733;
    opacity: 0.95;
  }
}
.svg-container {
  margin-right: 5px;
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;
  svg {
    position: absolute;
    // top: 5px;
    right: 2px;
  }
}
@keyframes fadein {
  from {
    // top: 0;
    opacity: 0;
  }
  to {
    // top: 26px;
    opacity: 1;
  }
}
</style>

<template>
  <div class="line-item inputs-container">
    <div class="label-block" :class="{ 'text-focus': isFocus }">OPTION:</div>
    <div class="input-block">
      <input ref="input" v-model="model" autofocus @change="onTextChange()" />
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, onMounted, ref, watch } from "vue";
const OptionInputComponent = defineComponent({
  setup() {
    const store = useStore();
    const model = ref();
    const measureTextLength = ref();
    const textarea = ref();
    const TEXT_MAX_LENGTH = ref(170);
    const isFocus = ref(false);
    const input = ref();
    onMounted(() => {
      input.value.focus();
    });
    const onTextChange = () => {
      // const param = {
      //   attributeName: attributeName.value,
      //   value: model.value,
      // } as CapturedValue;
      // store.dispatch("workflowModule/saveCapturedValue", param);
      // lastAttributeName.value = attributeName.value;
    };
    watch(model, () => {
      // textLength.value = measureText();
      // if (textLength.value >= TEXT_MAX_LENGTH.value) {
      //   nextTick(() => {
      //     textarea.value.focus();
      //   });
      // } else {
      //   nextTick(() => {
      //     input.value.focus();
      //   });
      // }
    });
    return {
      model,
      onTextChange,
      textarea,
      TEXT_MAX_LENGTH,
      isFocus,
      input,
    };
  },
});
export default OptionInputComponent;
</script>
<style lang="scss" scoped>
.inputs-container {
  width: 100%;
  // justify-content: space-between;
  .label-block {
    text-align: left;
    &.text-focus {
      // font-weight: bold;
    }
  }
  .input-block {
    display: flex;
    align-items: center;
    margin-left: 14px;
    textarea {
      border: none;
      resize: none;
      padding-left: 4px;
      height: 24px;
      line-height: 1;
      font-size: 10px;
      color: #ffc58f;
      background-color: #00346e;
      &:focus {
        outline: none;
      }
    }
    input {
      width: 7px;
      border: none;
      color: #ffc58f;
      background-color: #00346e;
      &:focus {
        outline: none;
        background-color: blue;
      }
      &:active {
        background-color: blue;
      }
    }
  }
}
.measure-text-length {
  height: 0;
  opacity: 0;
  position: absolute;
  left: -1000px;
}
</style>

<template>
  <div class="line-item inputs-container">
    <div class="label-block" :class="{ 'text-focus': isFocus }">OPTION:</div>
    <div class="input-block">
      <input ref="input" v-model="model" autofocus @change="onTextChange()" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
const OptionInputComponent = defineComponent({
  emits: ["optionValue"],
  setup(props, context) {
    const model = ref();
    const isFocus = ref(false);
    const input = ref();
    onMounted(() => {
      input.value.focus();
    });
    const onTextChange = () => {
      context.emit("optionValue", model.value);
    };
    return {
      model,
      onTextChange,
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
</style>

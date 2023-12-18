<template>
  <div class="line-item inputs-container">
    <div>
      {{ details[0].value }}
    </div>
    <div class="input-block">
      <input ref="input" v-model="model" @change="onTextChange(item)" />
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import {
  defineComponent,
  nextTick,
  ref,
  toRefs,
  watch,
  onMounted,
  PropType,
  Ref,
} from "vue";
import { CapturedValue } from "../entity/request.entity";
import { useRoute } from "vue-router";
import { LineDetail } from "@/entity/screen.entity";
import * as deviceConfig from "@/assets/device/mc93.json";
const InputComponentTest = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const model = ref();
    const measureTextLength = ref();
    const input = ref();
    const textarea = ref();
    const textLength = ref(0);
    const TEXT_MAX_LENGTH = ref(170);
    const isFocus = ref(false);
    const widthArr: Ref<any> = ref([]);
    const screenWidth: Ref<number> = ref(deviceConfig.width as number);
    const onTextChange = (detail: LineDetail) => {
      // const param = {
      //   attributeName: detail.attributeName,
      //   value: detail.value,
      // } as CapturedValue;
      // store.dispatch("workflowModule/saveCapturedValue", param);
    };

    return {
      model,
      onTextChange,
      measureTextLength,
      textLength,
      input,
      textarea,
      TEXT_MAX_LENGTH,
      isFocus,
      widthArr,
      screenWidth,
    };
  },
});
export default InputComponentTest;
</script>
<style lang="scss" scoped>
.inputs-container {
  width: 100%;
  // justify-content: space-between;
  .label-block {
    text-align: left;
  }
  .input-block {
    display: flex;
    align-items: center;
    padding-left: 2px;
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

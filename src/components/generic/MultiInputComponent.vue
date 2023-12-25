<template>
  <div class="line-item inputs-container">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.attributeType === 'label'"
        v-show="!item.isHidden"
        class="label-block"
        :class="{ 'text-focus': isFocus, highlighted: item.highlighted }"
        :style="{
          // color: item.color || '',
          flexBasis: widthArr[index],
        }"
      >
        {{ item.value }}
      </div>
      <div
        v-if="item.attributeType === 'inputBoxMultiLine'"
        v-show="!item.isHidden"
        class="input-block"
        :style="{
          // color: item.color || '',
          flexBasis: widthArr[index],
        }"
      >
        <textarea
          ref="input"
          v-model="item.value"
          :autofocus="
            store.state.workflowModule.screenModel.focus === item.attributeName
          "
          type="text"
          @change="onTextChange(item)"
          :maxlength="!item.maxLength ? 1 : item.maxLength"
          :tabindex="item.sequence"
          :required="item.required"
          :pattern="item.regexPattern"
          :rows="item.lines"
          @keyup="onKeyPress($event, item)"
          @focus="onFocus()"
          @blur="onBlur()"
        />
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, ref, toRefs, onMounted, Ref } from "vue";
import { useRoute } from "vue-router";
import { LineDetail } from "@/entity/screen.entity";
import * as deviceConfig from "@/assets/device/mc93.json";
import { CapturedValue } from "@/entity/request.entity";
const MultiInputComponent = defineComponent({
  props: {
    details: {
      type: Array as any,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const store = useStore();
    const model = ref();
    const measureTextLength = ref();
    const input = ref();
    const textarea = ref();
    const textLength = ref(0);
    const TEXT_MAX_LENGTH = ref(170);
    const isFocus = ref(false);
    const route = useRoute();
    const widthArr: Ref<any> = ref([]);
    const screenWidth: Ref<number> = ref(deviceConfig.width as number);
    onMounted(() => {
      mapRawData();
      focusInput();
    });

    const onTextChange = (detail: LineDetail) => {
      const param = {
        attributeName: detail.attributeName,
        value: detail.value,
      } as CapturedValue;
      store.dispatch("workflowModule/saveCapturedValue", param);
    };
    const mapRawData = () => {
      if (details.value) {
        let lengthRemain = deviceConfig.colunms + 1;
        const reversedArr = [];
        if (details.value.length === 1) {
          reversedArr.push("100%");
        } else {
          for (let i = details.value.length - 1; i >= 0; i--) {
            const x = details.value[i].coordinateX;
            if (x) {
              const calcColumnNo = lengthRemain - Number(x);
              reversedArr.push(
                Math.floor((calcColumnNo / deviceConfig.colunms) * 100) + "%"
              );
              lengthRemain = x;
            }
          }
        }
        widthArr.value = reversedArr.reverse();
        details.value.forEach((item: any) => {
          item.value = item.value || "";
        });
      }
    };
    const onFocus = () => {
      isFocus.value = true;
    };
    const onBlur = () => {
      isFocus.value = false;
    };

    const onKeyPress = (event: KeyboardEvent, detail: LineDetail) => {
      // todo enter press???
      const key = event.charCode || event.which || event.keyCode;
      if (key === 13) {
        event.stopPropagation();
        if (!event.shiftKey) {
          onTextChange(detail);
          store.dispatch("workflowModule/onSubmit");
        }
      }
    };
    const focusInput = () => {
      const focusValue = store.state.workflowModule.screenModel.focus;
      if (input.value && input.value.length > 0) {
        let inputIndex = -1;
        for (let i = 0; i < details.value.length; i++) {
          if (details.value[i].attributeType === "inputBoxMultiLine") {
            inputIndex++;
          }
          if (details.value[i].attributeName === focusValue) {
            if (inputIndex > -1) {
              input.value[inputIndex].focus();
            }
            break;
          }
        }
      }
    };

    return {
      model,
      onTextChange,
      measureTextLength,
      textLength,
      input,
      textarea,
      TEXT_MAX_LENGTH,
      onFocus,
      onBlur,
      isFocus,
      store,
      widthArr,
      screenWidth,
      onKeyPress,
    };
  },
});
export default MultiInputComponent;
</script>
<style lang="scss" scoped>
.inputs-container {
  width: 100%;
  align-items: flex-start;
  .label-block {
    text-align: left;
  }
  .input-block {
    display: flex;
    align-items: center;
    padding-left: 2px;
    textarea {
      border: none;
      color: #ffc58f;
      background-color: #00346e;
      resize: none;
      width: 100%;
      line-height: 26px;
      padding: 1px 2px;
      word-break: break-all;
      white-space: pre-wrap;
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
.highlighted {
  font-weight: bold;
}
</style>

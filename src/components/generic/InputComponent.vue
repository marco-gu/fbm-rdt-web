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
        v-if="
          item.attributeType === 'inputBox' || item.attributeType === 'password'
        "
        v-show="!item.isHidden"
        class="input-block"
        :style="{
          // color: item.color || '',
          flexBasis: widthArr[index],
        }"
      >
        <input
          ref="input"
          v-model="item.value"
          :autofocus="
            store.state.workflowModule.screenModel.focus === item.attributeName
          "
          :type="item.attributeType === 'password' ? 'password' : 'text'"
          @change="onTextChange(item)"
          :maxlength="!item.maxLength ? 1 : item.maxLength"
          :tabindex="item.sequence"
          :required="item.required"
          :pattern="item.regexPattern"
          @keyup="onKeyPress($event, item)"
          @focus="onFocus()"
          @blur="onBlur()"
          :style="{
            width:
              item.maxLength > 0
                ? item.maxLength > 1
                  ? (14.4 * item.maxLength > screenWidth
                      ? screenWidth - 30
                      : 14.4 * item.maxLength) + 'px'
                  : '18px'
                : 'auto',
          }"
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
import * as deviceConfig from "@/assets/device/default.json";
import { CapturedValue } from "@/entity/request.entity";
import { AttributeType } from "@/entity/response.entity";
const InputComponent = defineComponent({
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
      // submit empty capture value
      // details.value.forEach((t: any) => {
      //   if (t.attributeType == "inputBox") {
      //     const param = {
      //       attributeName: t.attributeName,
      //       value: t.value,
      //     } as CapturedValue;
      //     store.dispatch("workflowModule/saveCapturedValue", param);
      //   }
      // });
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
                Math.round((calcColumnNo / deviceConfig.colunms) * 100) + "%"
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
      const key = event.charCode || event.which || event.keyCode;
      if (key === 13) {
        event.stopPropagation();
        onTextChange(detail);
        store.dispatch("workflowModule/onSubmit");
      }
    };
    const focusInput = () => {
      let focusValue = "";
      if (store.state.workflowModule.screenDepth == 0) {
        focusValue = store.state.workflowModule.screenModel.focus;
      } else {
        focusValue = store.state.workflowModule.subScreenModel.focus;
      }
      if (input.value && input.value.length > 0) {
        let inputIndex = -1;
        for (let i = 0; i < details.value.length; i++) {
          if (
            details.value[i].attributeType === AttributeType.INPUT ||
            details.value[i].attributeType === AttributeType.PASSWORD
          ) {
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
export default InputComponent;
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
    // textarea {
    //   border: none;
    //   resize: none;
    //   padding-left: 4px;
    //   height: 24px;
    //   line-height: 1;
    //   font-size: 10px;
    //   color: #ffc58f;
    //   background-color: #00346e;
    //   &:focus {
    //     outline: none;
    //   }
    // }
    input {
      border: none;
      color: #ffc58f;
      background-color: #00346e;
      max-height: 32px;
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

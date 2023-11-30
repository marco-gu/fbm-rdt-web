<template>
  <div class="line-item inputs-container">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.name"
        class="label-block"
        :class="{ 'text-focus': isFocus }"
        :style="{
          flexBasis: widthArr[index],
        }"
      >
        {{ item.name }}
      </div>
      <div
        v-if="
          item.attributeName &&
          (inputType === 'password' || inputType === 'input')
        "
        class="input-block"
        :style="{
          flexBasis: widthArr[index],
        }"
      >
        <input
          ref="input"
          v-model="item.value"
          :autofocus="index === 0 && autoFocus"
          :type="inputType === 'password' ? 'password' : 'text'"
          @change="onTextChange(item)"
          :maxlength="
            convertMaxLength(item.maxLength) === 0
              ? convertMaxLength(item.maxLength) + 1
              : convertMaxLength(item.maxLength)
          "
          :tabindex="tabindex"
          @focus="onFocus()"
          @blur="onBlur()"
          :style="{
            width:
              convertMaxLength(item.maxLength) &&
              convertMaxLength(item.maxLength) > 0
                ? 9.6 * convertMaxLength(item.maxLength) + 'px'
                : convertMaxLength(item.maxLength) === 0
                ? '10px'
                : 'auto',
          }"
        />
      </div>
    </template>
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
const InputComponent = defineComponent({
  props: {
    details: {
      type: Array as PropType<LineDetail[]>,
    },
    tabindex: {
      type: Number,
    },
    inputType: {
      type: String,
    },
    autoFocus: {
      type: Boolean,
    },
  },
  setup(props) {
    const { details, tabindex, inputType, autoFocus } = toRefs(props);
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
            const x =
              details.value[i].coordinateValueX ||
              details.value[i].coordinateNameX;
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
    const focusInput = () => {
      if (autoFocus.value) {
        console.log(input.value);
        if (input.value) {
          input.value[0].focus();
        }
      }
    };
    watch(route, () => {
      focusInput();
    });
    const convertMaxLength = (maxLength: string | number | null) => {
      return maxLength ? Number(maxLength) : 0;
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
      convertMaxLength,
      widthArr,
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
    &.text-focus {
      // font-weight: bold;
    }
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

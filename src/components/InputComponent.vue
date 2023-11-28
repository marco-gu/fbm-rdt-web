<template>
  <div class="line-item inputs-container">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.name"
        class="label-block"
        :class="{ 'text-focus': isFocus }"
        :style="{
          flexBasis: item.coordinateNameX
            ? Number(item.coordinateNameX) === 1
              ? 'auto'
              : (Number(item.coordinateNameX) / 25) * 100 + '%'
            : 'auto',
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
          flexBasis: item.coordinateValueX
            ? ((25 - Number(item.coordinateValueX)) / 25) * 100 + '%'
            : 'auto',
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
} from "vue";
import { CapturedValue } from "../entity/request.entity";
import { useRoute } from "vue-router";
import { LineDetail } from "@/entity/screen.entity";
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

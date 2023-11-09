<template>
  <div class="line-item inputs-container">
    <div class="label-block" :class="{ 'text-focus': isFocus }">
      {{ labelName }}
    </div>
    <div class="input-block">
      <input
        ref="input"
        v-if="
          inputType === 'password' ||
          (inputType === 'input' && textLength < TEXT_MAX_LENGTH)
        "
        v-model="model"
        autofocus
        :type="inputType === 'password' ? 'password' : 'text'"
        @change="onTextChange()"
        :maxlength="max === '0' ? Number(max) + 1 : max"
        @focus="onFocus()"
        @blur="onBlur()"
      />
      <textarea
        v-else
        ref="textarea"
        v-model="model"
        autofocus
        rows="2"
        @change="onTextChange()"
        :maxlength="max"
        @focus="onFocus()"
        @blur="onBlur()"
      />
      <div class="measure-text-length" ref="measureTextLength">{{ model }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, nextTick, ref, toRefs, watch } from "vue";
import { CapturedValue } from "../entity/request.entity";
const InputComponent = defineComponent({
  props: {
    labelName: {
      type: String,
    },
    attributeName: {
      type: String,
    },
    defaultValue: {
      type: String,
    },
    inputType: {
      type: String,
    },
    max: {
      type: String,
    },
    labelX: {
      type: Number,
    },
    valueX: {
      type: Number,
    },
  },
  setup(props) {
    const { attributeName, labelName, defaultValue, inputType, max } =
      toRefs(props);
    const store = useStore();
    const model = ref();
    const measureTextLength = ref();
    const input = ref();
    const textarea = ref();
    const textLength = ref(0);
    model.value = defaultValue.value;
    const lastAttributeName = ref();
    const TEXT_MAX_LENGTH = ref(128);
    const isFocus = ref(false);

    const onTextChange = () => {
      const param = {
        attributeName: attributeName.value,
        value: model.value,
      } as CapturedValue;
      store.dispatch("workflowModule/saveCapturedValue", param);
      lastAttributeName.value = attributeName.value;
    };

    const onFocus = () => {
      isFocus.value = true;
    };
    const onBlur = () => {
      isFocus.value = false;
    };
    watch(model, () => {
      textLength.value = measureText();
      if (textLength.value >= TEXT_MAX_LENGTH.value) {
        nextTick(() => {
          textarea.value.focus();
        });
      } else {
        nextTick(() => {
          input.value.focus();
        });
      }
    });
    watch(labelName, (newValue) => {
      model.value = "";
    });
    watch(defaultValue, (newValue) => {
      nextTick(() => {
        if (newValue) {
          model.value = newValue;
        }
      });
    });
    const measureText = () => {
      return measureTextLength.value.clientWidth;
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
    };
  },
});
export default InputComponent;
</script>
<style lang="scss" scoped>
.inputs-container {
  width: 100%;
  justify-content: space-between;
  .label-block {
    text-align: left;
    &.text-focus {
      font-weight: bold;
    }
    // font-weight: bold;
  }
  .input-block {
    text-align: right;
    padding-left: 10px;
    display: flex;
    align-items: center;
    textarea {
      text-align: right;
      border: none;
      resize: none;
      border-radius: 3px;
      // width: 131px;
      padding-left: 13px;
      height: 24px;
      line-height: 1;
      font-size: 10px;
      &:focus {
        outline: none;
      }
    }
    input {
      text-align: right;
      border: none;
      border-radius: 3px;
      background-color: transparent;
      &:focus {
        outline: none;
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

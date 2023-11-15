<template>
  <div class="line-item inputs-container">
    <div
      v-if="labelName"
      class="label-block"
      :class="{ 'text-focus': isFocus }"
    >
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
        :autofocus="autoFocus"
        :type="inputType === 'password' ? 'password' : 'text'"
        @change="onTextChange()"
        :maxlength="max === '0' ? Number(max) + 1 : max"
        :tabindex="tabindex"
        @focus="onFocus()"
        @blur="onBlur()"
      />
      <textarea
        v-else
        ref="textarea"
        v-model="model"
        :autofocus="autoFocus"
        :tabindex="tabindex"
        rows="2"
        @change="onTextChange()"
        :maxlength="max === '0' ? Number(max) + 1 : max"
        @focus="onFocus()"
        @blur="onBlur()"
      />
      <div class="measure-text-length" ref="measureTextLength">{{ model }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, nextTick, ref, toRefs, watch, onMounted } from "vue";
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
    autoFocus: {
      type: Boolean,
    },
    tabindex: {
      type: Number,
    },
  },
  setup(props) {
    const {
      attributeName,
      labelName,
      defaultValue,
      inputType,
      max,
      autoFocus,
      tabindex,
    } = toRefs(props);
    const store = useStore();
    const model = ref();
    const measureTextLength = ref();
    const input = ref();
    const textarea = ref();
    const textLength = ref(0);
    model.value = defaultValue.value;
    const lastAttributeName = ref();
    const TEXT_MAX_LENGTH = ref(170);
    const isFocus = ref(false);
    onMounted(() => {
      if (autoFocus.value) {
        input.value.focus();
      }
    });

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

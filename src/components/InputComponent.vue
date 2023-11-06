<template>
  <div
    style="
      display: flex;
      justify-content: space-between;
      padding: 5px 5px;
      font-size: 12px;
    "
  >
    <span>{{ label }} </span>
    <input
      v-model="model"
      style="margin-left: 10px; border: 0px; text-align: right"
      autofocus
      @blur="blur()"
    />
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
  },
  setup(props) {
    const { attributeName, labelName, defaultValue } = toRefs(props);
    const store = useStore();
    const label = ref();
    const model = ref();
    model.value = defaultValue.value;
    const lastAttributeName = ref();
    label.value = labelName.value;
    const blur = () => {
      const param = {
        attributeName: attributeName.value,
        value: model.value,
      } as CapturedValue;
      store.dispatch("workflowModule/saveCapturedValue", param);
      lastAttributeName.value = attributeName.value;
    };
    watch(defaultValue, (newValue) => {
      console.log(newValue);
      nextTick(() => {
        model.value = newValue;
      });
    });
    watch(labelName, (newValue) => {
      label.value = newValue;
      model.value = "";
    });
    return {
      label,
      model,
      blur,
    };
  },
});
export default InputComponent;
</script>
<style lang="scss" scoped>
input:focus {
  outline: none;
}
</style>

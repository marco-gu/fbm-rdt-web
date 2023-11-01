<template>
  <div
    style="display: flex; justify-content: space-between; margin-bottom: 10px"
  >
    <span>{{ label }} </span>
    <input v-model="model" style="margin-left: 10px" @blur="blur()" />
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, ref, toRefs, watch } from "vue";
const InputBoxComponent = defineComponent({
  props: {
    labelName: {
      type: String,
    },
    attributeName: {
      type: String,
    },
  },
  setup(props) {
    const { attributeName, labelName } = toRefs(props);
    const store = useStore();
    const label = ref();
    const model = ref();
    const lastAttributeName = ref();
    label.value = labelName.value;
    const blur = () => {
      const param = {
        attributeName: attributeName.value,
        value: model.value,
      };
      store.dispatch("workflowModule/addParam", param);
      lastAttributeName.value = attributeName.value;
    };

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
export default InputBoxComponent;
</script>

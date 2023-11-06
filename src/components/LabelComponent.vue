<template>
  <div
    style="
      display: flex;
      justify-content: space-between;
      padding: 5px 5px;
      font-size: 12px;
      min-height: 25px;
    "
  >
    <div>
      <span>{{ name }} </span>
    </div>
    <div>{{ value }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, ref, toRefs, watch } from "vue";
const LabelComponent = defineComponent({
  props: {
    labelName: {
      type: String,
    },
    labelValue: {
      type: String,
    },
  },
  setup(props) {
    const { labelName, labelValue } = toRefs(props);
    const name = ref();
    name.value = labelName.value;
    const value = ref();
    value.value = labelValue.value;
    watch(labelName, (newValue) => {
      nextTick(() => {
        name.value = newValue;
      });
    });
    watch(labelValue, (newValue) => {
      nextTick(() => {
        value.value = newValue;
      });
    });
    return {
      name,
      value,
    };
  },
});
export default LabelComponent;
</script>

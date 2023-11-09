<template>
  <div class="line-item" :class="{ 'last-item': isBottomElement }">
    <div class="label-item">
      {{ name }}
    </div>
    <div class="label-item">{{ value }}</div>
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
    isBottomElement: {
      type: Boolean,
    },
  },
  setup(props) {
    const { labelName, labelValue, isBottomElement } = toRefs(props);
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
<style lang="scss" scoped>
.label-item {
  display: inline-block;
}
.last-item {
  position: absolute;
  bottom: 0;
  background-color: inherit;
  width: 100%;
}
</style>

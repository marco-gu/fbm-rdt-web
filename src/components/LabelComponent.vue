<template>
  <div
    class="line-item label-container"
    :class="{ 'last-item': isBottomElement }"
  >
    <div class="label-block">
      {{ name }}
    </div>
    <div class="value-block">{{ value }}</div>
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
.label-container {
  width: 100%;
  justify-content: space-between;
  .label-block {
    text-align: left;
  }
  .value-block {
    text-align: right;
    padding-left: 10px;
    display: flex;
    align-items: center;
  }
}
.last-item {
  position: absolute;
  bottom: 0;
  background-color: inherit;
  width: 100%;
}
</style>

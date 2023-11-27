<template>
  <div class="line-item label-container">
    <div
      class="label-block"
      :style="{
        flexBasis: valueX ? (Number(valueX) / 25) * 100 + '%' : 'auto',
      }"
    >
      {{ name }}
    </div>
    <div
      class="value-block"
      :style="{
        flexBasis: valueX ? (1 - Number(valueX) / 25) * 100 + '%' : 'auto',
      }"
    >
      {{ value }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, ref, toRefs, watch } from "vue";
const LabelComponent2 = defineComponent({
  props: {
    labelName: {
      type: String,
    },
    labelValue: {
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
export default LabelComponent2;
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

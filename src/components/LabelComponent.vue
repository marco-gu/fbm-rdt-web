<template>
  <div class="line-item label-container">
    <div
      class="label-block"
      v-for="item in details"
      v-bind:key="item"
      :style="{
        flexBasis:
          item.coordinateNameX == 1
            ? 'auto'
            : (Number(item.coordinateNameX) / totalColums) * 100 + '%',
      }"
    >
      {{ item.name }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { COLUMN_MC93 } from "../entity/const.entity";
const LabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const totalColums = COLUMN_MC93;
    return {
      totalColums,
    };
  },
});
export default LabelComponent;
</script>
<style lang="scss" scoped>
// .label-container {
//   width: 100%;
//   justify-content: space-between;
//   .label-block {
//     text-align: left;
//   }
//   .value-block {
//     text-align: right;
//     padding-left: 10px;
//     display: flex;
//     align-items: center;
//   }
// }
// .last-item {
//   position: absolute;
//   bottom: 0;
//   background-color: inherit;
//   width: 100%;
// }
</style>

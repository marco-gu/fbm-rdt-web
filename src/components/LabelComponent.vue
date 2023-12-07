<template>
  <div class="line-item label-container" style="width: 100%">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.name"
        class="label-block"
        :style="{
          flexBasis:
            item.coordinateNameX == 1
              ? 'auto'
              : (1 - Number(item.coordinateNameX) / totalColums) * 100 + '%',
        }"
      >
        {{ item.name }}
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import * as deviceConfig from "@/assets/device/mc93.json";
const LabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const totalColums = deviceConfig.colunms;
    return {
      totalColums,
    };
  },
});
export default LabelComponent;
</script>

<template>
  <div class="line-item label-container" style="width: 100%">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.name"
        class="label-block"
        :style="{
          flexBasis: widthArr[index],
        }"
      >
        {{ item.name }}
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Ref, defineComponent, onMounted, ref, toRefs } from "vue";
import * as deviceConfig from "@/assets/device/mc93.json";
const LabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const totalColums = deviceConfig.colunms;
    const widthArr: Ref<any> = ref([]);
    onMounted(() => {
      mapRawData();
    });
    const mapRawData = () => {
      if (details.value) {
        let lengthRemain = deviceConfig.colunms + 1;
        const reversedArr = [];
        if (details.value.length === 1) {
          reversedArr.push("100%");
        } else {
          for (let i = details.value.length - 1; i >= 0; i--) {
            const x =
              details.value[i].coordinateValueX ||
              details.value[i].coordinateNameX;
            if (x) {
              const calcColumnNo = lengthRemain - Number(x);
              reversedArr.push(
                Math.floor((calcColumnNo / deviceConfig.colunms) * 100) + "%"
              );
              lengthRemain = x;
            }
          }
        }
        widthArr.value = reversedArr.reverse();
        details.value.forEach((item: any) => {
          item.value = item.value || "";
        });
      }
    };
    return {
      totalColums,
      widthArr,
    };
  },
});
export default LabelComponent;
</script>

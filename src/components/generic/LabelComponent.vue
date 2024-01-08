<template>
  <div class="line-item label-container" style="width: 100%">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.value"
        class="label-block"
        :style="{
          flexBasis: widthArr[index],
          fontSize: calcFontSize(item),
        }"
      >
        {{ item.value }}
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Ref, defineComponent, onMounted, ref, toRefs } from "vue";
import { calculateWidthItems } from "@/utils/screen.utils";
import { FieldDto } from "@/entity/response.entity";
const LabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const widthArr: Ref<any> = ref([]);
    onMounted(() => {
      mapRawData();
    });
    const mapRawData = () => {
      if (details.value) {
        widthArr.value = widthArr.value = calculateWidthItems(details);
        details.value.forEach((item: any) => {
          item.value = item.value || "";
        });
      }
    };
    const calcFontSize = (item: FieldDto) => {
      const screen = localStorage.getItem("screen") as string;
      const fontSize = JSON.parse(screen).fontSize;
      console.log(fontSize);
      return fontSize + item.fontSize + "px";
    };
    return {
      widthArr,
      calcFontSize,
    };
  },
});
export default LabelComponent;
</script>

<template>
  <div class="line-item" :class="{ 'last-item': isBottomElement }">
    <!-- <div style="padding: 5px 5px; font-size: 12px; cursor: pointer"> -->
    <!-- </div> -->
    <div class="label-item">
      <span @click="onClick" style="cursor: pointer">{{ name }} </span>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, nextTick, ref, toRefs, watch } from "vue";
import { CapturedValue } from "../entity/request.entity";
const MenuComponent = defineComponent({
  props: {
    menuName: {
      type: String,
    },
    isBottomElement: {
      type: Boolean,
    },
  },
  setup(props) {
    const { menuName, isBottomElement } = toRefs(props);
    const store = useStore();
    const name = ref();
    name.value = menuName.value;
    const onClick = () => {
      const param = {
        attributeName: "I_Field01",
        value: menuName.value?.substring(0, menuName.value?.indexOf(".")),
      } as CapturedValue;
      store.dispatch("workflowModule/saveCapturedValue", param).then(() => {
        store.dispatch("workflowModule/onSubmit");
      });
    };
    watch(menuName, (newValue) => {
      nextTick(() => {
        name.value = newValue;
      });
    });
    return {
      name,
      onClick,
    };
  },
});
export default MenuComponent;
</script>
<style lang="scss" scoped>
input:focus {
  outline: none;
}
</style>

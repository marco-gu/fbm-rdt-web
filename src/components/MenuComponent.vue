<template>
  <div style="padding: 5px 5px; font-size: 12px; cursor: pointer">
    <span @click="onClick">{{ name }} </span>
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
  },
  setup(props) {
    const { menuName } = toRefs(props);
    const store = useStore();
    const name = ref();
    name.value = menuName.value;
    const onClick = () => {
      const param = {
        attributeName: "I_Field01",
        value: "1",
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

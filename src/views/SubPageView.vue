<template>
  <div @click="onClick()" v-show="!isGenericShow">
    1. Generic Setting <button @click="exit()">exit</button>
  </div>
  <component v-show="isGenericShow" :is="comp.component"></component>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import GenericSettingView from "@/views/GenericSettingView.vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    GenericSettingView,
  },
  setup() {
    const store = useStore();
    const isGenericShow = ref(false);
    const onClick = () => {
      console.log("onClick");
      store.commit("workflowModule/saveGenericStatus", true);
    };
    watch(store.state.workflowModule, () => {
      isGenericShow.value = store.state.workflowModule.isGenericPageShow;
      console.log(isGenericShow.value);
    });
    const exit = () => {
      console.log("exit");
      store.commit("workflowModule/saveSubPageStatus", false);
    };
    const comp = {
      component: GenericSettingView,
    };
    return {
      onClick,
      comp,
      isGenericShow,
      exit,
    };
  },
});
</script>

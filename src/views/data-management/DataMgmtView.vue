<template>
  <common-header-component
    :titles="titles"
    :icons="['home', 'search', 'expand']"
    @onHome="goHome"
    @onExpand="onExpandClick"
    @onSearch="onSearch($event)"
  />
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import router from "@/router";
import { defineComponent, ref } from "vue";
const DataMgmtView = defineComponent({
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const titles = ref(["Data Management"]);
    const goHome = () => {
      router.push("/home");
    };
    const onExpandClick = () => {
      console.log("expand");
    };
    const onSearch = (e: string) => {
      console.log(e);
    };
    return { titles, goHome, onExpandClick, onSearch };
  },
});
export default DataMgmtView;
</script>
<style scoped lang="scss"></style>

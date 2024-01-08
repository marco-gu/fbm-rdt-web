<template>
  <div ref="scrollRef" class="scrollFake"></div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  setup() {
    const scrollRef = ref();
    const store = useStore();
    const scrollHeight = 500 / store.state.workflowModule.screenModel.totalPage;
    const currentPage = store.state.workflowModule.screenModel.currentPage;
    onMounted(() => {
      if (store.state.workflowModule.screenDepth == 0) {
        if (store.state.workflowModule.screenModel.totalPage == 1) {
          scrollRef.value.style.display = "none";
        } else {
          scrollRef.value.style.height = scrollHeight + "px";
          scrollRef.value.style.top =
            50 + scrollHeight * (currentPage - 1) + "px";
        }
      } else {
        scrollRef.value.style.display = "none";
      }
    });
    return {
      scrollRef,
    };
  },
});
</script>

<style lang="scss" scoped>
.scrollFake {
  width: 5px;
  height: 500px;
  position: absolute;
  right: 3px;
  top: 50px;
  overflow-y: auto;
  background: #ffeead;
  border: 0.5px solid #ffeead;
  border-radius: 3px;
}
</style>

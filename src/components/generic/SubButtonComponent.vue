<template>
  <div class="pop_btn" style="margin-left: auto; padding: 0px">
    <i
      :class="screenDepth == 0 ? 'fa-solid fa-plus' : 'fa-solid fa-minus'"
      @click="onClickSubScreen"
    ></i>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "@/store";
import _ from "lodash";

const SubButtonComponent = defineComponent({
  setup() {
    const store = useStore();
    const screenDepth = ref(store.state.workflowModule.screenDepth);
    const subScreenModel = _.cloneDeep(
      store.state.workflowModule.subScreenModel
    );
    const onClickSubScreen = () => {
      if (screenDepth.value == 0) {
        if (!_.isEmpty(subScreenModel)) {
          store.commit("workflowModule/onOpenSubScreen", true);
        } else {
          store.dispatch("workflowModule/onClickSubBtn");
        }
      } else {
        store.commit("workflowModule/onCloseSubScreen", false);
      }
    };
    return {
      onClickSubScreen,
      screenDepth,
    };
  },
});
export default SubButtonComponent;
</script>
<style lang="scss" scoped>
.pop_btn {
  display: inline-block;
  width: 34px;
  height: 34px;
  position: absolute;
  bottom: 11px;
  right: 12px;
  text-align: center;
  color: #ffeead;
  background-color: #00346e;
  font-size: 24px;
  border-radius: 3px;
}
.pop_btn:hover {
  cursor: pointer;
  width: 51px;
  height: 51px;
  right: 6px;
  color: #ffc58f;
  font-size: 36px;
  font-weight: 900;
}
</style>

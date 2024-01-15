<template>
  <div class="pop_btn" @click="onClickSubScreen" style="margin-left: auto">
    <i
      :class="screenDepth == 0 ? 'fa-solid fa-plus' : 'fa-solid fa-minus'"
      style="margin-top: 10px"
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
          store.dispatch("workflowModule/onSubmitSubForm");
        }
      } else {
        store.commit("workflowModule/onCloseSubScreen", false);
      }
      store.dispatch("screenModule/hideMessage");
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
  right: 10px;
  text-align: center;
  color: #ffeead;
  background-color: #00346e;
  font-size: 16px;
  border-radius: 3px;
  z-index: 10;
  cursor: pointer;
  vertical-align: middle;
}
// .pop_btn:hover {
//   cursor: pointer;
//   width: 32px;
//   height: 32px;
//   right: 4px;
//   color: #ffc58f;
//   font-size: 28px;
//   font-weight: 900;
// }
</style>

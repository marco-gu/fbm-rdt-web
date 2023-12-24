<template>
  <div style="margin-left: auto; padding: 10px">
    <i
      :class="
        screenDepth == 0 ? 'fa-solid fa-plus fa-xl' : 'fa-solid fa-minus fa-xl'
      "
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
    const screenModel = _.cloneDeep(store.state.workflowModule.screenModel);
    const subScreenModel = _.cloneDeep(
      store.state.workflowModule.subScreenModel
    );
    const onClickSubScreen = () => {
      if (screenDepth.value == 0) {
        if (
          !_.isEmpty(subScreenModel) &&
          subScreenModel.workFlowCollection.triggerByWorkFlowId ==
            screenModel.workFlowCollection.workFlowId &&
          subScreenModel.workFlowCollection.triggerByWorkNodeId ==
            screenModel.workFlowCollection.workNodeId
        ) {
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

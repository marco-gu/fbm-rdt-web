<template>
  <div class="line-item label-container" style="width: 100%; overflow: hidden">
    <div class="label-block">
      {{ label }}
    </div>
    <div v-if="isSelected" style="margin-left: 10px">
      <i class="fa-solid fa-check-double"></i>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, ref, toRefs, watch } from "vue";
import _ from "lodash";
const ListItemLabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const store = useStore();
    const sequence = ref();
    const attributeId = ref();
    const label = ref();
    const isSelected = ref(false);
    if (!_.isUndefined(details.value)) {
      attributeId.value = details.value[0].attributeId;
      sequence.value = details.value[0].sequence;
      label.value = details.value[0].value;
    }
    watch(
      () =>
        store.state.workflowModule.screenDepth == 0
          ? store.state.workflowModule.screenModel.selectedItem
          : store.state.workflowModule.subScreenModel.selectedItem,
      (value, oldValue) => {
        if (
          value.sequence == sequence.value &&
          value.attributeId == attributeId.value
        ) {
          isSelected.value = true;
        }
        if (
          oldValue.sequence == sequence.value &&
          oldValue.attributeId == attributeId.value
        ) {
          isSelected.value = false;
        }
      },
      {
        deep: true,
      }
    );
    return {
      label,
      isSelected,
    };
  },
});
export default ListItemLabelComponent;
</script>

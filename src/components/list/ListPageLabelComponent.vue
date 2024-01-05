<template>
  <div
    class="line-item label-container"
    style="width: 100%; height: 100%; align-items: flex-end"
  >
    <div class="label-block" style="font-size: 16px">
      <span>
        {{ pageDesc }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, onMounted, ref, toRefs } from "vue";
import _ from "lodash";
const ListPageLabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const result = ref();
    result.value = details.value;
    const store = useStore();
    const pageDesc = ref();
    onMounted(() => {
      const map = store.state.workflowModule.screenModel.singleListCollection;
      map.forEach((val, key) => {
        if (
          !_.isUndefined(details.value) &&
          key == details.value[0].attributeId
        ) {
          const total = val.total as number;
          const pageSize = val.pageSize as number;
          const currentPage = val.currentPage as number;
          const totalPage = Math.ceil(total / pageSize);
          switch (details.value[0].style) {
            case 0:
              pageDesc.value = "(Total " + total + " options)";
              break;
            case 1:
              pageDesc.value = "(Page " + currentPage + " of" + totalPage + ")";
              break;
            default:
              pageDesc.value = "(Total " + total + " options)";
              break;
          }
        }
      });
    });
    return {
      result,
      pageDesc,
    };
  },
});
export default ListPageLabelComponent;
</script>

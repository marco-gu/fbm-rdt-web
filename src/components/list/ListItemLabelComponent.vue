<template>
  <div class="line-item label-container" style="width: 100%; overflow: hidden">
    <template v-for="(item, index) in result" :key="index">
      <div class="label-block">
        {{ item.value }}
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs } from "vue";
const ListItemLabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const result = ref();
    result.value = details.value;
    return {
      result,
    };
  },
});
export default ListItemLabelComponent;
</script>

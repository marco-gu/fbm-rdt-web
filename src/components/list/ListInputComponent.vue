<template>
  <div class="line-item inputs-container">
    <template v-for="(item, index) in details" :key="index">
      <div v-if="item.attributeType === 'listSingleLabel'" class="label-block">
        {{ item.value }}
      </div>
      <div v-if="item.attributeType === 'listSingleInput'">
        <div class="input-block">
          <input
            ref="input"
            v-model="item.value"
            :autofocus="
              store.state.workflowModule.screenModel.focus ===
              item.attributeName
            "
            style="width: 15px"
            @change="onTextChange(item)"
            @keyup="onKeyPress($event)"
          />
        </div>
      </div>
    </template>
    <div class="label-block" style="margin-left: 10px">
      {{ pageDesc }}
    </div>
  </div>
</template>
<script lang="ts">
import { CapturedValue } from "@/entity/request.entity";
import { useStore } from "@/store";
import { defineComponent, ref, toRefs, onMounted } from "vue";
const ListInputComponent = defineComponent({
  props: {
    details: {
      type: Array as any,
    },
  },
  setup(props) {
    const store = useStore();
    const { details } = toRefs(props);
    const input = ref();
    const pageDesc = ref();
    onMounted(() => {
      const map = store.state.workflowModule.screenModel.singleListCollection;
      map.forEach((val, key) => {
        if (key == details.value[0].attributeId) {
          const total = val.total as number;
          const pageSize = val.pageSize as number;
          const currentPage = val.currentPage as number;
          if (total > pageSize * currentPage) {
            pageDesc.value = "(+ total " + total + ")";
          } else if (total < pageSize * currentPage) {
            if (currentPage > 1) {
              pageDesc.value = "(- total " + total + ")";
            } else {
              pageDesc.value = "(total " + total + ")";
            }
          }
        }
      });
      input.value[0].focus();
    });
    const onKeyPress = (event: KeyboardEvent) => {
      const key = event.charCode || event.which || event.keyCode;
      switch (key) {
        case 13: {
          store.dispatch("workflowModule/onSubmit");
          event.stopPropagation();
          break;
        }
      }
    };
    const onTextChange = (item: any) => {
      const param = {
        attributeName: item.attributeName,
        value: item.value,
      } as CapturedValue;
      store.dispatch("workflowModule/saveCapturedValue", param);
    };
    return {
      pageDesc,
      onTextChange,
      input,
      onKeyPress,
      store,
    };
  },
});
export default ListInputComponent;
</script>
<style lang="scss" scoped>
.inputs-container {
  width: 100%;
  .label-block {
    text-align: left;
  }
  .input-block {
    display: flex;
    align-items: center;
    padding-left: 2px;
    textarea {
      border: none;
      resize: none;
      padding-left: 4px;
      height: 24px;
      line-height: 1;
      font-size: 10px;
      color: #ffc58f;
      background-color: #00346e;
      &:focus {
        outline: none;
      }
    }
    input {
      border: none;
      color: #ffc58f;
      background-color: #00346e;
      &:focus {
        outline: none;
        background-color: blue;
      }
      &:active {
        background-color: blue;
      }
    }
  }
}
</style>

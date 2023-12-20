<template>
  <div class="line-item inputs-container">
    <div class="label-block">
      {{ inputLabel }}
    </div>
    <div class="input-block">
      <input
        ref="input"
        v-model="optionValue"
        style="width: 15px"
        @change="onTextChange()"
      />
    </div>
    <div class="label-block" style="margin-left: 10px">
      {{ pageDesc }}
    </div>
  </div>
</template>
<script lang="ts">
import { CapturedValue } from "@/entity/request.entity";
import { ListAttributeType } from "@/entity/response.entity";
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
    const inputLabel = ref();
    const pageDesc =
      "(total " + store.state.workflowModule.screenModel.list.total + ")";
    const optionValue = ref();
    const param = {} as CapturedValue;
    onMounted(() => {
      details.value.forEach((t: any) => {
        switch (t.attributeType) {
          case ListAttributeType.LIST_SINGLE_INPUT:
            param.attributeName = t.attributeName;
            param.value = t.value;
            break;
          case ListAttributeType.LIST_SINGLE_LABEL:
            inputLabel.value = t.value;
        }
      });
      input.value.focus();
      input.value.addEventListener("keyup", handleKeyDown);
    });
    const handleKeyDown = (event: any) => {
      switch (event.keyCode) {
        case 13:
          store.dispatch("workflowModule/onSubmit");
          event.stopPropagation();
          break;
        case 27:
          store.dispatch("workflowModule/onCancel");
          break;
      }
    };
    const onTextChange = () => {
      param.value = optionValue.value;
      store.dispatch("workflowModule/saveCapturedValue", param);
    };
    return {
      inputLabel,
      pageDesc,
      optionValue,
      onTextChange,
      input,
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

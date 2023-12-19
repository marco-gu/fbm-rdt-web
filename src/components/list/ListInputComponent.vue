<template>
  <div class="line-item inputs-container">
    <div class="label-block">
      {{ label }}
    </div>
    <div class="input-block">
      <input
        id="input"
        ref="input"
        :autofocus="true"
        v-model="optionValue"
        style="width: 10px"
        @change="onTextChange()"
      />
    </div>
    <div class="label-block" style="margin-left: 10px">
      {{ page }}
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
    const label = ref();
    const page = ref("(total 2)");
    const items = details.value;
    const optionValue = ref();
    const input = ref();
    const param = {
      attributeName: "",
      value: "",
    } as CapturedValue;
    onMounted(() => {
      details.value.forEach((t: any) => {
        if (t.attributeType == "listSingleInput") {
          param.attributeName = t.attributeName;
          param.value = t.value;
          store.dispatch("workflowModule/saveCapturedValue", param);
        }
      });
      input.value.focus();
      input.value.addEventListener("keyup", handleKeyDown);
    });
    const handleKeyDown = (event: any) => {
      switch (event.keyCode) {
        case 13:
          store.dispatch("workflowModule/onSubmit");
          break;
        case 27:
          store.dispatch("workflowModule/onCancel");
          break;
      }

      event.stopPropagation();
    };
    const onTextChange = (detail: any) => {
      param.value = optionValue.value;
      store.dispatch("workflowModule/saveCapturedValue", param);
    };
    items?.forEach((t: any) => {
      switch (t.attributeType) {
        case "listSingleLabel":
          label.value = t.value;
          break;
        case "listSinglePage":
          page.value = t.value;
          break;
      }
    });
    return {
      label,
      page,
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
  // justify-content: space-between;
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
.measure-text-length {
  height: 0;
  opacity: 0;
  position: absolute;
  left: -1000px;
}
</style>

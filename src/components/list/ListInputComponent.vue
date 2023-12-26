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
            style="width: 15px"
            @change="onTextChange(item)"
            @keyup="onKeyPress($event)"
            :style="{
              width:
                item.maxLength > 0
                  ? item.maxLength > 1
                    ? (14.4 * item.maxLength > screenWidth
                        ? screenWidth - 30
                        : 14.4 * item.maxLength) + 'px'
                    : '20px'
                  : 'auto',
            }"
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
import { ListAttributeType } from "@/entity/response.entity";
import { useStore } from "@/store";
import { defineComponent, ref, toRefs, onMounted, Ref } from "vue";
import * as deviceConfig from "@/assets/device/default.json";
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
    const screenWidth: Ref<number> = ref(deviceConfig.width as number);
    onMounted(() => {
      focusInput();
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
      // input.value[0].focus();
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
    const focusInput = () => {
      const focusValue = store.state.workflowModule.screenModel.focus;
      if (input.value && input.value.length > 0) {
        let inputIndex = -1;
        for (let i = 0; i < details.value.length; i++) {
          if (
            details.value[i].attributeType ===
            ListAttributeType.LIST_SINGLE_INPUT
          ) {
            inputIndex++;
          }
          if (details.value[i].attributeName === focusValue) {
            if (inputIndex > -1) {
              input.value[inputIndex].focus();
            }
            break;
          }
        }
      }
    };
    return {
      pageDesc,
      onTextChange,
      input,
      onKeyPress,
      store,
      screenWidth,
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

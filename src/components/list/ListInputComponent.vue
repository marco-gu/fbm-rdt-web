<template>
  <div class="line-item inputs-container">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.attributeType === 'label'"
        class="label-block"
        :style="{
          flexBasis: widthArr[index],
        }"
      >
        {{ item.value }}
      </div>
      <div
        v-if="item.attributeType === 'inputBox'"
        :style="{
          flexBasis: widthArr[index],
        }"
      >
        <div class="input-block">
          <input
            ref="input"
            v-model="item.value"
            style="width: 15px"
            @change="onTextChange(item)"
            @input="onInput(item)"
            @keyup="onKeyPress($event, item)"
            :style="{
              backgroundColor:
                store.state.workflowModule.screenDepth == 0
                  ? '#00346e'
                  : '#0E1925',
              width: inputLength(item.maxLength),
            }"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { CapturedValue } from "@/entity/request.entity";
import { useStore } from "@/store";
import { defineComponent, ref, toRefs, onMounted, Ref } from "vue";
import { SelectedItem } from "@/entity/screen.entity";
import { calculateWidthItems, inputLength } from "@/utils/screen.utils";
import { AttributeType, FieldDto } from "@/entity/response.entity";

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
    const widthArr: Ref<any> = ref([]);
    onMounted(() => {
      focusInput();
      mapRawData();
    });
    const mapRawData = () => {
      if (details.value) {
        widthArr.value = calculateWidthItems(details);
        details.value.forEach((item: any) => {
          item.value = item.value || "";
        });
      }
    };
    const onKeyPress = (event: KeyboardEvent, item: FieldDto) => {
      const key = event.charCode || event.which || event.keyCode;
      console.log(key);
      switch (key) {
        case 13: {
          if (store.state.screenModule.showMessage) {
            store.dispatch("screenModule/hideMessage");
          } else {
            store.dispatch("workflowModule/onSubmit");
          }
          event.stopPropagation();
          break;
        }
        case 119: {
          if (store.state.screenModule.showMessage) {
            store.dispatch("screenModule/hideMessage");
          } else {
            const param = {
              attributeName: item.attributeName,
              value: "-",
            } as CapturedValue;
            store.dispatch("workflowModule/saveCapturedValue", param);
            store.dispatch("workflowModule/onSubmit");
          }
          event.stopPropagation();
          break;
        }
        case 118: {
          if (store.state.screenModule.showMessage) {
            store.dispatch("screenModule/hideMessage");
          } else {
            const param = {
              attributeName: item.attributeName,
              value: "+",
            } as CapturedValue;
            store.dispatch("workflowModule/saveCapturedValue", param);
            store.dispatch("workflowModule/onSubmit");
          }
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
      let focusValue = "";
      if (store.state.workflowModule.screenDepth == 0) {
        focusValue = store.state.workflowModule.screenModel.focus;
      } else {
        focusValue = store.state.workflowModule.subScreenModel.focus;
      }
      if (input.value && input.value.length > 0) {
        let inputIndex = -1;
        for (let i = 0; i < details.value.length; i++) {
          if (details.value[i].attributeType === AttributeType.INPUT) {
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
    const onInput = (item: any) => {
      const payload = {} as SelectedItem;
      payload.attributeId = item.attributeId;
      payload.sequence = item.value;
      store.commit("workflowModule/saveSelectedItem", payload);
    };
    return {
      onTextChange,
      input,
      onKeyPress,
      store,
      onInput,
      inputLength,
      widthArr,
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
  }
}
</style>

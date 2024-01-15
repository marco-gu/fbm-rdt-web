<template>
  <div class="line-item inputs-container">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.attributeType === 'label'"
        v-show="!item.isHidden"
        class="label-block"
        :style="{
          // color: item.color || '',
          flexBasis: widthArr[index],
        }"
      >
        {{ item.value }}
      </div>
      <div
        v-if="
          item.attributeType === 'inputBox' || item.attributeType === 'password'
        "
        v-show="!item.isHidden"
        class="input-block"
        :style="{
          // color: item.color || '',
          flexBasis: widthArr[index],
        }"
      >
        <input
          ref="input"
          v-model="item.value"
          :autofocus="
            store.state.workflowModule.screenModel.focus === item.attributeName
          "
          :type="type"
          @change="onTextChange(item)"
          @input="onInput(item)"
          :maxlength="!item.maxLength ? 1 : item.maxLength"
          :tabindex="item.sequence"
          :required="item.required"
          :pattern="item.regexPattern"
          @keyup="onKeyPress($event, item)"
          @focus="onFocus()"
          @blur="onBlur()"
          @keydown.tab="onTab($event)"
          :style="{
            backgroundColor:
              store.state.workflowModule.screenDepth == 0
                ? '#00346e'
                : '#0E1925',
            width: inputLength(item.maxLength),
          }"
        />
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import {
  defineComponent,
  ref,
  toRefs,
  onMounted,
  Ref,
  watch,
  onUpdated,
} from "vue";
import { CapturedValue } from "@/entity/request.entity";
import {
  AttributeType,
  EventType,
  FieldDto,
  ScreenFieldEventDto,
} from "@/entity/response.entity";
import { calculateWidthItems, inputLength } from "@/utils/screen.utils";
import _ from "lodash";
const InputComponent = defineComponent({
  props: {
    details: {
      type: Array as any,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const store = useStore();
    const model = ref();
    const input = ref();
    const textarea = ref();
    const textLength = ref(0);
    const isFocus = ref(false);
    const widthArr: Ref<any> = ref([]);
    const attributeName = ref();
    const type = ref();
    onMounted(() => {
      mapRawData();
      // focusInput();
    });
    onUpdated(() => {
      focusInput();
    });
    const onInput = (detail: FieldDto) => {
      if (detail.events)
        detail.events.forEach((event) => {
          if (event.triggeredBy == "inputChange") {
            const param = {
              eventValue: event.eventValue,
              attributeName: detail.attributeName,
              value: detail.value,
              screenDepth: store.state.workflowModule.screenDepth,
            };
            store.commit("workflowModule/saveFormulaParam", param);
          }
        });
    };
    const onTextChange = (detail: FieldDto) => {
      const param = {
        attributeName: detail.attributeName,
        value: detail.value,
      } as CapturedValue;
      store.dispatch("workflowModule/saveCapturedValue", param);
    };
    const mapRawData = () => {
      if (details.value) {
        widthArr.value = calculateWidthItems(details);
        details.value.forEach((item: any) => {
          if (
            item.attributeType === "inputBox" ||
            item.attributeType === "password"
          ) {
            attributeName.value = item.attributeName;
            if (item.attributeType == "password") {
              type.value = "password";
            } else {
              if (item.dataType == "int") {
                type.value = "number";
              } else {
                type.value = "text";
              }
            }
          }
          item.value = item.value || "";
        });
      }
    };
    const onFocus = () => {
      isFocus.value = true;
      const focus =
        store.state.workflowModule.screenDepth == 0
          ? store.state.workflowModule.screenModel.focus
          : store.state.workflowModule.subScreenModel.focus;
      if (focus !== attributeName.value) {
        store.commit("workflowModule/setCurrentFocus", attributeName.value);
      }
    };
    const onBlur = () => {
      isFocus.value = false;
    };

    const onKeyPress = (event: KeyboardEvent, detail: FieldDto) => {
      const key = event.charCode || event.which || event.keyCode;
      const events = {
        enterEvent: {} as ScreenFieldEventDto,
      };
      if (!_.isUndefined(detail.events) && detail.events.length > 0) {
        detail.events.forEach((t) => {
          if (t.triggeredBy == "enter") {
            events.enterEvent = t;
          }
        });
      }
      if (key === 13) {
        event.stopPropagation();
        if (store.state.screenModule.showMessage) {
          store.dispatch("screenModule/hideMessage");
        } else {
          if (!_.isEmpty(events.enterEvent)) {
            switch (events.enterEvent.eventType) {
              case EventType.TAB:
                onTab(event);
                break;
              case EventType.SUBMIT: {
                const actionkey = detail.attributeName + "Enter" + "Submit";
                store.dispatch("workflowModule/onSubmit", actionkey);
                break;
              }
              case EventType.SUBFORM: {
                const actionkey = detail.attributeName + "Enter" + "SubForm";
                store.dispatch("workflowModule/onSubmitSubForm", actionkey);
                break;
              }
              case EventType.SUBMIT_OR_TAB_NONE_BLANK:
                if (_.isEmpty(detail.value)) {
                  const actionkey = detail.attributeName + "Enter" + "Submit";
                  store.dispatch("workflowModule/onSubmit", actionkey);
                } else {
                  onTab(event);
                }
                break;
              case EventType.SUBFORM_OR_TAB_NONE_BLANK:
                if (_.isEmpty(detail.value)) {
                  const actionkey = detail.attributeName + "Enter" + "SubForm";
                  store.dispatch("workflowModule/onSubmitSubForm", actionkey);
                } else {
                  onTab(event);
                }
                break;
              case EventType.SUBFORM_OR_ENTIRE_FORM_SUBMIT:
                if (_.isEmpty(detail.value)) {
                  const actionkey = detail.attributeName + "Enter" + "Submit";
                  store.dispatch("workflowModule/onSubmit", actionkey);
                } else {
                  store.dispatch("workflowModule/onSubmit");
                }
                break;
            }
          } else {
            store.dispatch("workflowModule/onSubmit");
          }
        }
      }
    };
    watch(
      () =>
        store.state.workflowModule.screenDepth == 0
          ? store.state.workflowModule.screenModel.focus
          : store.state.workflowModule.subScreenModel.focus,
      () => {
        focusInput();
      },
      {
        deep: true,
      }
    );
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
          if (
            details.value[i].attributeType === AttributeType.INPUT ||
            details.value[i].attributeType === AttributeType.PASSWORD
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
    const onTab = (event: KeyboardEvent) => {
      event.preventDefault();
      store.commit("workflowModule/moveToNextFocus", attributeName.value);
    };
    return {
      model,
      onTextChange,
      textLength,
      input,
      textarea,
      onFocus,
      onBlur,
      isFocus,
      store,
      widthArr,
      onKeyPress,
      inputLength,
      onTab,
      onInput,
      type,
    };
  },
});
export default InputComponent;
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
  }
}
.measure-text-length {
  height: 0;
  opacity: 0;
  position: absolute;
  left: -1000px;
}
.highlighted {
  font-weight: bold;
}
</style>

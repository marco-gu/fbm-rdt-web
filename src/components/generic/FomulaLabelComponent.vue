<template>
  <div class="line-item label-container" style="width: 100%">
    <div
      class="label-block"
      :style="{
        fontSize: calcFontSize(viewResult),
      }"
    >
      {{ viewResult.value }}
    </div>
  </div>
</template>
<script lang="ts">
import { Ref, defineComponent, onMounted, ref, toRefs, watch } from "vue";
import { calculateWidthItems } from "@/utils/screen.utils";
import { useStore } from "@/store";
import _ from "lodash";
import { FieldDto } from "@/entity/response.entity";
const FomulaLabelComponent = defineComponent({
  props: {
    details: {
      type: Object,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const widthArr: Ref<any> = ref([]);
    const store = useStore();
    const formulaResult = ref("");
    const formulaList = ref([] as any[]);
    const attributeName = ref();
    const attributeValue = ref();
    const result = ref();
    const viewResult = ref({} as FieldDto);
    onMounted(() => {
      mapRawData();
      const pattern = /#{(.*?)}+/g;
      if (new RegExp(pattern).test(attributeValue.value)) {
        const array = attributeValue.value.match(new RegExp(pattern)) as [];
        array.forEach((t: any) => {
          const formula = {
            key: t,
            value: [],
          };
          const pattern = "#\\{(.*?)\\}";
          const res = t.match(new RegExp(pattern)) as any;
          const array = res[1].split(",");
          array.forEach((e: never) => {
            formula.value.push(e);
          });
          formulaList.value.push(formula);
        });
        calculateFormula();
      } else {
        result.value = attributeValue.value;
      }
    });
    const mapRawData = () => {
      if (details.value) {
        widthArr.value = widthArr.value = calculateWidthItems(details);
        details.value.forEach((item: any) => {
          item.value = item.value || "";
          if (item.style == "formula") {
            attributeName.value = item.attributeName;
            attributeValue.value = item.value;
            viewResult.value = item;
          }
        });
      }
    };
    const calculateFormula = () => {
      const formulaParam = store.state.workflowModule.screenModel.formulaParam;
      const fields = store.state.workflowModule.screenModel.fields;
      formulaList.value.forEach((t) => {
        const formula = _.cloneDeep(t.value);
        if (!_.isUndefined(formulaParam)) {
          if (attributeName.value == formulaParam.eventValue) {
            formula.forEach((t1: any, index: number) => {
              if (t1 == formulaParam.attributeName) {
                if (
                  _.isEmpty(formulaParam.value) ||
                  _.isNull(formulaParam.value)
                ) {
                  formula[index] = "0";
                } else {
                  formula[index] = formulaParam.value;
                }
              } else {
                fields.forEach((t2) => {
                  if (t1 == t2.attributeName) {
                    if (_.isEmpty(t2.value) || _.isNull(t2.value)) {
                      formula[index] = "0";
                    } else {
                      formula[index] = t2.value;
                    }
                  }
                });
              }
            });
          }
        } else {
          formula.forEach((t1: any, index: number) => {
            fields.forEach((t2) => {
              if (t1 == t2.attributeName) {
                if (_.isEmpty(t2.value) || _.isNull(t2.value)) {
                  formula[index] = "0";
                } else {
                  formula[index] = t2.value;
                }
              }
            });
          });
        }
        formula.forEach((t: any) => {
          formulaResult.value += t;
        });
        // result.value = _.cloneDeep(attributeValue.value);
        // result.value = result.value.replace(t.key, eval(formulaResult.value));
        const result = _.cloneDeep(attributeValue.value);
        viewResult.value.value = result.replace(
          t.key,
          eval(formulaResult.value)
        );
      });
    };
    watch(
      () =>
        store.state.workflowModule.screenDepth == 0
          ? store.state.workflowModule.screenModel
          : store.state.workflowModule.subScreenModel,
      (newValue) => {
        console.log("132");
        if (!_.isUndefined(newValue.formulaParam)) {
          if (newValue.formulaParam.eventValue == attributeName.value) {
            formulaList.value.forEach((t) => {
              const formula = _.cloneDeep(t.value);
              formula.forEach((t: any, index: any) => {
                if (t == newValue.formulaParam.attributeName) {
                  if (
                    _.isEmpty(newValue.formulaParam.value) ||
                    _.isNull(newValue.formulaParam.value)
                  ) {
                    formula[index] = "0";
                  } else {
                    formula[index] = newValue.formulaParam.value;
                  }
                } else {
                  newValue.fields.forEach((field) => {
                    if (t == field.attributeName) {
                      if (_.isEmpty(field.value) || _.isNull(field.value)) {
                        formula[index] = "0";
                      } else {
                        formula[index] = field.value;
                      }
                    }
                  });
                }
              });
              formulaResult.value = "";
              formula.forEach((t: any) => {
                formulaResult.value += t;
              });
              // result.value = _.cloneDeep(attributeValue.value);
              // result.value = result.value.replace(
              //   t.key,
              //   eval(formulaResult.value)
              // );
              const result = _.cloneDeep(attributeValue.value);
              viewResult.value.value = result.replace(
                t.key,
                eval(formulaResult.value)
              );
            });
          }
        }
      },
      {
        deep: true,
      }
    );
    const calcFontSize = (item: FieldDto) => {
      const screen = localStorage.getItem("screen") as string;
      const fontSize = JSON.parse(screen).fontSize;
      return fontSize + item.fontSize + "px";
    };
    return {
      widthArr,
      result,
      viewResult,
      calcFontSize,
    };
  },
});
export default FomulaLabelComponent;
</script>

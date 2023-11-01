<script lang="ts">
import { defineComponent, h, onMounted, ref, watch } from "vue";
import response from "../assets/mock/response.json";
import { EngineResponseDto, GroupNode } from "@/utils/process.render";
import InputBoxComponent from "@/components/InputBoxComponent.vue";
import { useStore } from "@/store";
const NodeView = defineComponent({
  setup() {
    const store = useStore();
    const result = ref();
    const render = ref();
    onMounted(() => {
      result.value = store.state.workflowModule
        .response as never as EngineResponseDto;
      if (!result.value.sessionId) {
        store.dispatch("workflowModule/onSubmit", []);
      }
    });
    const _callback = () => {
      if (store.state.workflowModule.response) {
        store.dispatch("workflowModule/clearParam");
        result.value = store.state.workflowModule.response;
        const elementList = ref([] as any[]);
        let map: Map<number, any> = new Map();
        result.value.fields.forEach((t: any) => {
          const y = map.get(t.coordinateY);
          if (y) {
            if (t.attributeType != "Label") {
              y.type = t.attributeType;
              if (t.attributeType == "InputBox") {
                y.detail.label = y.detail.value;
                y.detail.value = "";
                y.detail.attributeName = t.attributeName;
              }
            } else {
              if (t.value) {
                y.detail.label = t.value;
              } else {
                y.detail.label = t.defaultValue;
              }
            }
          } else {
            const temp = new GroupNode();
            temp.type = t.attributeType;
            if (t.value) {
              temp.detail.value = t.value;
            } else {
              temp.detail.value = t.defaultValue;
            }
            temp.detail.attributeName = t.attributeName;
            map.set(t.coordinateY, temp);
          }
        });
        map.forEach((t) => {
          console.log(t);
          switch (t.type) {
            case "Label": {
              const element = h(
                "div",
                { style: "margin-bottom: 10px" },
                t.detail.value
              );
              elementList.value.push(element);
              break;
            }
            case "InputBox": {
              const element = h(InputBoxComponent, {
                labelName: t.detail.label,
                attributeName: t.detail.attributeName,
              });
              elementList.value.push(element);
              break;
            }
            case "Password": {
              const element = h(InputBoxComponent, {
                labelName: t.detail.label,
                attributeName: t.detail.attributeName,
              });
              elementList.value.push(element);
              break;
            }
          }
        });
        render.value = h(
          "div",
          {
            class: "app",
          },
          elementList.value
        );
      }
    };
    // watch(store.state.workflowModule.response, _callback);
    store.subscribe((mutation, state) => {
      if (store.state.workflowModule.response) {
        // store.dispatch("workflowModule/clearParam");
        result.value = store.state.workflowModule.response;
        const elementList = ref([] as any[]);
        let map: Map<number, any> = new Map();
        result.value.fields.forEach((t: any) => {
          const y = map.get(t.coordinateY);
          if (y) {
            if (t.attributeType != "Label") {
              y.type = t.attributeType;
              if (t.attributeType == "InputBox") {
                y.detail.label = y.detail.value;
                y.detail.value = "";
                y.detail.attributeName = t.attributeName;
              }
            } else {
              if (t.value) {
                y.detail.label = t.value;
              } else {
                y.detail.label = t.defaultValue;
              }
            }
          } else {
            const temp = new GroupNode();
            temp.type = t.attributeType;
            if (t.value) {
              temp.detail.value = t.value;
            } else {
              temp.detail.value = t.defaultValue;
            }
            temp.detail.attributeName = t.attributeName;
            map.set(t.coordinateY, temp);
          }
        });
        map.forEach((t) => {
          console.log(t);
          switch (t.type) {
            case "Label": {
              const element = h(
                "div",
                { style: "margin-bottom: 10px" },
                t.detail.value
              );
              elementList.value.push(element);
              break;
            }
            case "InputBox": {
              const element = h(InputBoxComponent, {
                labelName: t.detail.label,
                attributeName: t.detail.attributeName,
              });
              elementList.value.push(element);
              break;
            }
            case "Password": {
              const element = h(InputBoxComponent, {
                labelName: t.detail.label,
                attributeName: t.detail.attributeName,
              });
              elementList.value.push(element);
              break;
            }
          }
        });
        render.value = h(
          "div",
          {
            class: "app",
          },
          elementList.value
        );
      }
    });
    return () => render.value;
  },
});
export default NodeView;
</script>

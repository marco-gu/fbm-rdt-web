<script lang="ts">
import { defineComponent, h, onMounted, ref, watch } from "vue";
import InputComponent from "@/components/InputComponent.vue";
import { useStore } from "@/store";
import { parseLineView } from "@/utils/util.parse";
import { ScreenLineEntity } from "@/entity/screen.entity";
import MenuComponent from "@/components/MenuComponent.vue";
import LabelComponent from "@/components/LabelComponent.vue";
import OptionsView from "@/views/options/OptionsView.vue";
import { useRouter } from "vue-router";
const PageView = defineComponent({
  components: {
    OptionsView,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const render = ref();
    const lastRow = ref(0);
    watch(store.state.workflowModule, () => {
      const subElement = document.getElementById("temp") as any;
      subElement.style.visibility = store.state.workflowModule.isOptionShow
        ? "visible"
        : "hidden";
    });
    onMounted(() => {
      const lines = parseLineView(store.state.workflowModule.screenEntity);
      renderView(lines);
    });
    store.subscribe((mutation, state) => {
      if (state.workflowModule.isRenderView) {
        store.commit("workflowModule/saveRenderStatus", false);
        renderView(state.workflowModule.linesView);
      }
    });
    const renderView = (lines: Map<number, ScreenLineEntity>) => {
      let elementList = [] as any[];
      lines.forEach((line: ScreenLineEntity, index: number) => {
        const top = index == 1 ? 0 : (index - lastRow.value - 1) * 21.5;
        lastRow.value = index;
        switch (line.type) {
          case "label": {
            const lineColor =
              line.detail.color == "white" ? "#FFEEAD" : line.detail.color;
            const element = h(
              "div",
              {
                class: ["center-items"],
                style: {
                  "margin-top": top + "px",
                  color: lineColor,
                },
              },
              [
                h(LabelComponent, {
                  labelName: line.detail.name,
                  labelValue: line.detail.value,
                  isBottomElement: false,
                  labelX: line.detail.coordinateNameX
                    ? Number(line.detail.coordinateNameX)
                    : 0,
                  valueX: line.detail.coordinateValueX
                    ? Number(line.detail.coordinateValueX)
                    : 0,
                }),
              ]
            );
            elementList.push(element);
            break;
          }
          case "input": {
            const element = h(
              "div",
              {
                class: ["center-items"],
                style: { "margin-top": top + "px" },
              },
              [
                h(InputComponent, {
                  labelName: line.detail.name,
                  attributeName: line.detail.attributeName,
                  defaultValue: line.detail.value,
                  inputType: line.type,
                  max: line.detail.maxLength
                    ? Number(line.detail.maxLength)
                    : 0,
                  autoFocus: line.isFocus,
                  tabindex: Number(index),
                  labelX: line.detail.coordinateNameX
                    ? Number(line.detail.coordinateNameX)
                    : 0,
                  valueX: line.detail.coordinateValueX
                    ? Number(line.detail.coordinateValueX)
                    : 0,
                }),
              ]
            );
            elementList.push(element);
            break;
          }
          case "password": {
            const element = h(
              "div",
              {
                class: ["center-items"],
                style: { "margin-top": top + "px" },
              },
              [
                h(InputComponent, {
                  labelName: line.detail.name,
                  attributeName: line.detail.attributeName,
                  defaultValue: line.detail.value,
                  inputType: line.type,
                  max: line.detail.maxLength
                    ? Number(line.detail.maxLength)
                    : 0,
                  autoFocus: line.isFocus,
                  tabindex: Number(index),
                  labelX: line.detail.coordinateNameX
                    ? Number(line.detail.coordinateNameX)
                    : 0,
                  valueX: line.detail.coordinateValueX
                    ? Number(line.detail.coordinateValueX)
                    : 0,
                }),
              ]
            );
            elementList.push(element);
            break;
          }
          case "menu": {
            const element = h(
              "div",
              {
                class: ["center-item"],
                style: {
                  "margin-top": top + "px",
                },
              },
              [
                h(MenuComponent, {
                  menuName: line.detail.name,
                }),
              ]
            );
            elementList.push(element);
            break;
          }
        }
      });
      const element = h(
        "div",
        {
          id: "temp",
          class: ["options"],
          style: { visibility: "hidden" },
        },
        [h(OptionsView)]
      );
      elementList.push(element);
      const button = h(
        "div",
        {
          style: {
            position: "absolute",
            left: "95%",
            top: "92%",
          },
        },
        [
          h("i", {
            id: "icon",
            class: ["fa-solid fa-plus"],
            onClick: () => {
              store.commit(
                "workflowModule/saveOptionsStatus",
                !store.state.workflowModule.isOptionShow
              );
              const iconElement = document.getElementById("icon") as any;
              if (store.state.workflowModule.isOptionShow) {
                router.push("/options/");
                iconElement.setAttribute("class", "fa-solid fa-minus");
              } else {
                router.push("/");
                iconElement.setAttribute("class", "fa-solid fa-plus");
              }
            },
          }),
        ]
      );
      elementList.push(button);
      render.value = h(
        "div",
        {
          key:
            new Date().getMilliseconds() + Math.floor(Math.random() * 10) + 1,
          class: "app",
        },
        elementList
      );
    };
    return () => render.value;
  },
});
export default PageView;
</script>

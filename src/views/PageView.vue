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
import globalStyle from "@/styles/variable/global.module.scss";

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
        const lineHight = globalStyle["line-height"].substring(0, 2) as any;
        const top = index == 1 ? 0 : (index - lastRow.value - 1) * lineHight;
        lastRow.value = index;
        switch (line.type) {
          case "label": {
            const color =
              line.color == "white" ? globalStyle["color"] : line.color;
            const element = h(
              "div",
              {
                class: ["center-items"],
                style: {
                  "margin-top": top + "px",
                  color: color,
                  height: globalStyle["line-height"],
                },
              },
              [
                h(LabelComponent, {
                  details: line.details,
                }),
                // h(LabelComponent, {
                //   labelName: line.details[0].name,
                //   labelValue: line.details[0].value,
                //   isBottomElement: false,
                //   labelX: line.details[0].coordinateNameX
                //     ? Number(line.details[0].coordinateNameX)
                //     : 0,
                //   valueX: line.details[0].coordinateValueX
                //     ? Number(line.details[0].coordinateValueX)
                //     : 0,
                // }),
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
                style: {
                  "margin-top": top + "px",
                  height: globalStyle["line-height"],
                },
              },
              [
                h(InputComponent, {
                  details: line.details,
                  tabindex: Number(index),
                  inputType: line.type,
                  autoFocus: line.isFocus,
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
                style: {
                  "margin-top": top + "px",
                  height: globalStyle["line-height"],
                },
              },
              [
                h(InputComponent, {
                  details: line.details,
                  tabindex: Number(index),
                  inputType: line.type,
                  autoFocus: line.isFocus,
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
                  height: globalStyle["line-height"],
                },
              },
              [
                h(MenuComponent, {
                  menuName: line.details[0].name,
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
          style: {
            visibility: "hidden",
            width: globalStyle["option-width"],
            // height: globalStyle["option-height"],
            background: globalStyle["option-background-color"],
            fontSize: globalStyle["option-font-size"],
            color: globalStyle["option-color"],
            letterSpacing: globalStyle["option-letter-spacing"],
          },
        },
        [h(OptionsView)]
      );
      elementList.push(element);

      const button = h(
        "div",
        {
          class: ["plus-icon-container"],
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
          style: {
            width: globalStyle["width"],
            height: globalStyle["height"],
            background: globalStyle["background-color"],
            fontSize: globalStyle["font-size"],
            color: globalStyle["color"],
            letterSpacing: globalStyle["letter-spacing"],
            // border: "#6E7C89 .5px solid",
            margin: "auto",
            position: "relative",
          },
          key:
            new Date().getMilliseconds() + Math.floor(Math.random() * 10) + 1,
        },
        elementList
      );
      lastRow.value = 0;
    };
    return () => render.value;
  },
});
export default PageView;
</script>

<script lang="ts">
import { defineComponent, h, onMounted, ref } from "vue";
import InputComponent from "@/components/InputComponent.vue";
import { useStore } from "@/store";
import { parseLineView } from "@/utils/util.parse";
import { ScreenLineEntity } from "@/entity/screen.entity";
import MenuComponent from "@/components/MenuComponent.vue";
import LabelComponent from "@/components/LabelComponent.vue";
import TestComponent from "@/components/TestComponent.vue";
const PageView = defineComponent({
  setup() {
    const store = useStore();
    const render = ref();
    let lineHeight = 30;
    onMounted(() => {
      const lines = parseLineView(store.state.workflowModule.screenEntity);
      calculateLineHeight(lines.size);
      renderView(lines);
    });
    store.subscribe((mutation, state) => {
      // console.log(state.workflowModule.renderView);
      // if (state.workflowModule.linesView.size > 0) {
      //   renderView(state.workflowModule.linesView);
      //   store.commit("workflowModule/saveRenderStatus", false);
      // }
      if (state.workflowModule.isRenderView) {
        store.commit("workflowModule/saveRenderStatus", false);
        renderView(state.workflowModule.linesView);
      }
    });
    const renderView = (lines: Map<number, ScreenLineEntity>) => {
      let elementList = [] as any[];
      let colorIndex = 0;
      lines.forEach((line: ScreenLineEntity, index: number) => {
        const color = line.isLastLine
          ? "#FFFFFF"
          : !line.detail.label
          ? "#FFFFFF"
          : colorIndex % 2
          ? "#f5fcff"
          : "#e7eff3";
        colorIndex++;
        switch (line.type) {
          case "output": {
            const element = h(
              "div",
              {
                class: ["center-items"],
                style: { "background-color": color, height: lineHeight + "px" },
              },
              [
                h(LabelComponent, {
                  labelName: line.detail.label,
                  labelValue: line.detail.value,
                  isBottomElement: line.isLastLine,
                }),
              ]
            );
            elementList.push(element);
            break;
          }
          case "input": {
            console.log("render input component at " + index);
            const element = h(
              "div",
              {
                class: ["center-items"],
                style: { "background-color": color, height: lineHeight + "px" },
              },
              [
                h(InputComponent, {
                  key:
                    index +
                    new Date().getMilliseconds() +
                    Math.floor(Math.random() * 10) +
                    1,
                  labelName: line.detail.label,
                  attributeName: line.detail.attributeName,
                  defaultValue: line.detail.value,
                  inputType: line.type,
                  max: line.detail.maxLength as string,
                  autoFocus: line.isFocus,
                  tabindex: Number(index),
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
                style: { "background-color": color, height: lineHeight + "px" },
              },
              [
                h(InputComponent, {
                  labelName: line.detail.label,
                  attributeName: line.detail.attributeName,
                  defaultValue: line.detail.value,
                  inputType: line.type,
                  max: line.detail.maxLength as string,
                  autoFocus: line.isFocus,
                  tabindex: Number(index),
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
                class: line.isLastLine
                  ? ["center-items last-item"]
                  : ["center-items"],
                style: { "background-color": color, height: lineHeight + "px" },
              },
              [
                h(MenuComponent, {
                  menuName: line.detail.label,
                  isBottomElement: line.isLastLine,
                  tabindex: Number(index),
                }),
              ]
            );
            elementList.push(element);
            break;
          }
        }
      });
      render.value = h(
        "div",
        {
          class: "app",
        },
        elementList
      );
    };
    const calculateLineHeight = (lineNumber: number) => {
      const contentEle = document.getElementById("content");
      if (contentEle) {
        const calculatedHeight = Math.floor(
          contentEle.offsetHeight / lineNumber
        );
        // 30 > lineheight > 24
        lineHeight =
          calculatedHeight > 30
            ? 30
            : calculatedHeight < 24
            ? 24
            : calculatedHeight;
      }
    };
    return () => render.value;
  },
});
export default PageView;
</script>

<script lang="ts">
import { defineComponent, h, onMounted, ref } from "vue";
import InputComponent from "@/components/InputComponent.vue";
import { useStore } from "@/store";
import { parseLineView } from "@/utils/util.parse";
import { ScreenLineEntity } from "@/entity/screen.entity";
import MenuComponent from "@/components/MenuComponent.vue";
import LabelComponent from "@/components/LabelComponent.vue";
const PageView = defineComponent({
  setup() {
    const store = useStore();
    const render = ref();
    const LAST_INDEX = 15;
    let lineHeight = 30;
    onMounted(() => {
      const lines = parseLineView(store.state.workflowModule.screenEntity);
      calculateLineHeight(lines.size);
      renderView(lines);
    });
    store.subscribe((mutation, state) => {
      if (state.workflowModule.linesView.size > 0) {
        renderView(state.workflowModule.linesView);
      }
    });
    const renderView = (lines: Map<number, ScreenLineEntity>) => {
      const elementList = ref([] as any[]);
      // TBD Body
      let colorIndex = 0;
      lines.forEach((line: ScreenLineEntity, index: number) => {
        const color = colorIndex % 2 ? "#D4D4D4" : "#E0EEEE";
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
                  isBottomElement: LAST_INDEX === Number(index),
                }),
              ]
            );
            elementList.value.push(element);
            break;
          }
          case "input": {
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
                }),
              ]
            );
            elementList.value.push(element);
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
                }),
              ]
            );
            elementList.value.push(element);
            break;
          }
          case "menu": {
            const element = h(
              "div",
              {
                class: ["center-items"],
                style: { "background-color": color, height: lineHeight + "px" },
              },
              [
                h(MenuComponent, {
                  menuName: line.detail.label,
                  isBottomElement: line.isLastLine,
                }),
              ]
            );
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

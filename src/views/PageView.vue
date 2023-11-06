<script lang="ts">
import { defineComponent, h, onMounted, ref } from "vue";
import InputComponent from "@/components/InputComponent.vue";
import { useStore } from "@/store";
import { parseLineView } from "@/utils/util.parse";
import { ScreenRowEntity } from "@/entity/screen.entity";
import MenuComponent from "@/components/MenuComponent.vue";
import LabelComponent from "@/components/LabelComponent.vue";
const PageView = defineComponent({
  setup() {
    const store = useStore();
    const render = ref();
    onMounted(() => {
      const lines = parseLineView(store.state.workflowModule.screenEntity);
      renderView(lines);
    });
    store.subscribe((mutation, state) => {
      if (state.workflowModule.linesView.size > 0) {
        renderView(state.workflowModule.linesView);
      }
    });
    const renderView = (lines: Map<number, ScreenRowEntity>) => {
      const elementList = ref([] as any[]);
      // TBD Body
      let colorIndex = 0;
      lines.forEach((line: ScreenRowEntity, index: number) => {
        const color = colorIndex % 2 ? "#D4D4D4" : "#E0EEEE";
        colorIndex++;
        switch (line.type) {
          case "output": {
            const element = h("div", { style: "background-color: " + color }, [
              h(LabelComponent, {
                labelName: line.detail.label,
                labelValue: line.detail.value,
              }),
            ]);
            elementList.value.push(element);
            break;
          }
          case "input": {
            const element = h("div", { style: "background-color: " + color }, [
              h(InputComponent, {
                labelName: line.detail.label,
                attributeName: line.detail.attributeName,
                defaultValue: line.detail.value,
              }),
            ]);
            elementList.value.push(element);
            break;
          }
          case "password": {
            const element = h("div", { style: "background-color: " + color }, [
              h(InputComponent, {
                labelName: line.detail.label,
                attributeName: line.detail.attributeName,
              }),
            ]);
            elementList.value.push(element);
            break;
          }
          case "menu": {
            const element = h("div", { style: "background-color: " + color }, [
              h(MenuComponent, {
                menuName: line.detail.label,
              }),
            ]);
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
    return () => render.value;
  },
});
export default PageView;
</script>

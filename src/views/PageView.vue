<script lang="ts">
import { defineComponent, h, onMounted, ref } from "vue";
import InputComponent from "@/components/InputComponent.vue";
import { useStore } from "@/store";
import { parseLineView } from "@/utils/util.parse";
import { ScreenRowEntity } from "@/entity/screen.entity";
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
      lines.forEach((line: ScreenRowEntity, index: number) => {
        const color = line.detail.color
          ? line.detail.color == "white"
            ? "black"
            : "red"
          : "black";
        switch (line.type) {
          case "output": {
            const style = {
              style: "padding: 5px 5px; font-size:12px; color:" + color,
            };
            const element = h("div", style, line.detail.label);
            elementList.value.push(element);
            break;
          }
          case "input": {
            const element = h(InputComponent, {
              labelName: line.detail.label,
              attributeName: line.detail.attributeName,
              defaultValue: line.detail.value,
            });
            elementList.value.push(element);
            break;
          }
          case "password": {
            const element = h(InputComponent, {
              labelName: line.detail.label,
              attributeName: line.detail.attributeName,
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
    };
    return () => render.value;
  },
});
export default PageView;
</script>

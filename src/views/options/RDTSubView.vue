<script lang="ts">
import { defineComponent, ref, h, toRefs } from "vue";
import { useStore } from "@/store";
import { ScreenRowComponentEnum, ScreenRowModel } from "@/entity/screen.entity";
import LabelComponent from "@/components/generic/LabelComponent.vue";
import InputComponent from "@/components/generic/InputComponent.vue";
import ListInputComponent from "@/components/list/ListInputComponent.vue";
import ListTitleLabelComponent from "@/components/list/ListTitleLabelComponent.vue";
import ListItemLabelComponent from "@/components/list/ListItemLabelComponent.vue";
import MessageComponent from "@/components/message/MessageComponent.vue";
import SubButtonComponent from "@/components/generic/SubButtonComponent.vue";
import style from "../../assets/device/default.json";

const RDTSubView = defineComponent({
  props: {
    subScreen: {
      type: Object,
    },
  },
  setup(props) {
    const { subScreen } = toRefs(props);
    const store = useStore();
    const rowNode = ref();
    const rowsView = ref();
    const views = ref([] as any[]);
    const render = ref();
    const rdtStyle = style as any;
    const rowHeight = rdtStyle.rowHeight;
    const renderView = (screenModel: any) => {
      renderRows(screenModel.screenRows);
      render.value = h(
        "div",
        {
          key:
            new Date().getMilliseconds() + Math.floor(Math.random() * 10) + 1,
        },
        views.value
      );
    };
    const renderRows = (rows: Map<number, ScreenRowModel>) => {
      if (rows.size > 0) {
        rows.forEach((row) => {
          switch (row.rowType) {
            case ScreenRowComponentEnum.LABEL: {
              rowNode.value = h(LabelComponent, {
                details: row.rowDetails,
              });
              break;
            }
            case ScreenRowComponentEnum.INPUT: {
              rowNode.value = h(InputComponent, {
                details: row.rowDetails,
              });
              break;
            }
            case ScreenRowComponentEnum.PASSWORD: {
              rowNode.value = h(InputComponent, {
                details: row.rowDetails,
              });
              break;
            }
            case ScreenRowComponentEnum.LIST_INPUT: {
              rowNode.value = h(ListInputComponent, {
                details: row.rowDetails,
              });
              break;
            }
            case ScreenRowComponentEnum.LIST_TITLE_LABEL: {
              rowNode.value = h(ListTitleLabelComponent, {
                details: row.rowDetails,
              });
              break;
            }
            case ScreenRowComponentEnum.LIST_ITEM_LABEL: {
              rowNode.value = h(ListItemLabelComponent, {
                details: row.rowDetails,
              });
              break;
            }
            case ScreenRowComponentEnum.MESSAGEBOX: {
              rowNode.value = h(MessageComponent, {
                details: row.rowDetails,
              });
              break;
            }
            case ScreenRowComponentEnum.SUB_BUTTON: {
              rowNode.value = h(SubButtonComponent, {
                details: row.rowDetails,
              });
              break;
            }
          }
          rowsView.value = h(
            "div",
            {
              class: ["center-items"],
              style: {
                height: rowHeight + "px",
              },
            },
            [rowNode.value]
          );
          views.value.push(rowsView.value);
        });
      }
    };
    renderView(subScreen.value);
    return () => render.value;
  },
});
export default RDTSubView;
</script>

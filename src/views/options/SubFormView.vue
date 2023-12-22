<script lang="ts">
import { EngineRequset, UserSettingDto } from "@/entity/request.entity";
import { post } from "@/service/http";
import { defineComponent, ref, h, toRefs } from "vue";
import { useStore } from "@/store";
import New_RDT_Response from "../../assets/mock/New_RDT_Response.json";
import { ScreenRowComponentEnum, ScreenRowModel } from "@/entity/screen.entity";
import LabelComponent from "@/components/generic/LabelComponent.vue";
import InputComponent from "@/components/generic/InputComponent.vue";
import ListInputComponent from "@/components/list/ListInputComponent.vue";
import ListTitleLabelComponent from "@/components/list/ListTitleLabelComponent.vue";
import ListItemLabelComponent from "@/components/list/ListItemLabelComponent.vue";
import MessageComponent from "@/components/message/MessageComponent.vue";
import SubButtonComponent from "@/components/generic/SubButtonComponent.vue";

const SubFormViewComponent = defineComponent({
  props: {
    subForm: {
      type: Object,
    },
  },
  setup(props) {
    const { subForm } = toRefs(props);
    const store = useStore();
    const rowNode = ref();
    const rowsView = ref();
    const views = ref([] as any[]);
    const render = ref();
    console.log(subForm.value);
    const renderView = (screenModel: any) => {
      renderRows(screenModel.screenRows);
      render.value = h(
        "div",
        {
          style: {
            padding: "0px 10px",
          },
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
                height: "25px",
              },
            },
            [rowNode.value]
          );
          views.value.push(rowsView.value);
        });
      }
    };
    renderView(subForm.value);
    return () => render.value;
  },
});
export default SubFormViewComponent;
</script>

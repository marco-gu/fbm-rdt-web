<script lang="ts">
import { defineComponent, h, onMounted, ref, watch } from "vue";
import { useStore } from "@/store";
import {
  ScreenModel,
  ScreenRowComponentEnum,
  ScreenRowModel,
} from "@/entity/screen.entity";
import LabelComponent from "@/components/generic/LabelComponent.vue";
import globalStyle from "@/styles/variable/global.module.scss";
import MessageComponent from "@/components/message/MessageComponent.vue";
import InputComponent from "@/components/generic/InputComponent.vue";
import ListItemLabelComponent from "@/components/list/ListItemLabelComponent.vue";
import ListTitleLabelComponent from "@/components/list/ListTitleLabelComponent.vue";
import ListInputComponent from "@/components/list/ListInputComponent.vue";
import { useRouter } from "vue-router";

const RDTView = defineComponent({
  setup() {
    const store = useStore();
    const render = ref();
    const rowNode = ref();
    const rowsView = ref();
    const router = useRouter();
    const views = ref([] as any[]);
    onMounted(() => {
      window.addEventListener("keyup", handleKeyDown);
      renderView(store.state.workflowModule.screenModel);
    });
    store.subscribe((mutation, state) => {
      if (state.workflowModule.isRenderView) {
        views.value = [];
        store.commit("workflowModule/saveRenderStatus", false);
        renderView(state.workflowModule.screenModel);
      }
    });
    const renderView = (screenModel: ScreenModel) => {
      renderMainRows(screenModel.mainRows);
      render.value = h(
        "div",
        {
          style: {
            background: globalStyle["background-color"],
            fontSize: globalStyle["font-size"],
            color: globalStyle["color"],
            letterSpacing: globalStyle["letter-spacing"],
          },
          key:
            new Date().getMilliseconds() + Math.floor(Math.random() * 10) + 1,
        },
        views.value
      );
    };
    const renderMainRows = (rows: Map<number, ScreenRowModel>) => {
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
          }
          rowsView.value = h(
            "div",
            {
              class: ["center-items"],
              style: {
                height: globalStyle["line-height"],
              },
            },
            [rowNode.value]
          );
          views.value.push(rowsView.value);
        });
      }
    };
    const handleKeyDown = (event: any) => {
      {
        switch (event.keyCode) {
          case 13:
            store.dispatch("workflowModule/onSubmit");
            break;
          case 27:
            if (store.state.workflowModule.screenModel.title == "Login") {
              router.push("/");
            } else {
              store.dispatch("workflowModule/onCancel");
            }
            break;
        }
      }
    };
    return () => render.value;
  },
});
export default RDTView;
</script>

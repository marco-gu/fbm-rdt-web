<script lang="ts">
import { defineComponent, h, onMounted, onUnmounted, ref } from "vue";
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
import SubButtonComponent from "@/components/generic/SubButtonComponent.vue";
import OptionsView from "@/views/options/OptionsView.vue";

const RDTView = defineComponent({
  components: {
    OptionsView,
  },
  setup() {
    const store = useStore();
    const render = ref();
    const rowNode = ref();
    const rowsView = ref();
    const router = useRouter();
    const views = ref([] as any[]);
    const optionView = ref();
    onMounted(() => {
      window.addEventListener("keyup", handleKeyDown);
      console.log("onMounted");
      const shell = document.getElementById("app") as any;
      shell.style.backgroundColor = "#0E1925";
      const screenModel = store.state.workflowModule.screenModel;
      const subScreenModel = store.state.workflowModule.subFormModel;
      renderView(screenModel, subScreenModel);
    });
    onUnmounted(() => {
      window.removeEventListener("keyup", handleKeyDown);
    });
    store.subscribe((mutation, state) => {
      if (state.workflowModule.isRenderView) {
        store.commit("workflowModule/saveRenderStatus", false);
        router.push("/transition");
        // views.value = [];
        // console.log("view change");
        // store.commit("workflowModule/saveRenderStatus", false);
        // const screenModel = store.state.workflowModule.screenModel;
        // const subScreenModel = store.state.workflowModule.subFormModel;
        // renderView(screenModel, subScreenModel);
      }
    });
    const renderView = (
      screenModel: ScreenModel,
      subScreenModel: ScreenModel
    ) => {
      renderMainRows(screenModel.screenRows);
      if (subScreenModel.screenRows && subScreenModel.screenRows.size > 0) {
        optionView.value = h(
          "div",
          {
            id: "options",
            class: ["options"],
            style: {
              width: "300px",
              height: "460px",
              background: globalStyle["option-background-color"],
              fontSize: globalStyle["option-font-size"],
              color: globalStyle["option-color"],
              letterSpacing: globalStyle["option-letter-spacing"],
            },
          },
          [h(OptionsView)]
        );
        views.value.push(optionView.value);
      }
      render.value = h(
        "div",
        {
          style: {
            background: globalStyle["background-color"],
            fontSize: globalStyle["font-size"],
            color: globalStyle["color"],
            letterSpacing: globalStyle["letter-spacing"],
            padding: "0px 10px",
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
            console.log("rdt enter");
            store.dispatch("workflowModule/onSubmit");
            break;
          case 27:
            if (store.state.workflowModule.screenModel.title == "Login") {
              localStorage.clear();
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

<script lang="ts">
import { defineComponent, h, onMounted, onUnmounted, ref, watch } from "vue";
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
import { get } from "@/service/http";
import ck65 from "../assets/device/ck65.json";
import RDTSubView from "./options/RDTSubView.vue";
import MultiInputComponent from "@/components/generic/MultiInputComponent.vue";

const RDTView = defineComponent({
  components: {
    RDTSubView,
  },
  setup() {
    const store = useStore();
    const render = ref();
    const rowNode = ref();
    const rowsView = ref();
    const router = useRouter();
    const screenView = ref([] as any[]);
    const screenHeight = ck65.height as any;
    const rowHeight = "40px";
    // const rowHeight = globalStyle["line-height"];
    onMounted(() => {
      window.addEventListener("keyup", handleKeyDown);
      // TODO initial screen background color
      const shell = document.getElementById("app") as HTMLElement;
      shell.style.backgroundColor = "#0E1925";
      const screenModel = store.state.workflowModule.screenModel;
      renderView(screenModel);
    });
    onUnmounted(() => {
      window.removeEventListener("keyup", handleKeyDown);
    });
    store.subscribe((mutation, state) => {
      if (state.workflowModule.isRender) {
        store.commit("workflowModule/onCloseRender");
        router.push("/transition");
      }
    });
    const renderView = (screenModel: ScreenModel) => {
      renderRows(screenModel.screenRows);
      if (store.state.workflowModule.screenDepth == 1) {
        const optionView = h(
          "div",
          {
            id: "options",
            class: ["options"],
            style: {
              width: globalStyle["option-width"],
              height: globalStyle["option-height"],
              background: globalStyle["option-background-color"],
              fontSize: globalStyle["option-font-size"],
              color: globalStyle["option-color"],
              letterSpacing: globalStyle["option-letter-spacing"],
            },
          },
          [
            h(RDTSubView, {
              subScreen: store.state.workflowModule.subScreenModel,
            }),
          ]
        );
        screenView.value.push(optionView);
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
        screenView.value
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
            case ScreenRowComponentEnum.MULTI_INPUT: {
              rowNode.value = h(MultiInputComponent, {
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
                height: rowHeight,
              },
            },
            [rowNode.value]
          );
          screenView.value.push(rowsView.value);
        });
      }
    };
    const handleKeyDown = (event: any) => {
      {
        switch (event.keyCode) {
          case 13: {
            const payload = store.state.workflowModule.screenDepth;
            store.dispatch("workflowModule/onSubmit", payload);
            break;
          }
          case 27:
            if (store.state.workflowModule.screenModel.title == "Login") {
              // kill session
              const url =
                "RDTEngine/deleteSession/" + localStorage.getItem("sessionId");
              get(url).then(() => {
                localStorage.clear();
                router.push("/");
              });
            } else {
              console.log("onCancel");
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

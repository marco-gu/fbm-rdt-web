<script lang="ts">
import { defineComponent, h, onMounted, ref, watch } from "vue";
import InputComponent from "@/components/InputComponent.vue";
import { useStore } from "@/store";
import { composeRowData } from "@/utils/util.parse";
import {
  ScreenLineEntity,
  ScreenModel,
  ScreenRowModel,
} from "@/entity/screen.entity";
import MenuComponent from "@/components/MenuComponent.vue";
import LabelComponent from "@/components/LabelComponent.vue";
import OptionsView from "@/views/options/OptionsView.vue";
import { useRouter } from "vue-router";
import globalStyle from "@/styles/variable/global.module.scss";
import SingleListInput from "@/components/SingleListInput.vue";
import MessageComponent from "@/components/MessageComponent.vue";

const PageView = defineComponent({
  components: {
    OptionsView,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const render = ref();
    const preRowNumber = ref(0);
    const rowNode = ref();
    const rowNodeColor = ref();
    const rowNodeHeight = ref();
    const rowsView = ref();
    const buttonView = ref();
    const optionView = ref();
    const views = ref([] as any[]);
    watch(store.state.workflowModule, () => {
      const options = document.getElementById("options") as any;
      options.style.visibility = store.state.workflowModule.isOptionShow
        ? "visible"
        : "hidden";
    });
    onMounted(() => {
      // const rowsEntity = composeRowData(
      //   store.state.workflowModule.screenEntity
      // );
      // renderView(rowsEntity);
      renderView(store.state.workflowModule.screenModel);
    });
    store.subscribe((mutation, state) => {
      if (state.workflowModule.isRenderView) {
        store.commit("workflowModule/saveRenderStatus", false);
        renderView(state.workflowModule.screenModel);
      }
    });
    const renderView = (screenModel: ScreenModel) => {
      renderMainRows(screenModel.mainRows);
      renderSubForm(screenModel.subFormRows);
      // renderBtn();
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
            border: "#6E7C89 .5px solid",
            margin: "auto",
            position: "relative",
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
          switch (row.type) {
            case "label": {
              rowNode.value = h(LabelComponent, {
                details: row.labelDetails,
              });
              break;
            }
            case "input": {
              // rowNode.value = h(InputComponent, {
              //   details: row.labelDetails,
              // });
              break;
            }
            case "password": {
              // rowNode.value = h(InputComponent, {
              //   details: row.labelDetails,
              // });
              break;
            }
            case "singlelistinput": {
              if (row.singleListInputDetails.length > 1) {
                rowNode.value = h(SingleListInput, {
                  details: row.labelDetails,
                });
              } else {
                rowNode.value = h(LabelComponent, {
                  details: row.singleListInputDetails,
                });
              }
              break;
            }
            case "messageBox": {
              rowNode.value = h(MessageComponent, {
                details: row.messageDetail,
              });
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
    const renderSubForm = (subRows: Map<number, ScreenRowModel>) => {
      if (subRows.size > 0) {
        // compose
      }
    };
    // const renderBtn = () => {
    //   buttonView.value = h(
    //     "div",
    //     {
    //       class: ["plus-icon-container"],
    //     },
    //     [
    //       h("i", {
    //         id: "icon",
    //         class: ["fa-solid fa-plus"],
    //         onClick: () => {
    //           store.commit(
    //             "workflowModule/saveOptionsStatus",
    //             !store.state.workflowModule.isOptionShow
    //           );
    //           const iconElement = document.getElementById("icon") as any;
    //           if (store.state.workflowModule.isOptionShow) {
    //             router.push("/options/");
    //             iconElement.setAttribute("class", "fa-solid fa-minus");
    //           } else {
    //             router.push("/");
    //             iconElement.setAttribute("class", "fa-solid fa-plus");
    //           }
    //         },
    //       }),
    //     ]
    //   );
    //   views.value.push(buttonView.value);
    // };
    // const renderView = (rowsEntity: Map<number, ScreenLineEntity>) => {
    //   rowsEntity.forEach((rowEntity: ScreenLineEntity, index: number) => {
    //     preRowNumber.value =
    //       preRowNumber.value == 0 ? index : preRowNumber.value;
    //     if (index - preRowNumber.value > 1) {
    //       const range = index - preRowNumber.value;
    //       for (let i = 1; i < range; i++) {
    //         preRowNumber.value++;
    //         const temp = h("div", {
    //           id: preRowNumber.value,
    //           class: ["center-items"],
    //           style: {
    //             color: globalStyle["color"],
    //             height: globalStyle["line-height"],
    //           },
    //         });
    //         views.value.push(temp);
    //       }
    //     }
    //     switch (rowEntity.type) {
    //       case "label": {
    //         rowNodeColor.value =
    //           rowEntity.color == "white"
    //             ? globalStyle["color"]
    //             : rowEntity.color;
    //         rowNode.value = h(LabelComponent, {
    //           details: rowEntity.details,
    //         });
    //         break;
    //       }
    //       case "input": {
    //         rowNode.value = h(InputComponent, {
    //           details: rowEntity.details,
    //           tabindex: Number(index),
    //           inputType: rowEntity.type,
    //           autoFocus: rowEntity.isFocus,
    //         });
    //         break;
    //       }
    //       case "password": {
    //         rowNode.value = h(InputComponent, {
    //           details: rowEntity.details,
    //           tabindex: Number(index),
    //           inputType: rowEntity.type,
    //           autoFocus: rowEntity.isFocus,
    //         });
    //         break;
    //       }
    //       case "menu": {
    //         rowNode.value = h(MenuComponent, {
    //           menuName: rowEntity.details[0].name,
    //         });
    //         break;
    //       }
    //     }
    //     rowsView.value = h(
    //       "div",
    //       {
    //         id: index,
    //         class: ["center-items"],
    //         style: {
    //           color: rowNodeColor.value,
    //           height: globalStyle["line-height"],
    //         },
    //       },
    //       [rowNode.value]
    //     );
    //     views.value.push(rowsView.value);
    //     preRowNumber.value = index;
    //   });
    //   optionView.value = h(
    //     "div",
    //     {
    //       id: "options",
    //       class: ["options"],
    //       style: {
    //         visibility: "hidden",
    //         width: globalStyle["option-width"],
    //         // height: globalStyle["option-height"],
    //         background: globalStyle["option-background-color"],
    //         fontSize: globalStyle["option-font-size"],
    //         color: globalStyle["option-color"],
    //         letterSpacing: globalStyle["option-letter-spacing"],
    //       },
    //     },
    //     [h(OptionsView)]
    //   );
    //   views.value.push(optionView.value);
    //   buttonView.value = h(
    //     "div",
    //     {
    //       class: ["plus-icon-container"],
    //     },
    //     [
    //       h("i", {
    //         id: "icon",
    //         class: ["fa-solid fa-plus"],
    //         onClick: () => {
    //           store.commit(
    //             "workflowModule/saveOptionsStatus",
    //             !store.state.workflowModule.isOptionShow
    //           );
    //           const iconElement = document.getElementById("icon") as any;
    //           if (store.state.workflowModule.isOptionShow) {
    //             router.push("/options/");
    //             iconElement.setAttribute("class", "fa-solid fa-minus");
    //           } else {
    //             router.push("/");
    //             iconElement.setAttribute("class", "fa-solid fa-plus");
    //           }
    //         },
    //       }),
    //     ]
    //   );
    //   views.value.push(buttonView.value);
    //   render.value = h(
    //     "div",
    //     {
    //       style: {
    //         width: globalStyle["width"],
    //         // height: globalStyle["height"],
    //         background: globalStyle["background-color"],
    //         fontSize: globalStyle["font-size"],
    //         color: globalStyle["color"],
    //         letterSpacing: globalStyle["letter-spacing"],
    //         border: "#6E7C89 .5px solid",
    //         margin: "auto",
    //         position: "relative",
    //       },
    //       key:
    //         new Date().getMilliseconds() + Math.floor(Math.random() * 10) + 1,
    //     },
    //     views.value
    //   );
    //   preRowNumber.value = 0;
    //   views.value = [];
    // };
    return () => render.value;
  },
});
export default PageView;
</script>

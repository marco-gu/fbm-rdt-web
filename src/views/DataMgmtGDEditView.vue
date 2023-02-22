<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{
            pageType == "Group"
              ? $t("dataManagement.group_title")
              : $t("dataManagement.detail_title")
          }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
      <div class="card-sub-title">
        <div v-if="isMix == 1">{{ taskId }} Mix Carton</div>
        <div v-else>{{ taskId }}</div>
      </div>
    </div>
    <div class="content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="showUpdateDialog = true" ref="myForm">
          <div v-for="(item, i) in pageViews" :key="i">
            <div v-show="item.editable === true" class="card-item-input">
              <div>
                {{ item.displayFieldName }}
              </div>
              <q-input
                class="card-item-input-field no-shadow"
                :input-style="{ fontSize: '15px' }"
                input-class="text-right"
                ref="inputRef"
                v-model="item.model"
                clearable
                @paste="validPaste($event, i)"
                :maxlength="item.length"
                lazy-rules
                :rules="[item.valid]"
                borderless
                dense
              >
                <template v-slot:append>
                  <q-avatar v-if="item.scan == 1" @click="scan(item.fieldName)">
                    <q-icon name="qr_code_scanner" size="16px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
            <div
              v-show="item.editable === false && pageType === 'Detail'"
              class="card-item-input"
            >
              <div>
                {{ item.displayFieldName }}
              </div>
              <q-input
                class="card-item-input-field no-shadow"
                :input-style="{ fontSize: '15px' }"
                input-class="text-right"
                v-model="item.model"
                borderless
                dense
              >
              </q-input>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="button-bottom row" id="bottom-button">
      <q-btn
        v-show="pageType == 'Detail'"
        :class="[isMix ? 'button-enable' : 'button-disable', 'col']"
        no-caps
        flat
        push
        :label="$t('dataManagement.mix')"
        @click="goToMix"
      />
      <q-separator v-show="pageType == 'Detail'" vertical inset color="white" />
      <q-btn
        class="col button-enable"
        no-caps
        flat
        push
        @click="onSubmit"
        :label="$t('common.save')"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        class="col button-enable"
        no-caps
        flat
        push
        :label="$t('common.delete')"
        @click="showDeleteDialog = true"
      />
    </div>
    <q-dialog v-model="showDeleteDialog" persistent>
      <div class="dialog-container">
        <div class="dialog-container__title">
          {{ $t("common.confirm") }}
          <q-icon name="close" v-close-popup />
        </div>
        <div class="dialog-container__content">
          {{ $t("dataManagement.delete_dialog_message") }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button cancel" v-close-popup>
            {{ $t("common.cancel") }}
          </button>
          <button class="dialog-button confirm" @click="handleDelete">
            {{ $t("common.delete") }}
          </button>
        </div>
      </div>
    </q-dialog>
    <q-dialog v-model="showUpdateDialog" persistent>
      <div class="dialog-container">
        <div class="dialog-container__title">
          {{ $t("common.confirm") }}
          <q-icon name="close" v-close-popup />
        </div>
        <div class="dialog-container__content">
          {{ $t("dataManagement.update_dialog_message") }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button cancel" v-close-popup>
            {{ $t("common.cancel") }}
          </button>
          <button class="dialog-button confirm" @click="onSubmit">
            {{ $t("common.save") }}
          </button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Carton, ProfileDisplayAttribute, LP } from "../models/profile";
import { useI18n } from "vue-i18n";
import {
  ViewDisplayAttribute,
  composeViewElement,
  ProfileElementLevel,
  toUpperCaseElementInput,
} from "@/utils/profile.render";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const DataManagementDetailView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const inputRef: Ref<any> = ref(null);
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    const $q = useQuasar();
    const taskId = ref(route.query.taskId);
    const scanType = ref("");
    var pageType = ref(route.query.pageType);
    const pageViews: Ref<ViewDisplayAttribute[]> = ref([]);
    var lpModel: LP;
    var lpCarton: Carton; //根据taskId获取到的其中一个carton, 给Group用
    const cartonDetail = JSON.parse(
      localStorage.getItem("dataMgmtCarton") as never
    ) as Carton; //前一个页面存的carton, 给Detail用

    const isMix = ref(false);
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    const showDeleteDialog = ref(false);
    const showUpdateDialog = ref(false);
    const myForm = ref();
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const bottom = document.getElementById("bottom-button") as any;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop + "px";
      // hide bottom button if soft key up
      window.onresize = () => {
        // get resize height and recalculate scroll area
        const resizeHeight = window.innerHeight;
        const scrollArea = document.getElementById("scroll-area") as any;
        scrollArea.style.height = resizeHeight - scrollArea.offsetTop + "px";
        const bottom = document.getElementById("bottom-button") as any;
        if (deviceHeight - resizeHeight > 0) {
          bottom.style.visibility = "hidden";
        } else {
          bottom.style.visibility = "visible";
        }
      };
      scanType.value =
        taskId.value?.indexOf("Receiving") !== -1 ? "Receiving" : "Stuffing";
      if (typeof taskId.value === "string") {
        fetchTaskByTaskId(taskId.value);
        getCartonByTaskId(taskId.value);
      }
    });

    const profileAttrListDisplay: Ref<ProfileDisplayAttribute[]> = ref([]);
    const search = ref("");

    const goToMix = () => {
      if (isMix.value) {
        router.push({
          path: "/dataManagementMixCartonList",
          query: {
            taskId: taskId.value,
            cartonId: cartonDetail.cartonId,
          },
        });
      }
    };

    const back = () => {
      router.push({
        path: "/dataMgmtGD",
        query: {
          taskId: taskId.value,
          pageType: pageType.value,
        },
      });
    };

    const fetchTaskByTaskId = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      bridge.call("fetchTaskByTaskId", args, (res: string) => {
        lpModel = JSON.parse(res) as LP;
        if (lpModel.isMix == 1) {
          isMix.value = true;
        }
      });
    };

    const getCartonByTaskId = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      bridge.call("fetchLPByTaskId", args, (res: string) => {
        const lpList = JSON.parse(res) as Carton[];
        if (lpList.length > 0) {
          lpCarton = lpList[0];
        }
        getProfileDetailAttrList(taskId);
      });
    };

    const getProfileDetailAttrList = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      bridge.call("fetchProfileByProfileCode", args, (res: string) => {
        profileAttrListDisplay.value = JSON.parse(
          res
        ) as ProfileDisplayAttribute[];
        profileAttrListDisplay.value.forEach(
          (item: ProfileDisplayAttribute) => {
            if (item.type == scanType.value) {
              if (pageType.value === "Group") {
                if (
                  item.level == ProfileElementLevel.CARTON_COMMON ||
                  item.level == ProfileElementLevel.ORDER
                ) {
                  const element = composeViewElement(item);
                  element.editable = true;
                  switch (element.fieldName) {
                    case "PO":
                      element.model = ref(lpCarton.po);
                      break;
                    case "SO":
                      element.model = ref(lpCarton.so);
                      break;
                    case "SKU":
                      element.model = ref(lpCarton.sku);
                      break;
                    case "ContainerNumber":
                      element.model = ref(lpCarton.containerNumber);
                      break;
                    case "TotalCBM":
                      element.model = ref(lpModel.totalCBM);
                      break;
                    case "TotalWeight":
                      element.model = ref(lpModel.totalWeight);
                      break;
                    default:
                      break;
                  }
                  if (element) {
                    pageViews.value.push(element);
                  }
                }
              } else if (pageType.value === "Detail") {
                if (
                  item.level == ProfileElementLevel.CARTON_COMMON ||
                  item.level == ProfileElementLevel.CARTON_INDIVIDUAL
                ) {
                  const element = composeViewElement(item);
                  element.editable = false;
                  if (item.level === ProfileElementLevel.CARTON_INDIVIDUAL) {
                    element.editable = true;
                  } else {
                    element.valid = () => {
                      return new Promise((resolve) => {
                        resolve(true);
                      });
                    };
                  }
                  switch (element.fieldName) {
                    case "PO":
                      element.model = ref(cartonDetail.po);
                      break;
                    case "SO":
                      element.model = ref(cartonDetail.so);
                      break;
                    case "SKU":
                      element.model = ref(cartonDetail.so);
                      break;
                    case "ContainerNumber":
                      element.model = ref(cartonDetail.containerNumber);
                      break;
                    case "CartonID":
                      element.model = ref(cartonDetail.cartonId);
                      element.display = 1;
                      break;
                    case "Style":
                      element.model = ref(cartonDetail.style);
                      break;
                    case "Quantity":
                      element.model = ref(cartonDetail.quantity);
                      break;
                    case "HUB":
                      element.model = ref(cartonDetail.hub);
                      break;
                    default:
                      break;
                  }
                  if (element) {
                    pageViews.value.push(element);
                  }
                }
              }
            }
          }
        );
      });
    };

    const scan = (fieldName: string) => {
      const reqParams = {
        scanType: scanType.value,
        fieldName: fieldName,
      };
      bridge.call("scanForInput", reqParams);
    };

    bridge.register("getScanResult", (res: string) => {
      pageViews.value.forEach((view: any) => {
        const key = scanType.value + "_" + view.fieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.model = res.substring(res.lastIndexOf("_") + 1);
        }
      });
    });

    const composeSaveGroupParam = (params: any, source: any) => {
      source.forEach((view: ViewDisplayAttribute) => {
        if (view.editable == true) {
          params[view.fieldName] = view.model == null ? "" : view.model;
        }
      });
    };

    const composeSaveDetailParam = (params: any, source: any) => {
      source.forEach((view: ViewDisplayAttribute) => {
        if (view.editable == true) {
          params[view.fieldName] = view.model == null ? "" : view.model;
        }
      });
    };

    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          showUpdateDialog.value = false;
          if (pageType.value === "Group") {
            const apiParams = {
              taskId: taskId.value,
              SO: "",
              PO: "",
              SKU: "",
              ContainerNumber: "",
              TotalCBM: "",
              TotalWeight: "",
            };
            composeSaveGroupParam(apiParams, pageViews.value);

            bridge.call(
              "updateTaskForDataManagement",
              apiParams,
              (res: string) => {
                const androidResponse = JSON.parse(res) as AndroidResponse<any>;
                if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
                  taskId.value = androidResponse.data;
                  back();
                  popupSuccessMsg($q, "Updated Successfully");
                }
              }
            );
          } else if (pageType.value === "Detail") {
            showUpdateDialog.value = false;
            const apiParams = {
              LPID: cartonDetail.lpId,
              CartonID: "",
              Style: "",
              Quantity: "",
              HUB: "",
            };

            composeSaveDetailParam(apiParams, pageViews.value);
            bridge.call(
              "updateCartonForDataManagement",
              apiParams,
              (res: string) => {
                const androidResponse = JSON.parse(res) as AndroidResponse<any>;

                if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
                  taskId.value = androidResponse.data;
                  back();
                  popupSuccessMsg($q, "Updated Successfully");
                } else if (
                  androidResponse.status == AndroidResponseStatus.ERROR
                ) {
                  const message = i18n.t(
                    "messageCode." + androidResponse.messageCode
                  );
                  popupErrorMsg($q, message);
                }
              }
            );
          }
        }
      });
    };

    const handleDelete = () => {
      showDeleteDialog.value = false;
      if (pageType.value === "Group") {
        const args = {
          taskIdList: [taskId.value],
        };
        bridge.call("deleteTaskForDataManagement", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;

          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            popupSuccessMsg($q, "Deleted Successfully");
            router.push({
              path: "/dataManagement",
            });
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            const message = i18n.t(
              "messageCode." + androidResponse.messageCode
            );
            popupErrorMsg($q, message);
          }
        });
      } else if (pageType.value === "Detail") {
        const args = {
          LPID: cartonDetail.lpId,
        };
        bridge.call("deleteCartonForDataManagement", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            popupSuccessMsg($q, "Deleted Successfully");
            back();
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            const message = i18n.t(
              "messageCode." + androidResponse.messageCode
            );
            popupErrorMsg($q, message);
          }
        });
      }
    };
    const multiWatchSources = [pageViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const validPaste = (event: any, index: number) => {
      if (event.clipboardData && event.clipboardData.getData("Text")) {
        const text = event.clipboardData.getData("Text");
        // validatePasteValue(inputRef.value, text, index);
        const param = inputRef.value as any;
        param.forEach((t: any, i: number) => {
          if (index - 1 == i) {
            t.validate(text);
          }
        });
      }
    };

    return {
      router,
      goToMix,
      search,
      back,
      taskId,
      pageType,
      getProfileDetailAttrList,
      getCartonByTaskId,
      pageViews,
      cartonDetail,
      handleDelete,
      inputRef,
      onSubmit,
      validPaste,
      scan,
      homeIcon,
      arrowIcon,
      showDeleteDialog,
      showUpdateDialog,
      isMix,
      myForm,
    };
  },
});
export default DataManagementDetailView;
</script>
<style lang="scss" scoped>
.content {
  margin-top: $--page-content-margin-top-with-subtitle;
}

.button-bottom {
  position: fixed;
  bottom: 20px;
  width: calc(100% - 46px);
  background: #42b0d5;
  margin-left: 23px;
  border-radius: 3px;
}

.button-enable {
  color: #ffffff;
}

.button-disable {
  color: rgba(255, 255, 255, 0.6);
}
</style>

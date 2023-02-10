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
    </div>

    <q-separator color="grey-5" />
    <q-form @submit="onSubmit" style="background: #fff">
      <div>
        <q-item class="taskIdHeader">
          <q-item-section>
            {{ taskId }}
          </q-item-section>
        </q-item>
      </div>

      <div>
        <div v-for="(item, i) in pageViews" :key="i">
          <div
            v-show="item.editable === true"
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: #fff;
            "
          >
            <span style="padding-left: 1rem; color: black">
              {{ item.displayFieldName }}
            </span>

            <q-input
              ref="inputRef"
              v-model="item.model"
              @paste="validPaste($event, i)"
              clearable
              :maxlength="item.length"
              input-class="text-right"
              lazy-rules
              :rules="[item.valid]"
              borderless
              style="padding: 0px 16px"
            >
              <template v-slot:append>
                <q-avatar v-if="item.scan == 1" @click="scan(item.fieldName)">
                  <q-icon name="qr_code_scanner" />
                </q-avatar>
              </template>
            </q-input>
          </div>
          <div
            v-show="item.editable === false && pageType === 'Detail'"
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: #fff;
              height: 48.3px;
            "
          >
            <span style="padding-left: 1rem; color: #757575">
              {{ item.displayFieldName }}
            </span>
            <div style="padding: 0px 16px; color: #757575">
              {{ item.model }}
            </div>
          </div>
          <q-separator color="grey-5" />
        </div>
      </div>

      <div class="bottom row">
        <q-btn
          v-show="pageType == 'Detail'"
          class="col"
          no-caps
          style="background: #42b0d5; color: white"
          flat
          push
          :label="$t('dataManagement.mix')"
          @click="goToMix"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          class="col"
          no-caps
          style="background: #42b0d5; color: white"
          flat
          push
          type="submit"
          :label="$t('common.save')"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          class="col"
          no-caps
          style="background: #42b0d5; color: white"
          flat
          push
          :label="$t('common.delete')"
          @click="handleDelete"
        />
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Carton, ProfileDisplayAttribute, LP } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";
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

    const pageTitle = ref("");
    const deleteLabel = ref("");
    const saveLabel = ref("");
    const mixLabel = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    onMounted(() => {
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
      router.push({
        path: "/dataManagementMixCartonList",
        query: {
          taskId: taskId.value,
          cartonId: cartonDetail.cartonId,
        },
      });
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
                    case "CartonID":
                      element.model = ref(lpCarton.cartonId);
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
                  //除了 CartonID, 其它不要校验
                  if (item.dataFieldName === "CartonID") {
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
          params[view.fieldName] = view.model;
        }
      });
    };

    const composeSaveDetailParam = (params: any, source: any) => {
      source.forEach((view: ViewDisplayAttribute) => {
        if (view.editable == true) {
          params[view.fieldName] = view.model;
        }
      });
    };

    const onSubmit = () => {
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

        bridge.call("updateTaskForDataManagement", apiParams, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            taskId.value = androidResponse.data;
            back();
            popupSuccessMsg($q, "Updated Successfully");
          }
        });
      } else if (pageType.value === "Detail") {
        const apiParams = {
          LPID: cartonDetail.lpId,
          CartonID: "",
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
            } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
              i18n.category.value = "MessageCode";
              const message = i18n.$t(androidResponse.messageCode);
              popupErrorMsg($q, message);
            }
          }
        );
      }
    };

    const handleDelete = () => {
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
            i18n.category.value = "MessageCode";
            const message = i18n.$t(androidResponse.messageCode);
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
            i18n.category.value = "MessageCode";
            const message = i18n.$t(androidResponse.messageCode);
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
      pageTitle,
      deleteLabel,
      saveLabel,
      mixLabel,
      homeIcon,
      arrowIcon,
    };
  },
});
export default DataManagementDetailView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100%;
  position: relative;
  padding-bottom: 20px;
  min-height: 100vh;
}
.header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1;
  background-image: url("../assets/images/lns_bg.png");
  background-size: cover;
  padding-bottom: 10px;
  .q-item {
    height: 60px;
    width: 100%;
  }
  .title-text {
    font-size: 20px;
  }
  .search {
    margin: 0 20px;
    background-color: #ffffff;
  }
}
.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  width: 100%;
  height: 50px;
}
</style>

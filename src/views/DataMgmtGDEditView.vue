<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">{{ pageTitle }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
    </div>

    <q-separator color="grey-5" />

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
            {{ item.dataFieldName }}
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
              <q-avatar v-if="item.scan == 1" @click="scan(item.dataFieldName)">
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
            {{ item.dataFieldName }}
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
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        push
        :label="saveLabel"
        @click="handleSave"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        type="submit"
        push
        :label="deleteLabel"
        @click="handleDelete"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        v-show="pageType == 'Detail'"
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        type="submit"
        push
        :label="mixLabel"
        @click="goToMix"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Carton, ProfileDisplayAttribute, LP } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";
import { ProfileElementLevel, composeReg } from "@/utils/profile.render";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";

const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}

type ViewElement = {
  dataFieldName: string;
  level: string;
  mandatory: number;
  model: Ref<unknown>;
  reg: RegExp;
  display: number;
  scan: number;
  length: number;
  editable: boolean;
  valid: (val: string) => Promise<unknown>;
};

// Define fields for both manual type-in or scanning for SO, the rests are based on scan profile definition
const scanOrTypeInList = ["PO", "SO", "SKU", "ContainerNumber"];

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
    const pageViews: Ref<ViewElement[]> = ref([]);
    var lpModel: LP;
    var lpCarton: Carton; //根据taskId获取到的其中一个carton, 给Group用
    const cartonDetail = JSON.parse(
      localStorage.getItem("dataMgmtCarton") as never
    ) as Carton; //前一个页面存的carton, 给Detail用

    const pageTitle = ref("");
    const deleteLabel = ref("");
    const saveLabel = ref("");
    const mixLabel = ref("");
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
      i18n.category.value = "DataManagementView";
      pageTitle.value = i18n.$t("pageTitle");
      deleteLabel.value = i18n.$t("deleteLabel");
      saveLabel.value = i18n.$t("saveLabel");
      mixLabel.value = i18n.$t("mixLabel");
    });

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
          (attr: ProfileDisplayAttribute) => {
            if (attr.type == scanType.value) {
              if (pageType.value === "Group") {
                const element = composeGroupViewElements(attr);

                if (element) {
                  pageViews.value.push(element);
                }
              } else if (pageType.value === "Detail") {
                const element = composeCartonViewElements(attr);
                if (element) {
                  pageViews.value.push(element);
                }
              }
            }
          }
        );
      });
    };

    // Compose Group View
    const composeGroupViewElements = (attr: ProfileDisplayAttribute) => {
      if (
        attr.level == ProfileElementLevel.CARTON_COMMON ||
        attr.level == ProfileElementLevel.ORDER
      ) {
        const viewElement = {} as ViewElement;
        viewElement.dataFieldName = attr.dataFieldName;
        viewElement.editable = true;

        switch (viewElement.dataFieldName) {
          case "PO":
            viewElement.model = ref(lpCarton.po);
            break;
          case "SO":
            viewElement.model = ref(lpCarton.so);
            break;
          case "SKU":
            viewElement.model = ref(lpCarton.sku);
            break;
          case "ContainerNumber":
            viewElement.model = ref(lpCarton.containerNumber);
            break;
          case "CartonID":
            viewElement.model = ref(lpCarton.cartonId);
            break;
          case "TotalCBM":
            viewElement.model = ref(lpModel.totalCBM);
            break;
          case "TotalWeight":
            viewElement.model = ref(lpModel.totalWeight);
            break;
          default:
            break;
        }
        viewElement.level = attr.level;
        viewElement.mandatory = attr.mandatory;
        viewElement.reg = new RegExp(composeReg(attr.format));
        viewElement.display = attr.combo;
        viewElement.scan = attr.scan == "1" ? 1 : 0;
        viewElement.length = Math.abs(attr.maxLength);
        scanOrTypeInList.forEach((t) => {
          if (t == viewElement.dataFieldName) {
            viewElement.scan = 1;
          }
        });
        viewElement.valid = (val: string) => {
          return new Promise((resolve) => {
            if (viewElement.mandatory == 1 && !val) {
              resolve(`Please input ${viewElement.dataFieldName}`);
            } else {
              if (attr.maxLength < 0 && val.length > Math.abs(attr.maxLength)) {
                resolve(
                  `Please input not more than ${Math.abs(
                    attr.maxLength
                  )} charactors`
                );
              } else if (attr.maxLength > 0 && val.length != attr.maxLength) {
                resolve(
                  `Please input not more or less than ${attr.maxLength} charactors`
                );
              } else if (!viewElement.reg.test(val)) {
                resolve("Please input correct format");
              } else {
                resolve(true);
              }
            }
          });
        };
        return viewElement;
      }
    };

    // Compose Detail View
    const composeCartonViewElements = (attr: ProfileDisplayAttribute) => {
      if (
        attr.level == ProfileElementLevel.CARTON_COMMON ||
        attr.level == ProfileElementLevel.ORDER ||
        attr.level == ProfileElementLevel.CARTON_INDIVIDUAL
      ) {
        const viewElement = {} as ViewElement;
        viewElement.dataFieldName = attr.dataFieldName;
        viewElement.editable = false;

        switch (viewElement.dataFieldName) {
          case "PO":
            viewElement.model = ref(cartonDetail.po);
            break;
          case "SO":
            viewElement.model = ref(cartonDetail.so);
            break;
          case "SKU":
            viewElement.model = ref(cartonDetail.so);
            break;
          case "ContainerNumber":
            viewElement.model = ref(cartonDetail.containerNumber);
            break;
          case "CartonID":
            viewElement.model = ref(cartonDetail.cartonId);
            if (pageType.value === "Detail") {
              viewElement.editable = true;
            }
            break;
          case "Style":
            viewElement.model = ref(cartonDetail.style);
            break;
          case "Quantity":
            viewElement.model = ref(cartonDetail.quantity);
            break;
          case "HUB":
            viewElement.model = ref(cartonDetail.hub);
            break;
          default:
            break;
        }
        viewElement.level = attr.level;
        viewElement.mandatory = attr.mandatory;
        viewElement.reg = new RegExp(composeReg(attr.format));
        viewElement.display = attr.combo;
        viewElement.scan = attr.scan == "1" ? 1 : 0;
        viewElement.length = Math.abs(attr.maxLength);
        scanOrTypeInList.forEach((t) => {
          if (t == viewElement.dataFieldName) {
            viewElement.scan = 1;
          }
        });
        viewElement.valid = (val: string) => {
          return new Promise((resolve) => {
            if (viewElement.mandatory == 1 && !val) {
              resolve(`Please input ${viewElement.dataFieldName}`);
            } else {
              if (attr.maxLength < 0 && val.length > Math.abs(attr.maxLength)) {
                resolve(
                  `Please input not more than ${Math.abs(
                    attr.maxLength
                  )} charactors`
                );
              } else if (attr.maxLength > 0 && val.length != attr.maxLength) {
                resolve(
                  `Please input not more or less than ${attr.maxLength} charactors`
                );
              } else if (!viewElement.reg.test(val)) {
                resolve("Please input correct format");
              } else {
                resolve(true);
              }
            }
          });
        };
        return viewElement;
      }
    };

    const scan = (dataFieldName: string) => {
      const reqParams = {
        scanType: scanType,
        fieldName: dataFieldName,
      };
      bridge.call("scanForInput", reqParams);
    };

    bridge.register("getScanResult", (res: string) => {
      pageViews.value.forEach((view: any) => {
        const key = scanType.value + "_" + view.dataFieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.model = res.substring(res.lastIndexOf("_") + 1);
        }
      });
    });

    const composeSaveGroupParam = (params: any, source: any) => {
      source.forEach((view: ViewElement) => {
        if (view.editable == true) {
          params[view.dataFieldName] = view.model;
        }
      });
    };

    const composeSaveDetailParam = (params: any, source: any) => {
      source.forEach((view: ViewElement) => {
        if (view.editable == true) {
          params[view.dataFieldName] = view.model;
        }
      });
    };

    const handleSave = () => {
      inputRef.value.forEach((element: any) => {
        element.validate();
      });
      let hasError = false;
      inputRef.value.forEach((element: any) => {
        if (element.hasError) {
          hasError = true;
        }
      });
      if (hasError) {
        return;
      }

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
            back();
            popupSuccessMsg($q, "Updated Successfully");
          }
        );
      }
    };

    const handleDelete = (ids: [string]) => {
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
      handleSave,
      validPaste,
      scan,
      pageTitle,
      deleteLabel,
      saveLabel,
      mixLabel,
    };
  },
});
export default DataManagementDetailView;
</script>
<style lang="scss" scoped>
.wrapper {
  background-color: #e5e5e5;
  height: 100vh;
  .header {
    display: flex;
    background: #fff;
    justify-content: space-around;
    height: 60px;
    align-items: center;
  }
  .search {
    background: #fff;
    height: 60px;
    width: 100%;
  }
  .q-item {
    background-color: #fff;
    text-align: left;
    width: 100%;
  }
  .taskIdHeader {
    background: #040000;
    color: #ffffff;
    height: 47px;
    text-align: center;
    font-size: 13.3px;
  }
  .tab {
    background: #040000;
    color: #ffffff;
    height: 48.3px;
    text-align: center;
    font-size: 16px;
  }
  .list {
    background: #ffffff;
    color: gray;
    height: 50.6px;
    text-align: center;
    font-size: 16px;
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

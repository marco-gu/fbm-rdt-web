<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("dataManagement.data_management_header") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
      <div class="search">
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <div class="data-list-container" v-if="isEditMode">
      <q-list v-for="(item, index) in scanDataListDisplay" :key="index">
        <div>
          <q-item>
            <q-item-section side>
              <q-checkbox v-model="item.isSelected" />
            </q-item-section>
            <q-item-section style="text-align: left">
              <q-item-label lines="2" style="word-wrap: break-word">{{
                item.taskId
              }}</q-item-label>
              <q-item-label caption
                >{{ item.updateDatetime
                }}<q-img
                  v-show="item.uploadStatus == 1"
                  no-spinner
                  style="width: 17.3px; height: 11px; margin-left: 5px"
                  :src="uploaded" />
                <q-img
                  v-show="item.finishStatus == 1"
                  no-spinner
                  style="width: 17.3px; height: 11px; margin-left: 5px"
                  :src="finished"
              /></q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-circular-progress
                rounded
                show-value
                size="60px"
                thickness="0.25"
                color="blue-4"
                track-color="blue-2"
                :value="(item.scannedCartonNumber / item.allCartonNumber) * 100"
              >
                <div style="color: #00243d">
                  {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
                </div>
              </q-circular-progress>
            </q-item-section>
          </q-item>
          <q-separator spaced inset />
        </div>
      </q-list>
    </div>
    <div class="data-list-container" v-else v-touch-hold:1800="handleHold">
      <q-list v-for="(item, index) in scanDataListDisplay" :key="index">
        <div>
          <q-item clickable @click="onClickScanTask(item)">
            <q-item-section style="text-align: left">
              <q-item-label lines="2" style="word-wrap: break-word">{{
                item.taskId
              }}</q-item-label>
              <q-item-label caption
                >{{ item.updateDatetime
                }}<q-img
                  v-show="item.uploadStatus == 1"
                  no-spinner
                  style="width: 17.3px; height: 11px; margin-left: 5px"
                  :src="uploaded" />
                <q-img
                  v-show="item.finishStatus == 1"
                  no-spinner
                  style="width: 17.3px; height: 11px; margin-left: 5px"
                  :src="finished"
              /></q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-circular-progress
                rounded
                show-value
                size="60px"
                thickness="0.25"
                color="blue-4"
                track-color="blue-2"
                :value="(item.scannedCartonNumber / item.allCartonNumber) * 100"
              >
                <div style="color: #00243d">
                  {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
                </div>
              </q-circular-progress>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </q-item>
          <q-separator spaced inset />
        </div>
      </q-list>
    </div>
    <div class="bottom" v-show="isEditMode">
      <q-btn
        no-caps
        style="width: 48%"
        flat
        push
        :label="uploadLabel"
        @click="handleUpload"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 48%"
        flat
        push
        :label="deleteLabel"
        @click="handleDelete"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 52%"
        flat
        type="submit"
        push
        :label="cancelLabel"
        @click="cancelEditMode"
      />
    </div>
    <q-dialog v-model="dialogVisible" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ dialogMessage }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Confirm"
            color="primary"
            v-close-popup
            @click="onConfirm"
          />
          <q-btn
            flat
            :label="cancelLabel"
            color="primary"
            v-close-popup
            @click="onClose"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "@/plugin/i18nPlugins";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { ScanDataManagement } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import uploadedUrl from "../assets/images/uploaded.png";
import finishedUrl from "../assets/images/finished.png";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const enum UploadAlertMsg {
  MATCHED = "CIDs all matched",
  PARTIALLY = "CIDs partially matched",
  EXCEED = "Scanned carton number exceed expected carton number",
}
const DataManagementView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    const uploaded = uploadedUrl;
    const finished = finishedUrl;
    const $q = useQuasar();
    const search = ref("");
    const isEditMode = ref(false);
    const status = ref("pending");
    let result: ScanDataManagement[] = [];
    const scanDataListDisplay: Ref<ScanDataManagement[]> = ref([]);
    const pageTitle = ref("");
    const cancelLabel = ref("");
    const deleteLabel = ref("");
    const finishedLabel = ref("");
    const pendingLabel = ref("");
    const searchPlaceHolder = ref("");
    const statusLabel = ref("");
    const uploadLabel = ref("");
    const uploadedLabel = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
      i18n.category.value = "DataManagementView";
      pageTitle.value = i18n.$t("pageTitle");
      cancelLabel.value = i18n.$t("cancelLabel");
      deleteLabel.value = i18n.$t("deleteLabel");
      finishedLabel.value = i18n.$t("finishedLabel");
      pendingLabel.value = i18n.$t("pendingLabel");
      searchPlaceHolder.value = i18n.$t("searchPlaceHolder");
      statusLabel.value = i18n.$t("statusLabel");
      uploadLabel.value = i18n.$t("uploadLabel");
      uploadedLabel.value = i18n.$t("uploadedLabel");
    });
    const dialogVisible = ref(false);
    const dialogMessage = ref("");
    onMounted(() => {
      getScanDataList();
    });
    const getScanDataList = () => {
      bridge.call("fetchTaskForDataManagement", null, (res: string) => {
        result = JSON.parse(res) as ScanDataManagement[];
        scanDataListDisplay.value = JSON.parse(res) as ScanDataManagement[];
        sortScanDataList(scanDataListDisplay.value);
      });
    };
    const sortScanDataList = (scanDataListDisplay: any[]) => {
      scanDataListDisplay.sort((a: any, b: any) => {
        return b.updateDatetime.localeCompare(a.updateDatetime);
      });
    };
    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };
    watch(search, () => {
      if (search.value) {
        const filteredResult = result.filter(
          (item) =>
            item.taskId.toLowerCase().indexOf(search.value.toLowerCase()) > -1
        );
        scanDataListDisplay.value = filteredResult;
      } else {
        scanDataListDisplay.value = result;
      }
    });
    const onClickScanTask = (scanTask: any) => {
      router.push({
        path: "/dataMgmtGD",
        query: {
          taskId: scanTask.taskId,
          pageType: "Group",
        },
      });
    };
    const updateScanDataListDisplay = () => {
      scanDataListDisplay.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const handleHold = () => {
      updateScanDataListDisplay();
      isEditMode.value = true;
    };
    const getSelectedTaskIdList = () => {
      let taskIdList: any = [];
      scanDataListDisplay.value.forEach((item: any) => {
        if (item["isSelected"]) {
          taskIdList.push(item.taskId);
        }
      });
      return taskIdList;
    };
    const handleUpload = () => {
      let taskIdList = getSelectedTaskIdList();
      if (taskIdList.length > 0) {
        scanDataListDisplay.value.forEach((item: any) => {
          if (item["isSelected"]) {
            let alertMessage = "";
            const scannedCartonNumber = item["scannedCartonNumber"];
            const allCartonNumber = item["allCartonNumber"];
            if (scannedCartonNumber == allCartonNumber) {
              alertMessage = UploadAlertMsg.MATCHED;
            } else if (scannedCartonNumber < allCartonNumber) {
              alertMessage = UploadAlertMsg.PARTIALLY;
            } else {
              alertMessage = UploadAlertMsg.EXCEED;
            }
            dialogMessage.value += `${item["taskId"]}: ${alertMessage}.\n`;
          }
        });
        dialogMessage.value += "\nConfirm to upload?";
        dialogVisible.value = true;
      } else {
        i18n.category.value = "MessageCode";
        popupErrorMsg($q, "No record selected");
      }
    };
    const onConfirm = () => {
      dialogVisible.value = false;
      dialogMessage.value = "";
      uploadScanData();
    };
    const onClose = () => {
      dialogVisible.value = false;
      dialogMessage.value = "";
    };
    const uploadScanData = () => {
      const args = {
        taskIdList: getSelectedTaskIdList(),
      };
      bridge.call("uploadScanData", args, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          popupSuccessMsg($q, "Successfully uploaded");
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
        isEditMode.value = false;
        getScanDataList();
      });
    };
    const handleDelete = () => {
      let taskIdList = getSelectedTaskIdList();
      if (taskIdList.length > 0) {
        const args = {
          taskIdList: taskIdList,
        };
        bridge.call("deleteTaskForDataManagement", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            popupSuccessMsg($q, "Successfully deleted");
            isEditMode.value = false;
            getScanDataList();
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            i18n.category.value = "MessageCode";
            const message = i18n.$t(androidResponse.messageCode);
            popupErrorMsg($q, message);
          }
        });
      } else {
        i18n.category.value = "MessageCode";
        popupErrorMsg($q, "No record selected");
      }
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
    };
    return {
      back,
      cancelEditMode,
      cancelLabel,
      deleteLabel,
      dialogMessage,
      dialogVisible,
      finishedLabel,
      handleDelete,
      handleHold,
      handleUpload,
      isEditMode,
      onClickScanTask,
      onClose,
      onConfirm,
      pageTitle,
      pendingLabel,
      router,
      scanDataListDisplay,
      search,
      searchPlaceHolder,
      status,
      statusLabel,
      uploadedLabel,
      uploadLabel,
      uploaded,
      finished,
      homeIcon,
      arrowIcon,
    };
  },
});
export default DataManagementView;
</script>
<style lang="scss" scoped>
// .wrapper {
//   height: 100vh;
//   position: relative;
// }
// .header {
//   position: sticky;
//   top: 0;
//   width: 100%;
//   background-color: #ffffff;
//   z-index: 1;
//   .q-item {
//     background-color: #ffffff;
//     height: 60px;
//     width: 100%;
//   }
//   .title-text {
//     font-size: 21px;
//   }
// }
.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  background: #42b0d5;
  color: white;
  width: 100%;
  height: 50px;
}
</style>

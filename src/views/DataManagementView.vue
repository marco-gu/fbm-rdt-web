<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component>
    <div class="page-content">
      <div class="search" v-show="!isEditMode">
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
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <template v-if="scanDataListDisplay.length > 0">
          <div v-if="isEditMode == false">
            <div v-for="(item, index) in scanDataListDisplay" :key="index">
              <div
                v-touch-hold:900="handleHold"
                clickable
                @click="onClickScanTask(item)"
              >
                <q-item class="card-item">
                  <div class="card-item-content">
                    <q-item-section class="content-section-1">
                      <div
                        style="text-align: left"
                        v-html="formatTaskId(item.taskId)"
                      ></div>
                      <div style="height: 8px"></div>
                      <div
                        class="cardTime"
                        style="text-align: left; white-space: nowrap"
                      >
                        {{ formatDate(new Date(item.updateDatetime)) }}
                      </div>
                    </q-item-section>
                    <q-item-section class="content-section-2 process">
                      <q-item-label>
                        {{ item.scannedCartonNumber }}/{{
                          item.allCartonNumber
                        }}
                        <!-- 9999/9999 -->
                      </q-item-label>
                    </q-item-section>
                    <q-item-section
                      class="content-section-3"
                      style="display: flex; flex-direction: row"
                    >
                      <div class="column center" style="margin-right: 10px">
                        <q-img
                          width="20px"
                          height="20px"
                          no-spinner
                          :src="
                            item.finishStatus == 0 ? finishedDisabled : finished
                          "
                        />
                        <div
                          class="center"
                          style="font-size: 8px; margin-top: 8px"
                        >
                          {{ $t("common.finished") }}
                        </div>
                      </div>
                      <div class="column center">
                        <q-img
                          width="20px"
                          height="20px"
                          no-spinner
                          :src="
                            item.uploadStatus == 0 ? uploadedDisabled : uploaded
                          "
                        />
                        <div
                          class="center"
                          style="font-size: 8px; margin-top: 8px"
                        >
                          {{ $t("common.uploaded") }}
                        </div>
                      </div>
                    </q-item-section>
                  </div>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="black" />
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </div>
          <div v-else>
            <div style="height: 26px"></div>
            <div v-for="(item, index) in scanDataListDisplay" :key="index">
              <div class="row mb-15">
                <div class="center" style="width: 6%">
                  <q-checkbox
                    v-model="item.isSelected"
                    checked-icon="app:checkboxOn"
                    unchecked-icon="app:checkboxOff"
                  />
                </div>
                <div class="row edit-data-list-container" style="width: 89%">
                  <q-item-section class="content-section-1">
                    <div
                      class="cardTask"
                      v-html="formatTaskId(item.taskId)"
                    ></div>
                    <div style="height: 8px"></div>
                    <div class="cardTime">
                      {{ formatDate(new Date(item.updateDatetime)) }}
                    </div>
                  </q-item-section>
                  <q-item-section class="content-section-2 process">
                    <div>
                      {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
                      <!-- 9999/9999 -->
                    </div>
                  </q-item-section>
                  <q-item-section
                    class="content-section-3"
                    style="display: flex; flex-direction: row"
                  >
                    <div class="column center">
                      <q-img
                        width="20px"
                        height="20px"
                        no-spinner
                        :src="
                          item.finishStatus == 0 ? finishedDisabled : finished
                        "
                      />
                      <div style="height: 8px"></div>
                      <div class="center" style="font-size: 8px">
                        {{ $t("common.finished") }}
                      </div>
                    </div>
                    <div style="width: 8px"></div>
                    <div class="column center">
                      <q-img
                        width="20px"
                        height="20px"
                        no-spinner
                        :src="
                          item.uploadStatus == 0 ? uploadedDisabled : uploaded
                        "
                      />
                      <div
                        class="center"
                        style="font-size: 8px; margin-top: 8px"
                      >
                        {{ $t("common.uploaded") }}
                      </div>
                    </div>
                  </q-item-section>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="no-record">{{ $t("continue.no_record") }}</div>
        </template>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" v-show="isEditMode">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('dataManagement.upload')"
        @click="handleUpload"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.delete')"
        @click="handleDelete"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
    </div>
    <q-dialog v-model="dialogVisible" persistent>
      <div class="dialog-container">
        <div class="dialog-container__title">
          {{ $t("common.confirm") }}
          <q-icon name="close" v-close-popup />
        </div>
        <div class="dialog-container__content">
          {{ dialogMessage }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button cancel" v-close-popup>
            {{ $t("common.cancel") }}
          </button>
          <button class="dialog-button confirm" @click="onConfirm(dialogMode)">
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { ScanDataManagement } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import finishedUrl from "../assets/icon/finished.svg";
import finishedDisableUrl from "../assets/icon/finished_disable.svg";
import uploadedUrl from "../assets/icon/uploaded.svg";
import uploadedDisableUrl from "../assets/icon/uploaded_disable.svg";
import arrowRightUrl from "../assets/icon/arrow_right.svg";
import checkedUrl from "../assets/icon/checked.svg";
import uncheckedUrl from "../assets/icon/un_checked.svg";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import formatDate from "../utils/formatDate";
import { ProfileMaster } from "../models/profile";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import HeaderComponent from "@/components/HeaderComponent.vue";
const DataManagementView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const router = useRouter();
    const titleParam = i18n.t("dataManagement.data_management_header");
    const finishedDisabled = finishedDisableUrl;
    const finished = finishedUrl;
    const uploadedDisabled = uploadedDisableUrl;
    const uploaded = uploadedUrl;
    const arrowRight = arrowRightUrl;
    const checkedIcon = checkedUrl;
    const uncheckedIcon = uncheckedUrl;
    const search = ref("");
    const dialogMessage = ref("");
    const dialogVisible = ref(false);
    const dialogMode = ref("");
    const isEditMode = ref(false);
    const scanDataListDisplay: Ref<ScanDataManagement[]> = ref([]);
    let result: ScanDataManagement[] = [];
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      getScanDataList();
    });
    const getScanDataList = () => {
      bridge.call("fetchProfile", (res: string) => {
        const profiles = JSON.parse(res) as ProfileMaster[];
        var profileNames = profiles.map((element) => {
          return element.profileName;
        });
        bridge.call("fetchTaskForDataManagement", null, (res: string) => {
          result = JSON.parse(res) as ScanDataManagement[];
          result = result.filter((item) =>
            profileNames.includes(item.profileName)
          );
          scanDataListDisplay.value = result;
          sortScanDataList(scanDataListDisplay.value);
        });
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
      // recalculate scroll area
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height =
        window.innerHeight - scrollArea.offsetTop + "px";
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
      dialogMessage.value = "";
      let taskIdList = getSelectedTaskIdList();
      if (taskIdList.length > 0) {
        scanDataListDisplay.value.forEach((item: any) => {
          if (item["isSelected"]) {
            let alertMessage = "";
            const scannedCartonNumber = item["scannedCartonNumber"];
            const allCartonNumber = item["allCartonNumber"];
            if (scannedCartonNumber == allCartonNumber) {
              alertMessage = i18n.t("dataManagement.upload_carton_matched");
            } else if (scannedCartonNumber < allCartonNumber) {
              alertMessage = i18n.t("dataManagement.upload_carton_partially");
            } else {
              alertMessage = i18n.t("dataManagement.upload_carton_exceed");
            }
            dialogMessage.value += `${item["taskId"]}: ${alertMessage}.\n`;
          }
        });
        dialogMessage.value += `\n${i18n.t("dataManagement.confirm_upload")}?`;
        dialogVisible.value = true;
        dialogMode.value = "upload";
      } else {
        popupErrorMsg($q, i18n.t("dataManagement.no_record_selected"));
      }
    };
    const resetDialog = () => {
      dialogVisible.value = false;
      dialogMessage.value = "";
    };
    const onConfirm = (mode: string) => {
      resetDialog();
      if (mode === "upload") {
        uploadScanData();
      } else if (mode === "delete") {
        deleteScanData();
      }
    };
    const onClose = () => {
      resetDialog();
    };
    const uploadScanData = () => {
      showLoading($q);
      const args = {
        taskIdList: getSelectedTaskIdList(),
      };
      bridge.call("uploadScanData", args, (res: string) => {
        closeLoading($q);
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          popupSuccessMsg($q, i18n.t("dataManagement.successfully_uploaded"));
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
        isEditMode.value = false;
        getScanDataList();
      });
    };
    const handleDelete = () => {
      if (getSelectedTaskIdList().length > 0) {
        dialogMessage.value = i18n.t("dataManagement.delete_dialog_message");
        dialogVisible.value = true;
        dialogMode.value = "delete";
      } else {
        popupErrorMsg($q, i18n.t("dataManagement.no_record_selected"));
      }
    };
    const deleteScanData = () => {
      const args = {
        taskIdList: getSelectedTaskIdList(),
      };
      bridge.call("deleteTaskForDataManagement", args, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          popupSuccessMsg($q, i18n.t("dataManagement.successfully_deleted"));
          isEditMode.value = false;
          getScanDataList();
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
    };
    const formatTaskId = (taskId: string) => {
      const a = taskId.split("+").join("<br/>");
      return a;
    };
    return {
      back,
      cancelEditMode,
      dialogMessage,
      dialogMode,
      dialogVisible,
      handleDelete,
      handleHold,
      handleUpload,
      isEditMode,
      onClickScanTask,
      onClose,
      onConfirm,
      scanDataListDisplay,
      search,
      uploaded,
      uploadedDisabled,
      finished,
      finishedDisabled,
      arrowRight,
      checkedIcon,
      uncheckedIcon,
      formatTaskId,
      formatDate,
      titleParam,
    };
  },
});
export default DataManagementView;
</script>
<style lang="scss" scoped>
.card-item {
  background-color: #ffffff;
  padding: 10px 0px 10px 15px;
}

.card-item-content {
  display: flex;
  width: 100%;
  .content-section-1 {
    flex: 2.1;
  }
  .content-section-2 {
    text-align: center;
    flex: 1.2;
  }
  .content-section-3 {
    flex: 1.5;
  }
}

.mb-15 {
  margin-bottom: 20px;
}

.edit-data-list-container {
  display: flex;
  margin-left: 15px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  text-align: left;
  min-height: 99px;
  &:first-of-type {
    margin-top: 5px;
  }
}

.no-record {
  text-align: center;
  width: 100%;
  color: #757575;
}
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.cardTask {
  font-size: 15px;
  line-height: 18px;
  font-family: Maersk Text-Light, Maersk Text;
  color: #000000;
  font-weight: 400;
}

.cardTime {
  font-size: 15px;
  font-family: Maersk Text-Light, Maersk Text;
  color: #757575;
}

.process {
  text-align: center;
  font-size: 15px;
  font-family: Maersk Text-Bold, Maersk Text;
  font-weight: bold;
}
</style>

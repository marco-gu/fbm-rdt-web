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
    </div>

    <template v-if="scanDataListDisplay.length > 0">
      <div v-if="isEditMode == false">
        <div
          class="data-list-container"
          v-for="(item, index) in scanDataListDisplay"
          :key="index"
        >
          <div
            class="row"
            v-touch-hold:1800="handleHold"
            clickable
            @click="onClickScanTask(item)"
          >
            <div style="width: 38%">
              <div class="cardTask" v-html="formatTaskId(item.taskId)"></div>
              <div style="height: 8px"></div>
              <div class="cardTime">
                {{ formatDate(item.updateDatetime) }}
              </div>
            </div>
            <div class="center process">
              <div>
                {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
                <!-- 9999/9999 -->
              </div>
            </div>
            <div class="center" style="text-align: center; width: 28%">
              <div class="column center">
                <q-img
                  width="26px"
                  height="26px"
                  no-spinner
                  :src="item.finshStatus == 1 ? finishedDisabled : finished"
                />
                <div style="height: 8px"></div>
                <div class="center" style="font-size: 9px">FINISHED</div>
              </div>
              <div style="width: 8px"></div>
              <div class="column center">
                <q-img
                  width="26px"
                  height="26px"
                  no-spinner
                  :src="item.uploadStatus == 1 ? uploadedDisabled : uploaded"
                />
                <div style="height: 8px"></div>
                <div class="center" style="font-size: 9px">UPLOADED</div>
              </div>
            </div>
            <div class="center" style="width: 8%">
              <q-img width="8px" height="18px" no-spinner :src="arrowRight" />
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div v-for="(item, index) in scanDataListDisplay" :key="index">
          <div class="row">
            <div class="center" style="width: 6%; margin-left: 15px">
              <q-checkbox v-model="item.isSelected" />
            </div>
            <div class="row edit-data-list-container" style="width: 81%">
              <div style="width: 42%">
                <div class="cardTask" v-html="formatTaskId(item.taskId)"></div>
                <div style="height: 8px"></div>
                <div class="cardTime">
                  {{ formatDate(item.updateDatetime) }}
                </div>
              </div>
              <div class="center process">
                <div>
                  {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
                  <!-- 9999/9999 -->
                </div>
              </div>
              <div class="center" style="text-align: center; width: 32%">
                <div class="column center">
                  <q-img
                    width="26px"
                    height="26px"
                    no-spinner
                    :src="item.finshStatus == 1 ? finishedDisabled : finished"
                  />
                  <div style="height: 8px"></div>
                  <div class="center" style="font-size: 9px">FINISHED</div>
                </div>
                <div style="width: 8px"></div>
                <div class="column center">
                  <q-img
                    width="26px"
                    height="26px"
                    no-spinner
                    :src="item.uploadStatus == 1 ? uploadedDisabled : uploaded"
                  />
                  <div style="height: 8px"></div>
                  <div class="center" style="font-size: 9px">UPLOADED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="no-record">{{ $t("continue.no_record") }}</div>
    </template>

    <div class="bottom" v-show="isEditMode">
      <q-btn
        no-caps
        class="bottomButton"
        style="width: 48%"
        flat
        push
        :label="$t('dataManagement.upload')"
        @click="handleUpload"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="bottomButton"
        style="width: 48%"
        flat
        push
        :label="$t('common.delete')"
        @click="handleDelete"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="bottomButton"
        style="width: 52%"
        flat
        type="submit"
        push
        :label="$t('common.cancel')"
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

    const finishedDisabled = finishedDisableUrl;
    const finished = finishedUrl;

    const uploadedDisabled = uploadedDisableUrl;
    const uploaded = uploadedUrl;

    const arrowRight = arrowRightUrl;
    const checkedIcon = checkedUrl;
    const uncheckedIcon = uncheckedUrl;

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

    const formatTaskId = (taskId: string) => {
      const a = taskId.split("_").join("<br/>");
      return a;
    };

    // ✅ Format using reusable function
    function padTo2Digits(num: number) {
      return num.toString().padStart(2, "0");
    }

    // 👇️ format as "YYYY-MM-DD hh:mm"
    function formatDate(dateStr: string) {
      const date = new Date(dateStr);
      return (
        [
          date.getFullYear(),
          padTo2Digits(date.getMonth() + 1),
          padTo2Digits(date.getDate()),
        ].join("-") +
        " " +
        [padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes())].join(
          ":"
        )
      );
    }
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
      uploadLabel,
      uploaded,
      uploadedDisabled,
      finished,
      homeIcon,
      arrowIcon,
      finishedDisabled,
      arrowRight,
      checkedIcon,
      uncheckedIcon,
      formatTaskId,
      formatDate,
    };
  },
});
export default DataManagementView;
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
.data-list-container {
  margin: 20px;
  padding-left: 15px;
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

.edit-data-list-container {
  margin-left: 15px;
  margin-top: 20px;
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
.footer {
  position: absolute;
  bottom: 10px;
  text-align: center;
  width: 100%;
  color: #757575;
}

.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  background: #42b0d5;
  color: white;
  width: 100%;
  height: 50px;
}
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.bottomButton {
  font-size: 20px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #ffffff;
  line-height: 23px;
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
  width: 26%;
  font-size: 15px;
  font-family: Maersk Text-Bold, Maersk Text;
  font-weight: bold;
}
</style>

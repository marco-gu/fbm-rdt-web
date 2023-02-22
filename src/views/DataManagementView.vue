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
    <div class="content">
      <q-scroll-area class="scroll-area" :thumb-style="{ width: '0px' }">
        <template v-if="scanDataListDisplay.length > 0">
          <div v-if="isEditMode == false">
            <div v-for="(item, index) in scanDataListDisplay" :key="index">
              <div
                v-touch-hold:1800="handleHold"
                clickable
                @click="onClickScanTask(item)"
              >
                <q-item class="card-item">
                  <div class="card-item-content">
                    <q-item-section>
                      <div
                        style="text-align: left"
                        v-html="formatTaskId(item.taskId)"
                      ></div>
                      <div style="text-align: left; white-space: nowrap">
                        {{ formatDate(item.updateDatetime) }}
                      </div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ item.scannedCartonNumber }}/{{
                          item.allCartonNumber
                        }}</q-item-label
                      >
                    </q-item-section>
                    <q-item-section style="display: flex; flex-direction: row">
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
                          FINISHED
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
                          UPLOADED
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
                  <div style="width: 42%">
                    <div
                      class="cardTask"
                      v-html="formatTaskId(item.taskId)"
                    ></div>
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
                        width="20px"
                        height="20px"
                        no-spinner
                        :src="
                          item.finshStatus == 1 ? finishedDisabled : finished
                        "
                      />
                      <div style="height: 8px"></div>
                      <div class="center" style="font-size: 8px">FINISHED</div>
                    </div>
                    <div style="width: 8px"></div>
                    <div class="column center">
                      <q-img
                        width="20px"
                        height="20px"
                        no-spinner
                        :src="
                          item.uploadStatus == 1 ? uploadedDisabled : uploaded
                        "
                      />
                      <div class="center" style="font-size: 8px； height: 8px">
                        UPLOADED
                      </div>
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
          <button class="dialog-button confirm" @click="onConfirm">
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

    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    const dialogVisible = ref(false);
    const dialogMessage = ref("");
    onMounted(() => {
      // calculate scroll area height
      // const deviceHeight = window.innerHeight;
      // const scrollArea = document.getElementById("scroll-area") as any;
      // scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 30 + "px";
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
          const message = i18n.t(androidResponse.messageCode);
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
            const message = i18n.t(androidResponse.messageCode);
            popupErrorMsg($q, message);
          }
        });
      } else {
        popupErrorMsg($q, "No record selected");
      }
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
    };

    const formatTaskId = (taskId: string) => {
      const a = taskId.split("+").join("<br/>");
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
.card-item {
  padding: 10px 0px 10px 15px;
}
.card-item-content {
  display: flex;
  width: 100%;
}
.content {
  margin-top: $--page-content-margin-top-with-search;
}
.data-list-container {
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
.mb-15 {
  margin-bottom: 20px;
}
.edit-data-list-container {
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
.footer {
  position: absolute;
  bottom: 10px;
  text-align: center;
  width: 100%;
  color: #757575;
}
.button-bottom {
  position: fixed;
  bottom: 20px;
  width: calc(100% - 40px);
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.button-bottom {
  position: fixed;
  bottom: 20px;
  width: calc(100% - 40px);
  background: #42b0d5;
  color: white;
  font-size: 20px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #ffffff;
  line-height: 23px;
  border-radius: 3px;
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
.bottom-coherent-button {
  position: fixed;
  display: flex;
  bottom: $--page-bottom-margin-bottom;
  width: calc(100% - 46px);
  margin-left: 23px;
  background: #42b0d5;
  color: #ffffff;
  border-radius: 5px;
}
.scroll-area {
  height: 75vh;
}
</style>

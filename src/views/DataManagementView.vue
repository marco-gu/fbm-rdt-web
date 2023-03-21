<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component>
    <div class="page-content">
      <div class="search" v-show="!isEditMode">
        <q-input
          ref="input"
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
        >
          <template v-slot:prepend>
            <q-icon name="search" @click="onSearch" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="onClear" class="cursor-pointer" />
          </template>
        </q-input>
      </div>
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <template v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </template>
        <template v-if="loading">
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
          <div v-if="isEditMode == false">
            <div v-for="(item, index) in defaultDisplay" :key="index">
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
                          no-transition
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
                          no-transition
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
            <div v-for="(item, index) in defaultDisplay" :key="index">
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
                        no-transition
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
                        no-transition
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
        </q-infinite-scroll>
      </q-scroll-area>
      <!-- <div class="bottom-button" id="bottom-button"></div> -->
    </div>
    <div class="bottom-coherent-button" v-show="isEditMode">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.upload')"
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
          <button class="dialog-button confirm" @click="deleteScanData">
            {{ $t("common.delete") }}
          </button>
        </div>
      </div>
    </q-dialog>
    <q-dialog v-model="showUploadDialog" persistent>
      <div class="dialog-container">
        <div class="dialog-container__title">
          {{ $t("common.confirm") }}
          <q-icon name="close" v-close-popup />
        </div>
        <div class="dialog-container__content">
          {{ uploadDialogMessage }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button cancel" v-close-popup>
            {{ $t("common.cancel") }}
          </button>
          <button class="dialog-button confirm" @click="uploadScanData">
            {{ $t("common.upload") }}
          </button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted } from "@vue/runtime-core";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { ScanDataManagement } from "../models/profile";
import { Ref, ref, watch } from "vue";
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
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import HeaderComponent from "@/components/HeaderComponent.vue";
const DataManagementView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const loading = ref(false);
    const search = ref();
    const $q = useQuasar();
    const i18n = useI18n();
    const router = useRouter();
    const defaultDisplay = ref([] as ScanDataManagement[]);
    const onSearchMode = ref(false);
    const apiIndex = ref(0);
    const searchIndex = ref(0);
    const searchResult = ref([] as ScanDataManagement[]);
    const apiResult = ref([] as ScanDataManagement[]);
    const titleParam = i18n.t("dataManagement.data_management_header");

    const finishedDisabled = finishedDisableUrl;
    const finished = finishedUrl;
    const uploadedDisabled = uploadedDisableUrl;
    const uploaded = uploadedUrl;
    const arrowRight = arrowRightUrl;
    const checkedIcon = checkedUrl;
    const uncheckedIcon = uncheckedUrl;

    const uploadDialogMessage = ref("");
    const showDeleteDialog = ref(false);
    const showUploadDialog = ref(false);
    const isEditMode = ref(false);

    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const noRecord = ref(false);
    const input = ref();

    onBeforeMount(() => {
      loading.value = true;
      getScanDataList();
    });
    const onLoad = (index: any, done: any) => {
      if (onSearchMode.value) {
        const start = searchIndex.value * 10;
        const end = (searchIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (searchResult.value[i]) {
              defaultDisplay.value.push(searchResult.value[i]);
            }
          }
          if (defaultDisplay.value.length == (searchIndex.value + 1) * 10) {
            searchIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      } else {
        const start = apiIndex.value * 10;
        const end = (apiIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (apiResult.value[i]) {
              defaultDisplay.value.push(apiResult.value[i]);
            }
          }
          if (defaultDisplay.value.length == (apiIndex.value + 1) * 10) {
            apiIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      }
    };
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
    });

    const getScanDataList = () => {
      bridge.call("fetchTaskForDataManagement", {}, (data: any) => {
        loading.value = false;
        apiResult.value = JSON.parse(data) as ScanDataManagement[];

        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (apiResult.value.length > 10) {
            defaultDisplay.value = apiResult.value.slice(0, 10);
            apiIndex.value++;
          } else {
            defaultDisplay.value = apiResult.value;
            myInfiniteScroll.value.stop();
          }
        }
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
      defaultDisplay.value.forEach((item: any) => {
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
      defaultDisplay.value.forEach((item: any) => {
        if (item["isSelected"]) {
          taskIdList.push(item.taskId);
        }
      });
      return taskIdList;
    };
    const handleUpload = () => {
      showUploadDialog.value = true;
      let taskIdList = getSelectedTaskIdList();
      if (taskIdList.length > 0) {
        var isCartonMatched = true;
        defaultDisplay.value.forEach((item: any) => {
          if (
            item["isSelected"] &&
            item["scannedCartonNumber"] != item["allCartonNumber"]
          ) {
            isCartonMatched = false;
            return;
          }
        });
        if (isCartonMatched) {
          uploadDialogMessage.value = `${i18n.t(
            "dataManagement.upload_carton_matched"
          )} ${i18n.t("dataManagement.upload_dialog_message")}`;
        } else {
          uploadDialogMessage.value = `${i18n.t(
            "dataManagement.upload_carton_partially"
          )} ${i18n.t("dataManagement.upload_dialog_message")}`;
        }
      } else {
        popupErrorMsg($q, i18n.t("dataManagement.no_record_selected"));
      }
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
        showUploadDialog.value = false;
      });
    };
    const handleDelete = () => {
      if (getSelectedTaskIdList().length > 0) {
        showDeleteDialog.value = true;
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
        showDeleteDialog.value = false;
      });
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
    };
    const formatTaskId = (taskId: string) => {
      const a = taskId.split("+").join("<br/>");
      return a;
    };

    const onClear = () => {
      search.value = "";
      onSearchMode.value = false;
      if (apiResult.value.length > 0) {
        noRecord.value = false;
        if (apiResult.value.length > 10) {
          defaultDisplay.value = apiResult.value.slice(0, 10);
          apiIndex.value = 1;
          myInfiniteScroll.value.resume();
        } else {
          defaultDisplay.value = apiResult.value;
          myInfiniteScroll.value.stop();
        }
      } else {
        noRecord.value = true;
      }
      searchIndex.value = 0;
      myScrollArea.value.setScrollPosition("vertical", 0);
    };
    watch(search, () => {
      if (search.value) {
        if (search.value.length >= 5) {
          input.value.blur();
          onSearch();
        }
      } else if (search.value.length == 0) {
        onClear();
      }
    });
    const onSearch = () => {
      const args = {
        condition: search.value.toUpperCase(),
      };
      myScrollArea.value.setScrollPosition("vertical", 0);
      onSearchMode.value = true;
      defaultDisplay.value = [];
      searchResult.value = [];
      bridge.call("searchTaskForDataManagement", args, (data: any) => {
        searchResult.value = JSON.parse(data) as ScanDataManagement[];
        if (searchResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (searchResult.value.length > 10) {
            defaultDisplay.value = searchResult.value.slice(0, 10);
            searchIndex.value++;
            myInfiniteScroll.value.resume();
          } else {
            defaultDisplay.value = searchResult.value;
            myInfiniteScroll.value.stop();
          }
        }
      });
    };

    return {
      onClear,
      arrowRight,
      back,
      cancelEditMode,
      checkedIcon,
      deleteScanData,
      finished,
      finishedDisabled,
      formatTaskId,
      formatDate,
      handleDelete,
      handleHold,
      handleUpload,
      isEditMode,
      onClickScanTask,
      search,
      showDeleteDialog,
      showUploadDialog,
      titleParam,
      uploaded,
      uploadedDisabled,
      uploadDialogMessage,
      uploadScanData,
      uncheckedIcon,
      onSearch,
      onLoad,
      myInfiniteScroll,
      noRecord,
      input,
      myScrollArea,
      loading,
      defaultDisplay,
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

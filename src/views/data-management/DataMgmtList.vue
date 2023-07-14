<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('dataManagement.data_management_header')]"
      :icons="['back', 'home', 'search']"
      @onBack="back"
      @onHome="home"
      v-model:searchValue="search"
      @onOpenSearch="openSearch"
      @onCloseSearch="closeSearch"
    />
    <div class="page-content">
      <q-scroll-area
        ref="scrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <div v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </div>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="infiniteScroll">
          <div v-for="(item, index) in pageView" :key="index">
            <div
              class="common-card-2"
              @click="onDetail(item)"
              v-touch-hold:1800="handleHold"
            >
              <q-checkbox
                v-show="isEditMode"
                class="checkbox"
                v-model="item.isSelected"
                checked-icon="app:checkboxOn"
                unchecked-icon="app:checkboxOff"
              />
              <div class="label mb-lg">
                {{ item.profileName
                }}<span class="separator">&nbsp;|&nbsp;</span>{{ item.so }}
              </div>
              <div class="value">
                {{ item.po }}<span class="separator">&nbsp;|&nbsp;</span
                >{{ item.sku }}<span class="separator">&nbsp;|&nbsp;</span
                >{{ item.scanType }}
              </div>
              <div class="value mt-sm mb-lg">
                {{ item.updateDatetime }}
              </div>
              <div class="label">
                {{ item.scannedCartonNumber
                }}<span class="separator">&nbsp;of&nbsp;</span
                >{{ item.allCartonNumber
                }}<span class="separator">&nbsp;|&nbsp;</span
                >{{
                  item.finishStatus === 0
                    ? $t("common.unfinished")
                    : $t("common.completed")
                }}
                <span class="separator">&nbsp;|&nbsp;</span
                >{{
                  item.uploadStatus === 0
                    ? $t("common.not_upload")
                    : $t("common.uploaded")
                }}
              </div>
            </div>
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button" v-show="isEditMode">
      <q-btn
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :disable="isButtonDisabled"
        :label="$t('common.upload')"
        @click="showUploadDialog"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.delete')"
        :disable="isButtonDisabled"
        @click="showDeleteDialog"
      />
    </div>
  </div>
  <PopupComponent
    :visible="dialogVisible"
    :message="msg"
    :type="type"
    :messageCode="msgCode"
    @close="onConfirmDialog"
    @cancel="dialogVisible = false"
  ></PopupComponent>
  <NotifyComponent
    :visible="notifyVisible"
    :message="msg"
    @close="onCloseNotify"
  >
  </NotifyComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import NotifyComponent from "@/components/NotifyComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { DataMgmt } from "@/models/data.management";
import router from "@/router";
import { useStore } from "@/store";
import bridge from "dsbridge";

import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { PAGESIZE } from "../../models/constant";
import {
  setContentHeight,
  setContentHeightWithBtn,
  setContentHeightInSearch,
  setContentHeightOutSearch,
} from "../../utils/screen.util";
const DataMgmtList = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    LoadingComponent,
    NotifyComponent,
  },
  setup() {
    const i18n = useI18n();
    const store = useStore();
    const route = useRoute();
    const pageView = ref([] as DataMgmt[]);
    const apiResult = ref([] as DataMgmt[]);
    const searchResult = ref([] as DataMgmt[]);
    const noRecord = ref(false);
    const apiPageNumber = ref(0);
    const searchPageNumber = ref(0);
    const infiniteScroll = ref();
    const isEditMode = ref(false);
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const msgCode = ref("");
    const pressUpload = ref(false);
    const pressDelete = ref(false);
    const loadingStatus = ref(false);
    const search = ref("");
    const scrollArea = ref();
    const searchMode = ref(false);
    const pageInit = ref(false);
    const notifyVisible = ref(false);
    onMounted(() => {
      setContentHeight("scroll-area");
      loadingStatus.value = true;
      setTimeout(() => {
        getData();
      }, 200);
      if (route.params.from) {
        apiResult.value = store.state.dataMgmtModule.dataMgmtList;
        processData();
      } else if (route.query.from) {
        apiResult.value = store.state.dataMgmtModule.dataMgmtList;
        processData();
      } else {
        loadingStatus.value = true;
        setTimeout(() => {
          getData();
        }, 200);
      }
    });
    const handleHold = () => {
      clearCheckbox();
      isEditMode.value = true;
      setContentHeightWithBtn("scroll-area");
    };
    const onDetail = (item: DataMgmt) => {
      if (!isEditMode.value) {
        store.dispatch("dataMgmtModule/saveDataMgmt", apiResult).then(() => {
          store.dispatch("dataMgmtModule/saveDataMgmtItem", item).then(() => {
            router.push("/dataMgmtDetail");
          });
        });
      }
    };
    const isButtonDisabled = computed(() => {
      return !pageView.value.some((item: any) => item["isSelected"]);
    });
    const cancelEditMode = () => {
      clearCheckbox();
      isEditMode.value = false;
      setContentHeight("scroll-area");
    };
    const clearCheckbox = () => {
      pageView.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const showUploadDialog = () => {
      pressUpload.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.upload_dialog_message");
    };
    const showDeleteDialog = () => {
      dialogVisible.value = true;
      type.value = "action";
      pressDelete.value = true;
      msg.value = i18n.t("common.delete_dialog_message");
    };
    const onConfirmDialog = () => {
      const taskList: string[] = [];
      pageView.value.forEach((item: any) => {
        if (item["isSelected"] == true) {
          taskList.push(item.taskID);
        }
      });
      const args = {
        taskIdList: taskList,
      };
      if (pressUpload.value) {
        dialogVisible.value = false;
        bridge.call("uploadScanData", args, (res: string) => {
          pressUpload.value = false;
          // uploadDialogSuccess.value = true;
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            notifyVisible.value = true;
            msg.value = i18n.t("common.upload_success");
            scrollArea.value.setScrollPosition("vertical", 0);
            cancelEditMode();
            getData();
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            type.value = "error";
            dialogVisible.value = true;
            msg.value = i18n.t("messageCode." + androidResponse.messageCode);
            msgCode.value = androidResponse.messageCode;
          }
        });
      } else if (pressDelete.value) {
        dialogVisible.value = false;
        bridge.call("deleteTaskForDataManagement", args, (res: string) => {
          pressDelete.value = false;
          // deleteDialogSuccess.value = true;
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            notifyVisible.value = true;
            msg.value = i18n.t("common.delete_success");
            scrollArea.value.setScrollPosition("vertical", 0);
            cancelEditMode();
            getData();
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            type.value = "error";
            dialogVisible.value = true;
            msg.value = i18n.t("messageCode." + androidResponse.messageCode);
            msgCode.value = androidResponse.messageCode;
          }
        });
      } else {
        dialogVisible.value = false;
      }
    };
    const onLoad = (index: any, done: any) => {
      if (searchMode.value) {
        if (
          searchResult.value.length >
          (searchPageNumber.value + 1) * PAGESIZE
        ) {
          const index = apiPageNumber.value + 1;
          pageView.value = searchResult.value.slice(0, index * PAGESIZE);
          searchPageNumber.value++;
        } else {
          pageView.value = searchResult.value.slice(
            0,
            searchResult.value.length
          );
          infiniteScroll.value.stop();
        }
        done();
      } else {
        if (!pageInit.value) {
          if (apiResult.value.length > (apiPageNumber.value + 1) * PAGESIZE) {
            const index = apiPageNumber.value + 1;
            pageView.value = apiResult.value.slice(0, index * PAGESIZE);
            apiPageNumber.value++;
          } else {
            pageView.value = apiResult.value.slice(0, apiResult.value.length);
            infiniteScroll.value.stop();
          }
          if (isEditMode.value) {
            clearCheckbox();
          }
          done();
        } else {
          pageInit.value = false;
        }
        done();
      }
    };
    const getData = () => {
      bridge.call("fetchDataMgmt", {}, (data: any) => {
        loadingStatus.value = false;
        apiResult.value = JSON.parse(data) as DataMgmt[];
        processData();
      });
    };
    const processData = () => {
      if (apiResult.value.length == 0) {
        noRecord.value = true;
        pageView.value = [];
      } else {
        pageInit.value = true;
        if (apiResult.value.length > PAGESIZE) {
          pageView.value = apiResult.value.slice(0, PAGESIZE);
          apiPageNumber.value++;
          infiniteScroll.value.resume();
        } else {
          pageView.value = apiResult.value;
          infiniteScroll.value.stop();
        }
      }
    };
    watch(search, () => {
      if (search.value.length > 0) {
        onSearch();
      } else {
        onClear();
      }
    });
    const onClear = () => {
      search.value = "";
      searchMode.value = false;
      scrollArea.value.setScrollPosition("vertical", 0);
      processData();
    };
    const onSearch = () => {
      searchMode.value = true;
      searchPageNumber.value = 0;
      if (apiResult.value.length > 0) {
        scrollArea.value.setScrollPosition("vertical", 0);
        searchResult.value = apiResult.value.filter((item) => {
          if (item.po) {
            return (
              item.so.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ||
              item.po.toLowerCase().indexOf(search.value.toLowerCase()) > -1
            );
          } else {
            return (
              item.so.toLowerCase().indexOf(search.value.toLowerCase()) > -1
            );
          }
        });
        if (searchResult.value.length > 0) {
          noRecord.value = false;
          if (searchResult.value.length > PAGESIZE) {
            pageView.value = searchResult.value.slice(0, PAGESIZE);
            searchPageNumber.value++;
            infiniteScroll.value.resume();
          } else {
            pageView.value = searchResult.value;
            infiniteScroll.value.stop();
          }
        } else {
          noRecord.value = true;
          pageView.value = [];
        }
      } else {
        noRecord.value = true;
        pageView.value = [];
      }
    };
    const home = () => {
      router.push("/home");
    };
    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };
    const openSearch = () => {
      setContentHeightInSearch("scroll-area");
    };
    const closeSearch = () => {
      setContentHeightOutSearch("scroll-area");
    };
    const onCloseNotify = () => {
      notifyVisible.value = false;
    };
    return {
      infiniteScroll,
      pageView,
      onDetail,
      handleHold,
      isEditMode,
      isButtonDisabled,
      cancelEditMode,
      showUploadDialog,
      type,
      dialogVisible,
      msg,
      msgCode,
      showDeleteDialog,
      onConfirmDialog,
      onLoad,
      loadingStatus,
      back,
      home,
      search,
      scrollArea,
      openSearch,
      closeSearch,
      noRecord,
      notifyVisible,
      onCloseNotify,
    };
  },
});
export default DataMgmtList;
</script>

<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('dataManagement.data_management_header')]"
      :icons="['back', 'home', 'search']"
      @onBack="back"
      @onHome="home"
      @onSearch="onSearch($event)"
    />
    <div class="page-content">
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
      >
        <template v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </template>
        <template v-else>
          <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
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
        </template>
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
    @close="onConfirmDialog"
    @cancel="dialogVisible = false"
  ></PopupComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { DataMgmt } from "@/models/data.management";
import router from "@/router";
import { useStore } from "@/store";
import bridge from "dsbridge";

import { computed, defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { pageSize } from "../../models/constant";
const DataMgmtListView = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    LoadingComponent,
  },
  setup() {
    const i18n = useI18n();
    const pageView = ref([] as DataMgmt[]);
    const apiResult = ref([] as DataMgmt[]);
    const noRecord = ref(false);
    const pageNumber = ref(0);
    const myInfiniteScroll = ref();
    const store = useStore();
    const isEditMode = ref(false);
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const pressUpload = ref(false);
    const pressDelete = ref(false);
    const isSearchMode = ref(false);
    const loadingStatus = ref(true);
    onBeforeMount(() => {
      getData();
    });
    onMounted(() => {
      initScreenSize();
    });
    const handleHold = () => {
      clearCheckbox();
      isEditMode.value = true;
      selectionModeScreenSize();
    };
    const onDetail = (item: DataMgmt) => {
      if (!isEditMode.value) {
        store.dispatch("dataMgmtModule/saveDataMgmt", item).then(() => {
          router.push("/dataManagementSummary");
        });
      }
    };
    const isButtonDisabled = computed(() => {
      return !pageView.value.some((item: any) => item["isSelected"]);
    });
    const onSearch = (e: string) => {
      console.log(e);
    };
    const cancelEditMode = () => {
      clearCheckbox();
      isEditMode.value = false;
      initScreenSize();
    };
    const showUploadDialog = () => {
      dialogVisible.value = true;
      type.value = "action";
      pressUpload.value = true;
      msg.value = i18n.t("dataManagement.upload_dialog_message");
    };
    const showDeleteDialog = () => {
      dialogVisible.value = true;
      type.value = "action";
      pressDelete.value = true;
      msg.value = i18n.t("dataManagement.delete_dialog_message");
    };
    const clearCheckbox = () => {
      pageView.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
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
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            cancelEditMode();
            getData();
          }
        });
      } else if (pressDelete.value) {
        dialogVisible.value = false;
        bridge.call("deleteTaskForDataManagement", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            cancelEditMode();
            getData();
          }
        });
      }
    };
    const onLoad = (index: any, done: any) => {
      if (isSearchMode.value) {
        // const start = searchIndex.value * 10;
        // const end = (searchIndex.value + 1) * 10;
        // setTimeout(() => {
        //   for (let i = start; i < end; i++) {
        //     if (
        //       searchResult.value[i] &&
        //       defaultDisplay.value.length < searchResult.value.length
        //     ) {
        //       defaultDisplay.value.push(searchResult.value[i]);
        //     }
        //   }
        //   if (defaultDisplay.value.length == (searchIndex.value + 1) * 10) {
        //     searchIndex.value++;
        //   } else {
        //     myInfiniteScroll.value.stop();
        //   }
        //   done();
        // }, 200);
      } else {
        if (pageNumber.value > 0) {
          const start = pageNumber.value * pageSize;
          const end = (pageNumber.value + 1) * pageSize;
          for (let i = start; i < end; i++) {
            if (
              apiResult.value[i] &&
              pageView.value.length < apiResult.value.length
            ) {
              pageView.value.push(apiResult.value[i]);
            }
          }
          if (pageView.value.length == (pageNumber.value + 1) * pageSize) {
            pageNumber.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }
      }
    };
    const getData = () => {
      bridge.call("fetchDataMgmt", {}, (data: any) => {
        loadingStatus.value = false;
        apiResult.value = JSON.parse(data) as any[];
        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (apiResult.value.length > pageSize) {
            pageView.value = apiResult.value.slice(0, pageSize);
            pageNumber.value++;
          } else {
            pageView.value = apiResult.value;
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
    const home = () => {
      router.push("/home");
    };
    const initScreenSize = () => {
      // TODO First time calculate scroll areea
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    };
    const selectionModeScreenSize = () => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height =
        deviceHeight - scrollArea.offsetTop - 100 + "px";
    };
    return {
      onSearch,
      myInfiniteScroll,
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
      showDeleteDialog,
      onConfirmDialog,
      onLoad,
      loadingStatus,
      back,
      home,
      thumbStyle: {
        right: "4px",
        borderRadius: "5px",
        backgroundColor: "black",
        width: "5px",
        opacity: 0.75,
      },

      barStyle: {
        right: "4px",
        borderRadius: "9px",
        backgroundColor: "black",
        width: "5px",
        opacity: 0.2,
      },
    };
  },
});
export default DataMgmtListView;
</script>
<style scoped lang="scss"></style>

<template>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('dataManagement.data_management_header')]"
      :icons="['back', 'home', 'search']"
      @onBack="home"
      @onHome="home"
      @onSearch="onSearch($event)"
    />
    <div class="page-content">
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
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
            <template v-if="apiIndex > 0" v-slot:loading>
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
const DataMgmtListView = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const i18n = useI18n();
    const pageView = ref([] as DataMgmt[]);
    const apiResult = ref([] as DataMgmt[]);
    const noRecord = ref(false);
    const apiIndex = ref(0);
    const myInfiniteScroll = ref();
    const store = useStore();
    const isEditMode = ref(false);
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const pressUpload = ref(false);
    const pressDelete = ref(false);
    const isSearchMode = ref(false);
    onBeforeMount(() => {
      initData();
    });
    onMounted(() => {
      // TODO First time calculate scroll areea
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    });
    // TODO calculate scroll area
    const handleHold = () => {
      clearCheckbox();
      isEditMode.value = true;
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height =
        deviceHeight - scrollArea.offsetTop - 100 + "px";
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
    const home = () => {
      router.push("/home");
    };
    // TODO calculate scroll area after cancel
    const cancelEditMode = () => {
      clearCheckbox();
      isEditMode.value = false;
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
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
      if (pressUpload.value) {
        dialogVisible.value = false;
        // todo upload
        cancelEditMode();
      } else if (pressDelete.value) {
        dialogVisible.value = false;
        const taskList: string[] = [];
        pageView.value.forEach((item: any) => {
          if (item["isSelected"] == true) {
            taskList.push(item.taskID);
          }
        });
        const args = {
          taskIdList: taskList,
        };
        bridge.call("deleteTaskForDataManagement", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            cancelEditMode();
            initData();
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
        const start = apiIndex.value * 10;
        const end = (apiIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (
              apiResult.value[i] &&
              pageView.value.length < apiResult.value.length
            ) {
              pageView.value.push(apiResult.value[i]);
            }
          }
          if (pageView.value.length == (apiIndex.value + 1) * 10) {
            apiIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      }
    };
    const initData = () => {
      bridge.call("fetchDataMgmt", {}, (data: any) => {
        apiResult.value = JSON.parse(data) as any[];
        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (apiResult.value.length == 10) {
            pageView.value = apiResult.value;
            apiIndex.value++;
          } else {
            pageView.value = apiResult.value;
            myInfiniteScroll.value.stop();
          }
        }
      });
    };
    return {
      onSearch,
      myInfiniteScroll,
      pageView,
      onDetail,
      handleHold,
      isEditMode,
      isButtonDisabled,
      home,
      cancelEditMode,
      showUploadDialog,
      type,
      dialogVisible,
      msg,
      showDeleteDialog,
      onConfirmDialog,
      onLoad,
    };
  },
});
export default DataMgmtListView;
</script>
<style scoped lang="scss"></style>

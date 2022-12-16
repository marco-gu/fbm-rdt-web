<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable>
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span class="title-text">Data Management</span></q-item-section
        >
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
      <div class="search q-pa-sm" v-show="!isEditMode">
        <q-input v-model="search" outlined dense placeholder="Search" clearable>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="status q-pa-xs" style="text-align: left">
        <q-btn-dropdown flat :label="status">
          <q-list>
            <q-item clickable v-close-popup @click="status = 'pending'">
              <q-item-section>Pending</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="status = 'finished'">
              <q-item-section>Finished</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="status = 'uploaded'">
              <q-item-section>Uploaded</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>
    <div class="data-list-container" v-if="isEditMode">
      <q-list v-for="(item, index) in scanDataListDisplay" :key="index">
        <div v-if="item.status == status">
          <q-item>
            <q-item-section side>
              <q-checkbox v-model="item.isSelected" />
            </q-item-section>
            <q-item-section style="text-align: left">
              <q-item-label>{{ item.taskId }}</q-item-label>
              <q-item-label caption>{{ item.updateDatetime }}</q-item-label>
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
        <div v-if="item.status == status">
          <q-item clickable @click="onClickScanTask(item)">
            <q-item-section style="text-align: left">
              <q-item-label>{{ item.taskId }}</q-item-label>
              <q-item-label caption>{{ item.updateDatetime }}</q-item-label>
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
        label="Upload"
        @click="handleUpload"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 48%"
        flat
        push
        label="Delete"
        @click="handleDelete"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 52%"
        flat
        type="submit"
        push
        label="Cancel"
        @click="cancelEditMode"
      />
    </div>
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
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
const DataManagementView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    const $q = useQuasar();
    const search = ref("");
    const isEditMode = ref(false);
    const status = ref("pending");
    let result: ScanDataManagement[] = [];
    const scanDataListDisplay: Ref<ScanDataManagement[]> = ref([]);
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
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
        return (a.taskId + "").localeCompare(b.taskId + "");
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
        const args = {
          taskIdList: taskIdList,
        };
        bridge.call("uploadScanData", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            popupSuccessMsg($q, "Successfully uploaded");
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
      router,
      back,
      search,
      status,
      isEditMode,
      handleHold,
      handleUpload,
      handleDelete,
      cancelEditMode,
      onClickScanTask,
      scanDataListDisplay,
    };
  },
});
export default DataManagementView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  position: relative;
}
.header {
  position: sticky;
  top: 0;
  width: 100%;
  background-color: #ffffff;
  z-index: 1;
  .q-item {
    background-color: #ffffff;
    height: 60px;
    width: 100%;
  }
  .title-text {
    font-size: 21px;
  }
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
</style>

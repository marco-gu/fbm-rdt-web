<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable>
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span class="title-text">{{ pageTitle }}</span></q-item-section
        >
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
      <div class="search q-pa-sm">
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="searchPlaceHolder"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="status q-pa-xs" style="text-align: left">
        <q-btn-dropdown flat :label="statusLabel">
          <q-list>
            <q-item clickable v-close-popup @click="onSelectStatus('pending')">
              <q-item-section>{{ pendingLabel }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onSelectStatus('finished')">
              <q-item-section>{{ finishedLabel }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onSelectStatus('uploaded')">
              <q-item-section>{{ uploadLabel }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <div class="data-list-container">
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
const MyJobsView = defineComponent({
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
    const status = ref("pending");
    let result: ScanDataManagement[] = [];
    const scanDataListDisplay: Ref<ScanDataManagement[]> = ref([]);
    const pageTitle = ref("");
    const finishedLabel = ref("");
    const pendingLabel = ref("");
    const searchPlaceHolder = ref("");
    const statusLabel = ref("");
    const uploadLabel = ref("");
    const uploadedLabel = ref("");
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
      i18n.category.value = "ContinueMyJobView";
      pageTitle.value = i18n.$t("pageTitle");
      pendingLabel.value = i18n.$t("pendingLabel");
      searchPlaceHolder.value = i18n.$t("searchPlaceHolder");
      statusLabel.value = i18n.$t("statusLabel");
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

    const onSelectStatus = (item: string) => {
      status.value = item;
      switch (item) {
        case "pending":
          statusLabel.value = pendingLabel.value;
          break;
        case "finished":
          statusLabel.value = finishedLabel.value;
          break;
        case "uploaded":
          statusLabel.value = uploadedLabel.value;
          break;
        default:
          break;
      }
    };
    return {
      back,
      onClickScanTask,
      onSelectStatus,
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
    };
  },
});
export default MyJobsView;
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

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
    </div>

    <div class="data-list-container">
      <q-list v-for="(item, index) in scanDataListDisplay" :key="index">
        <div>
          <q-item clickable @click="onClickScanTask(item)">
            <q-item-section style="text-align: left">
              <q-item-label lines="2" style="word-wrap: break-word">{{
                item.taskId
              }}</q-item-label>
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

    <div class="footer">{{ instruction }}</div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { useI18n } from "@/plugin/i18nPlugins";

import { ScanDataManagement } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";

const MyJobsView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();

    const search = ref("");

    let result: ScanDataManagement[] = [];
    const scanDataListDisplay: Ref<ScanDataManagement[]> = ref([]);
    const pageTitle = ref("");

    const searchPlaceHolder = ref("");
    const instruction = ref("");

    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
      i18n.category.value = "ContinueMyJobView";
      pageTitle.value = i18n.$t("pageTitle");
      searchPlaceHolder.value = i18n.$t("searchPlaceHolder");
      instruction.value = i18n.$t("instruction");
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
      const args = {
        taskID: scanTask.taskId,
        type: scanTask.scanType,
        profileCode: scanTask.profileCode,
        pageType:
          scanTask.validationType == "PreValidation" ? "online" : "offline",
      };
      bridge.call("continueJobScan", args);
    };

    return {
      back,
      onClickScanTask,
      pageTitle,
      router,
      scanDataListDisplay,
      search,
      searchPlaceHolder,
      instruction,
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
    text-align: left;
    font-size: 21px;
  }
}
.footer {
  position: fixed;
  bottom: 0px;
  text-align: center;
  height: 50px;
  width: 100%;
  font-size: 16px;
  color: #757575;
}
</style>

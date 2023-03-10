<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="search">
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
          <div
            v-for="(item, index) in scanDataListDisplay"
            :key="index"
            @click="onClickScanTask(item)"
          >
            <q-item class="card-item">
              <div class="card-item-content">
                <div class="card-item-left">
                  <q-item-section>
                    <div style="width: 80%">
                      <q-item-label>{{ item.taskId }}</q-item-label>
                      <q-item-label class="card-item-date-text">{{
                        item.updateDatetime
                      }}</q-item-label>
                    </div>
                  </q-item-section>
                </div>
                <div class="card-item-right">
                  <CircularProgressComponent
                    :value="
                      (item.scannedCartonNumber / item.allCartonNumber) * 100
                    "
                  >
                    <div class="card-item-sub-text">
                      {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
                    </div>
                  </CircularProgressComponent>
                </div>
              </div>
              <q-item-section side>
                <q-icon name="chevron_right" color="black" />
              </q-item-section>
            </q-item>
          </div>
          <div class="footer-message">{{ $t("continue.instruction") }}</div>
        </template>
        <template v-else>
          <div class="no-record">{{ $t("continue.no_record") }}</div>
        </template>
      </q-scroll-area>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import CircularProgressComponent from "@/components/CircularProgressComponent.vue";
import { ScanDataManagement } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { ProfileMaster } from "../models/profile";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useI18n } from "vue-i18n";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import { useQuasar } from "quasar";
const MyJobsView = defineComponent({
  components: {
    CircularProgressComponent,
    HeaderComponent,
  },
  setup() {
    const $q = useQuasar();
    const search = ref("");
    const i18n = useI18n();
    let result: ScanDataManagement[] = [];
    const scanDataListDisplay: Ref<ScanDataManagement[]> = ref([]);
    const titleParam = i18n.t("continue.job_list");
    const backUrlParam = "/home";
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      getScanDataList();
    });
    bridge.register("refreshJobs", () => {
      getScanDataList();
    });
    const getScanDataList = () => {
      showLoading($q);
      bridge.call("fetchProfile", (res: string) => {
        closeLoading($q);
        const profiles = JSON.parse(res) as ProfileMaster[];
        const profileNames = profiles.map((element) => {
          return element.profileName;
        });
        const args = {
          filterPrevalidation: false,
        };
        bridge.call("fetchTaskForDataManagement", args, (res: string) => {
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
        profileName: scanTask.profileName,
        pageType:
          scanTask.validationType == "PreValidation" ? "online" : "offline",
        fromPageName: "continueJob",
      };
      bridge.call("continueJobScan", args);
    };

    return {
      onClickScanTask,
      scanDataListDisplay,
      search,
      titleParam,
      backUrlParam,
    };
  },
});
export default MyJobsView;
</script>
<style lang="scss" scoped>
.card-item {
  padding: 10px 0 10px 15px;
}
.card-item-content {
  width: 100%;
  display: flex;
  text-align: left;
  word-break: break-word;
  justify-content: space-between;
  .card-item-left {
    flex: 4;
    .card-item-date-text {
      color: var($--card-item-date-text-color);
      margin-top: 8px;
    }
  }
  .card-item-right {
    flex: 1.2;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;
    .card-item-sub-text {
      min-width: 68px;
      padding: 2px 2px;
      text-align: center;
      background-color: #ffffff;
      font-weight: bold;
      color: #00243d;
      white-space: nowrap;
    }
  }
}
.no-record {
  text-align: center;
  width: 100%;
  color: #757575;
}
.footer-message {
  margin-top: 5px;
  text-align: center;
  width: 100%;
  color: #757575;
}
</style>

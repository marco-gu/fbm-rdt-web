<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="home" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("continue.job_list") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
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
    </div>

    <div class="content">
      <template v-if="scanDataListDisplay.length > 0">
        <div
          class="data-list-container row items-center body mb-15"
          v-for="(item, index) in scanDataListDisplay"
          :key="index"
          @click="onClickScanTask(item)"
        >
          <div style="width: 70%">
            <div style="word-break: break-all">{{ item.taskId }}</div>
            <div style="height: 8px"></div>
            <div style="color: #757575">{{ item.updateDatetime }}</div>
          </div>

          <div style="width: 20%; text-align: center">
            <q-circular-progress
              rounded
              show-value
              size="48px"
              :thickness="0.25"
              color="secondary"
              track-color="blue-2"
              :value="(item.scannedCartonNumber / item.allCartonNumber) * 100"
            >
              <div>
                {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
              </div>
            </q-circular-progress>
          </div>
          <div>
            <q-icon size="md" name="chevron_right" color="black" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="no-record">{{ $t("continue.no_record") }}</div>
      </template>
    </div>
    <div class="footer">{{ $t("continue.instruction") }}</div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useRouter } from "vue-router";

import { ScanDataManagement } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const MyJobsView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const search = ref("");

    let result: ScanDataManagement[] = [];
    const scanDataListDisplay: Ref<ScanDataManagement[]> = ref([]);
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
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
      router,
      scanDataListDisplay,
      search,
      homeIcon,
      arrowIcon,
    };
  },
});
export default MyJobsView;
</script>
<style lang="scss" scoped>
.content {
  padding: 0 20px;
}
.data-list-container {
  padding-left: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  text-align: left;
  min-height: 85px;
}

.mb-15 {
  margin-bottom: 20px;
}

.body {
  font-size: 15px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #000000;
  line-height: 18px;
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
</style>

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
    <!-- <div class="header">
      <q-toolbar class="common-toolbar">
        <q-btn flat round dense icon="arrow_back" @click="home" />
        <q-toolbar-title :shrink="false">
          {{ $t("continue.job_list") }}
        </q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="home" @click="home" />
      </q-toolbar>
      <div class="search">
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div> -->

    <template v-if="scanDataListDisplay.length > 0">
      <div
        class="data-list-container"
        v-for="(item, index) in scanDataListDisplay"
        :key="index"
      >
        <q-item clickable @click="onClickScanTask(item)">
          <q-item-section>
            <q-item-label lines="2" style="word-wrap: break-word">{{
              item.taskId
            }}</q-item-label>
            <q-item-label caption>{{ item.updateDatetime }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-circular-progress
              rounded
              show-value
              size="40px"
              :thickness="0.25"
              color="secondary"
              track-color="blue-2"
              :value="(item.scannedCartonNumber / item.allCartonNumber) * 100"
            >
              <div>
                {{ item.scannedCartonNumber }}/{{ item.allCartonNumber }}
              </div>
            </q-circular-progress>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="black" />
          </q-item-section>
        </q-item>
      </div>
    </template>
    <template v-else>
      <div class="no-record">{{ $t("continue.no_record") }}</div>
    </template>

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
// .wrapper {
//   height: 100%;
//   position: relative;
//   padding-bottom: 20px;
//   min-height: 100vh;
// }
// .header {
//   position: sticky;
//   top: 0;
//   width: 100%;
//   z-index: 1;
//   background-image: url("../assets/images/lns_bg.png");
//   background-size: cover;
//   padding-bottom: 10px;
//   .q-item {
//     height: 60px;
//     width: 100%;
//   }
//   .title-text {
//     font-size: 20px;
//   }
//   .search {
//     margin: 0 20px;
//     background-color: #ffffff;
//   }
// }
.data-list-container {
  margin: 20px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  text-align: left;

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
</style>

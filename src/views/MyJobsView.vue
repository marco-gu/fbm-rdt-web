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
                  <q-item-section>
                    <CircularProgressComponent
                      :value="
                        (item.scannedCartonNumber / item.allCartonNumber) * 100
                      "
                    >
                      <div class="card-item-sub-text">
                        {{ item.scannedCartonNumber }}/{{
                          item.allCartonNumber
                        }}
                      </div>
                    </CircularProgressComponent>
                  </q-item-section>
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
import { useRouter } from "vue-router";
import CircularProgressComponent from "@/components/CircularProgressComponent.vue";
import { ScanDataManagement } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const MyJobsView = defineComponent({
  components: {
    CircularProgressComponent,
  },
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
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
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
        profileName: scanTask.profileName,
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
  margin-top: $--page-content-margin-top-with-search;
}
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
      color: #757575;
      color: var($--card-item-date-text-color);
      margin-top: 8px;
    }
  }
  .card-item-right {
    flex: 1;
    align-self: center;
    .card-item-sub-text {
      font-weight: bold;
      color: #00243d;
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

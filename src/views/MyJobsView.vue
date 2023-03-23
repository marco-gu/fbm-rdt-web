<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="search">
        <q-input
          ref="input"
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
        >
          <template v-slot:prepend>
            <q-icon name="search" @click="onSearch" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="onClear" class="cursor-pointer" />
          </template>
        </q-input>
      </div>
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <q-pull-to-refresh @refresh="refresh">
          <template v-if="noRecord">
            <div class="no-record">{{ $t("common.no_record") }}</div>
          </template>
          <template v-if="refreshloading">
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
          <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
            <div
              v-for="(item, index) in defaultDisplay"
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
                        {{ item.scannedCartonNumber }}/{{
                          item.allCartonNumber
                        }}
                      </div>
                    </CircularProgressComponent>
                  </div>
                </div>
                <q-item-section side>
                  <q-icon name="chevron_right" color="black" />
                </q-item-section>
              </q-item>
            </div>
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </template>
          </q-infinite-scroll>
        </q-pull-to-refresh>
      </q-scroll-area>

      <div class="footer-message">{{ $t("continue.instruction") }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted } from "@vue/runtime-core";
import CircularProgressComponent from "@/components/CircularProgressComponent.vue";
import { ScanDataManagement } from "../models/profile";
import { ref, watch } from "vue";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useI18n } from "vue-i18n";
const MyJobsView = defineComponent({
  components: {
    CircularProgressComponent,
    HeaderComponent,
  },
  setup() {
    const refreshloading = ref(false);
    const search = ref();
    const i18n = useI18n();
    const defaultDisplay = ref([] as ScanDataManagement[]);
    const onSearchMode = ref(false);
    const apiIndex = ref(0);
    const searchIndex = ref(0);
    const searchResult = ref([] as ScanDataManagement[]);
    const apiResult = ref([] as ScanDataManagement[]);
    const titleParam = i18n.t("continue.job_list");
    const backUrlParam = "/home";
    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const noRecord = ref(false);
    const input = ref();
    onBeforeMount(() => {
      refreshloading.value = true;
      getScanDataList();
    });
    const onLoad = (index: any, done: any) => {
      if (onSearchMode.value) {
        const start = searchIndex.value * 10;
        const end = (searchIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (searchResult.value[i]) {
              defaultDisplay.value.push(searchResult.value[i]);
            }
          }
          if (defaultDisplay.value.length == (searchIndex.value + 1) * 10) {
            searchIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      } else {
        const start = apiIndex.value * 10;
        const end = (apiIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (apiResult.value[i]) {
              defaultDisplay.value.push(apiResult.value[i]);
            }
          }
          if (defaultDisplay.value.length == (apiIndex.value + 1) * 10) {
            apiIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      }
    };
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 40 + "px";
    });
    bridge.register("refreshJobs", () => {
      getScanDataList();
    });
    const refresh = (done: any) => {
      if (search.value && search.value.length > 0) {
        onSearch();
      } else {
        apiIndex.value = 0;
        defaultDisplay.value = [];
        searchResult.value = [];
        getScanDataList();
        myInfiniteScroll.value.resume();
      }
      done();
    };
    const getScanDataList = () => {
      bridge.call("fetchTaskForDataManagement", {}, (data: any) => {
        refreshloading.value = false;
        apiResult.value = JSON.parse(data) as ScanDataManagement[];
        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          noRecord.value = false;
          if (apiResult.value.length > 10) {
            defaultDisplay.value = apiResult.value.slice(0, 10);
            apiIndex.value++;
          } else {
            defaultDisplay.value = apiResult.value;
            myInfiniteScroll.value.stop();
          }
        }
      });
    };
    const onClear = () => {
      search.value = "";
      onSearchMode.value = false;
      if (apiResult.value.length > 0) {
        noRecord.value = false;
        if (apiResult.value.length > 10) {
          defaultDisplay.value = apiResult.value.slice(0, 10);
          apiIndex.value = 1;
          myInfiniteScroll.value.resume();
        } else {
          defaultDisplay.value = apiResult.value;
          myInfiniteScroll.value.stop();
        }
      } else {
        noRecord.value = true;
      }
      searchIndex.value = 0;
      myScrollArea.value.setScrollPosition("vertical", 0);
    };
    watch(search, () => {
      if (search.value) {
        if (search.value.length >= 4) {
          input.value.blur();
          onSearch();
        }
      } else if (search.value.length == 0) {
        onClear();
      }
    });
    const onSearch = () => {
      const args = {
        condition: search.value.toUpperCase(),
      };
      myScrollArea.value.setScrollPosition("vertical", 0);
      onSearchMode.value = true;
      defaultDisplay.value = [];
      searchResult.value = [];
      bridge.call("searchTaskForDataManagement", args, (data: any) => {
        searchResult.value = JSON.parse(data) as ScanDataManagement[];
        if (searchResult.value.length == 0) {
          noRecord.value = true;
        } else {
          noRecord.value = false;
          if (searchResult.value.length > 10) {
            defaultDisplay.value = searchResult.value.slice(0, 10);
            searchIndex.value++;
            myInfiniteScroll.value.resume();
          } else {
            defaultDisplay.value = searchResult.value;
            myInfiniteScroll.value.stop();
          }
        }
      });
    };
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
      onClear,
      onClickScanTask,
      search,
      titleParam,
      backUrlParam,
      onSearch,
      onLoad,
      myInfiniteScroll,
      noRecord,
      input,
      myScrollArea,
      refreshloading,
      defaultDisplay,
      refresh,
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
  margin-top: 10px;
  text-align: center;
  width: 100%;
  color: #757575;
}
</style>

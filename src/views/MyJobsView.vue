<template>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('continue.job_list')]"
      :icons="['search', 'back', 'home']"
      @onHome="() => router.push('/home')"
      @onBack="() => router.push('/home')"
      v-model:searchValue="search"
      @onSearch="onSearch"
    />
    <div class="page-content">
      <!-- <div class="search">
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
      </div> -->
      <template v-if="refreshloading">
        <div
          style="
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
          "
        >
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
      <!-- <q-scroll-area ref="myScrollArea" id="scroll-area"> -->
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
      >
        <template v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </template>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
          <div
            v-for="(item, index) in defaultDisplay"
            :key="index"
            @click="onClickScanTask(item)"
          >
            <div class="common-card-2">
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
            <!-- <q-item class="card-item">
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
            </q-item> -->
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-scroll-area>

      <!-- <div class="footer-message">{{ $t("continue.instruction") }}</div> -->
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted } from "@vue/runtime-core";
import { ScanDataManagement } from "../models/profile";
import { ref, watch } from "vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
const MyJobsView = defineComponent({
  components: {
    CommonHeaderComponent,
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
    const router = useRouter();
    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const noRecord = ref(false);
    const input = ref();
    onBeforeMount(() => {
      // refreshloading.value = true;
      getScanDataList();
    });
    const onLoad = (index: any, done: any) => {
      if (onSearchMode.value) {
        const start = searchIndex.value * 10;
        const end = (searchIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (
              searchResult.value[i] &&
              defaultDisplay.value.length < searchResult.value.length
            ) {
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
            if (
              apiResult.value[i] &&
              defaultDisplay.value.length < apiResult.value.length
            ) {
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
    // bridge.register("refreshJobs", () => {
    //   getScanDataList();
    // });
    const refresh = (done: any) => {
      if (search.value && search.value.length > 0) {
        onSearch();
      } else {
        apiIndex.value = 0;
        defaultDisplay.value = [];
        searchResult.value = [];
        getScanDataList();
        // myInfiniteScroll.value.resume();
      }
      done();
    };
    const getScanDataList = () => {
      bridge.call("fetchDataMgmt", {}, (data: any) => {
        // bridge.call("fetchTaskForDataManagement", {}, (data: any) => {
        refreshloading.value = false;
        apiResult.value = JSON.parse(data) as ScanDataManagement[];

        const deepCopyRef = ref(apiResult.value.map((item) => item));

        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          noRecord.value = false;
          if (apiResult.value.length > 10) {
            defaultDisplay.value = deepCopyRef.value.slice(0, 10);
            apiIndex.value++;
          } else {
            defaultDisplay.value = deepCopyRef.value;
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
      console.log(search.value);
      if (search.value) {
        console.log(search.value);
        if (search.value.length >= 4) {
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
        console.log(searchResult.value);
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
        taskID: scanTask.taskID,
        type: scanTask.scanType,
        profileName: scanTask.profileName,
        pageType:
          scanTask.validationType == "PreValidation" ? "online" : "offline",
        fromPageName: "continueJob",
      };
      bridge.call("continueJobScan", args);
      router.push("/nativeBridge");
    };
    return {
      onClear,
      onClickScanTask,
      search,
      onSearch,
      onLoad,
      myInfiniteScroll,
      noRecord,
      input,
      myScrollArea,
      refreshloading,
      defaultDisplay,
      refresh,
      router,
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

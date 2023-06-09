<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
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
      <q-scroll-area
        ref="scrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <div v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </div>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="infiniteScroll">
          <div
            v-for="(item, index) in pageView"
            :key="index"
            @click="onDetail(item)"
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
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-scroll-area>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted } from "@vue/runtime-core";
import { ref, watch } from "vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { useRouter } from "vue-router";
import { setContentHeight } from "@/utils/screen.util";
import { DataMgmt } from "@/models/data.management";
import { PAGESIZE } from "@/models/constant";
import LoadingComponent from "@/components/LoadingComponent.vue";
const MyJobsView = defineComponent({
  components: {
    CommonHeaderComponent,
    LoadingComponent,
  },
  setup() {
    const search = ref();
    const pageView = ref([] as DataMgmt[]);
    const apiResult = ref([] as DataMgmt[]);
    const searchResult = ref([] as DataMgmt[]);
    const router = useRouter();
    const noRecord = ref(false);
    const input = ref();
    const loadingStatus = ref(false);
    const apiPageNumber = ref(0);
    const searchPageNumber = ref(0);
    const infiniteScroll = ref();
    const scrollArea = ref();
    const searchMode = ref(false);
    const pageInit = ref(false);
    bridge.register("returnContinueJobs", () => {
      setContentHeight("scroll-area");
      loadingStatus.value = true;
      setTimeout(() => {
        getData();
      }, 200);
    });
    onMounted(() => {
      setContentHeight("scroll-area");
      loadingStatus.value = true;
      setTimeout(() => {
        getData();
      }, 200);
    });
    const onDetail = (scanTask: any) => {
      const args = {
        taskID: scanTask.taskID,
        type: scanTask.scanType,
        profileName: scanTask.profileName,
        pageType:
          scanTask.validationType == "PreValidation" ? "online" : "offline",
        fromPageName: "continueJob",
      };
      bridge.call("continueJobScan", args);
      // router.push("/nativeBridge");
    };
    const onLoad = (index: any, done: any) => {
      if (searchMode.value) {
        if (
          searchResult.value.length >
          (searchPageNumber.value + 1) * PAGESIZE
        ) {
          const index = apiPageNumber.value + 1;
          pageView.value = searchResult.value.slice(0, index * PAGESIZE);
          searchPageNumber.value++;
        } else {
          pageView.value = searchResult.value.slice(
            0,
            searchResult.value.length
          );
          infiniteScroll.value.stop();
        }
        done();
      } else {
        if (!pageInit.value) {
          if (apiResult.value.length > (apiPageNumber.value + 1) * PAGESIZE) {
            const index = apiPageNumber.value + 1;
            pageView.value = apiResult.value.slice(0, index * PAGESIZE);
            apiPageNumber.value++;
          } else {
            pageView.value = apiResult.value.slice(0, apiResult.value.length);
            infiniteScroll.value.stop();
          }
          done();
        } else {
          pageInit.value = false;
        }
        done();
      }
    };
    watch(search, () => {
      if (search.value.length > 0) {
        onSearch();
      } else {
        onClear();
      }
    });
    const onClear = () => {
      search.value = "";
      searchMode.value = false;
      scrollArea.value.setScrollPosition("vertical", 0);
      processData();
    };
    const onSearch = () => {
      searchMode.value = true;
      searchPageNumber.value = 0;
      if (apiResult.value.length > 0) {
        scrollArea.value.setScrollPosition("vertical", 0);
        searchResult.value = apiResult.value.filter((item) => {
          if (item.po) {
            return (
              item.so.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ||
              item.po.toLowerCase().indexOf(search.value.toLowerCase()) > -1
            );
          } else {
            return (
              item.so.toLowerCase().indexOf(search.value.toLowerCase()) > -1
            );
          }
        });
        if (searchResult.value.length > 0) {
          noRecord.value = false;
          if (searchResult.value.length > PAGESIZE) {
            pageView.value = searchResult.value.slice(0, PAGESIZE);
            searchPageNumber.value++;
            infiniteScroll.value.resume();
          } else {
            pageView.value = searchResult.value;
            infiniteScroll.value.stop();
          }
        } else {
          noRecord.value = true;
          pageView.value = [];
        }
      } else {
        noRecord.value = true;
        pageView.value = [];
      }
    };
    const getData = () => {
      bridge.call("fetchDataMgmt", {}, (data: any) => {
        loadingStatus.value = false;
        apiResult.value = JSON.parse(data) as DataMgmt[];
        processData();
      });
    };
    const processData = () => {
      if (apiResult.value.length == 0) {
        noRecord.value = true;
        pageView.value = [];
      } else {
        pageInit.value = true;
        if (apiResult.value.length > PAGESIZE) {
          pageView.value = apiResult.value.slice(0, PAGESIZE);
          apiPageNumber.value++;
          infiniteScroll.value.resume();
        } else {
          pageView.value = apiResult.value;
          infiniteScroll.value.stop();
        }
      }
    };
    return {
      onClear,
      onDetail,
      search,
      onSearch,
      onLoad,
      infiniteScroll,
      noRecord,
      input,
      scrollArea,
      router,
      loadingStatus,
      pageView,
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

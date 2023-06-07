<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('lp.lp_files')]"
      :icons="['back', 'search', 'home']"
      @onHome="() => router.push('/home')"
      v-model:searchValue="search"
      @onBack="back"
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
          <!-- <q-pull-to-refresh @refresh="refresh"> -->
          <div
            v-for="(item, index) in pageView"
            :key="index"
            @click="onDetail(item)"
          >
            <div class="common-card-2">
              <div class="label mb-lg">
                {{ item.profileName
                }}<span class="separator">&nbsp;|&nbsp;</span>{{ item.so }}
                <span class="separator">&nbsp;|&nbsp;</span>{{ item.scanType }}
              </div>
              <div class="value">
                {{ item.po
                }}<span
                  v-show="item.po != '' && item.po != null"
                  class="separator"
                  >&nbsp;|&nbsp;</span
                >{{ item.sku
                }}<span
                  v-show="item.sku != '' && item.sku != null"
                  class="separator"
                  >&nbsp;|&nbsp;</span
                >{{ $t("lp.total") }}: {{ item.allCartonNumber }}
              </div>
              <div class="value mt-sm mb-lg">
                {{ item.createDatetime }}
              </div>
            </div>
          </div>
          <!-- </q-pull-to-refresh> -->
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
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { TaskLPList } from "../models/profile";
import { useI18n } from "vue-i18n";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import { setContentHeight } from "@/utils/screen.util";
import { PAGESIZE } from "@/models/constant";
import { useStore } from "@/store";
const LPListView = defineComponent({
  components: {
    CommonHeaderComponent,
    LoadingComponent,
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    const titleParam = i18n.t("lp.lp_list");
    const route = useRoute();
    const search = ref("");
    const store = useStore();
    // const input = ref();
    const apiResult = ref([] as TaskLPList[]);
    const pageView = ref([] as TaskLPList[]);
    const searchResult = ref([] as TaskLPList[]);
    // const taskListDisplay = ref([] as TaskLPList[]);
    // const taskListSearchResult = ref([] as TaskLPList[]);
    // const taskListInitResult = ref([] as TaskLPList[]);
    const scrollArea = ref();
    const pageInit = ref(false);
    const noRecord = ref(false);
    // const retrieveIndex = ref(0);
    // const searchIndex = ref(0);
    // const onSearchMode = ref(false);
    // const pageSlice = 10;
    const loadingStatus = ref(false);
    const apiPageNumber = ref(0);
    const infiniteScroll = ref();
    const searchMode = ref(false);
    const searchPageNumber = ref(0);
    onMounted(() => {
      setContentHeight("scroll-area");
      if (route.params.from) {
        apiResult.value = store.state.lpModule.taskLpList;
        processData();
      } else {
        loadingStatus.value = true;
        setTimeout(() => {
          getData();
        }, 200);
      }
    });
    const onDetail = (item: any) => {
      store.dispatch("lpModule/saveTaskLps", apiResult).then(() => {
        router.push({
          path: "/lpDetailList",
          query: {
            taskId: item.taskId,
            profileName: item.profileName,
            so: item.so,
          },
        });
      });
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
    // onBeforeMount(() => {
    //   loadingStatus.value = true;
    //   bridge.call("fetchTaskForLPList", null, (res: string) => {
    //     loadingStatus.value = false;
    //     composeTaskListResult(res);
    //   });
    // });
    // onMounted(() => {
    //   const deviceHeight = window.innerHeight;
    //   const scrollArea = document.getElementById("scroll-area") as any;
    //   scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
    // });
    // const composeTaskListResult = (res: string) => {
    //   taskListInitResult.value = JSON.parse(res) as TaskLPList[];
    //   //sortTaskList(taskListInitResult.value);
    //   if (taskListInitResult.value.length == 0) {
    //     noRecord.value = true;
    //   } else {
    //     noRecord.value = false;
    //     if (taskListInitResult.value.length > pageSlice) {
    //       taskListDisplay.value = taskListInitResult.value.slice(0, pageSlice);
    //       retrieveIndex.value++;
    //     } else {
    //       taskListDisplay.value = taskListInitResult.value;
    //       myInfiniteScroll.value.stop();
    //     }
    //   }
    // };
    // const composeTaskListSearchResult = (res: string) => {
    //   taskListSearchResult.value = JSON.parse(res) as TaskLPList[];
    //   //sortTaskList(taskListSearchResult.value);
    //   if (taskListSearchResult.value.length == 0) {
    //     noRecord.value = true;
    //   } else {
    //     noRecord.value = false;
    //     if (taskListSearchResult.value.length > pageSlice) {
    //       taskListDisplay.value = taskListSearchResult.value.slice(
    //         0,
    //         pageSlice
    //       );
    //       searchIndex.value++;
    //       myInfiniteScroll.value.resume();
    //     } else {
    //       taskListDisplay.value = taskListSearchResult.value;
    //       myInfiniteScroll.value.stop();
    //     }
    //   }
    // };
    // const refresh = (done: any) => {
    //   loadingStatus.value = true;
    //   myInfiniteScroll.value.resume();
    //   if (onSearchMode.value) {
    //     searchIndex.value = 0;
    //     const args = {
    //       searchCondition: search.value.toUpperCase(),
    //     };
    //     bridge.call("searchTaskForLPList", args, (res: string) => {
    //       composeTaskListSearchResult(res);
    //       loadingStatus.value = false;
    //       done();
    //     });
    //   } else {
    //     retrieveIndex.value = 0;
    //     bridge.call("fetchTaskForLPList", null, (res: string) => {
    //       composeTaskListResult(res);
    //       loadingStatus.value = false;
    //       done();
    //     });
    //   }
    // };
    // const onLoad = (index: any, done: any) => {
    //   if (!loadingStatus.value) {
    //     if (onSearchMode.value) {
    //       const start = searchIndex.value * pageSlice;
    //       const end = (searchIndex.value + 1) * pageSlice;
    //       setTimeout(() => {
    //         for (let i = start; i < end; i++) {
    //           if (taskListSearchResult.value[i]) {
    //             taskListDisplay.value.push(taskListSearchResult.value[i]);
    //           }
    //         }
    //         if (
    //           taskListDisplay.value.length ==
    //           (searchIndex.value + 1) * pageSlice
    //         ) {
    //           searchIndex.value++;
    //         } else {
    //           myInfiniteScroll.value.stop();
    //         }
    //         done();
    //       }, 200);
    //     } else {
    //       const start = retrieveIndex.value * pageSlice;
    //       const end = (retrieveIndex.value + 1) * pageSlice;
    //       setTimeout(() => {
    //         for (let i = start; i < end; i++) {
    //           if (taskListInitResult.value[i]) {
    //             taskListDisplay.value.push(taskListInitResult.value[i]);
    //           }
    //         }
    //         if (
    //           taskListDisplay.value.length ==
    //           (retrieveIndex.value + 1) * pageSlice
    //         ) {
    //           retrieveIndex.value++;
    //         } else {
    //           myInfiniteScroll.value.stop();
    //         }
    //         done();
    //       }, 200);
    //     }
    //   }
    // };
    // watch(search, () => {
    //   if (search.value) {
    //     if (search.value.length >= 4) {
    //       //input.value.blur();
    //       onSearch();
    //     }
    //   } else if (search.value.length == 0) {
    //     onClear();
    //   }
    // });
    // const onSearch = () => {
    //   scrollArea.value.setScrollPosition("vertical", 0);
    //   onSearchMode.value = true;
    //   taskListDisplay.value = [];
    //   taskListSearchResult.value = [];
    //   const args = {
    //     searchCondition: search.value.toUpperCase(),
    //   };
    //   bridge.call("searchTaskForLPList", args, (res: string) => {
    //     composeTaskListSearchResult(res);
    //   });
    // };
    // const onClear = () => {
    //   search.value = "";
    //   input.value = "";
    //   onSearchMode.value = false;
    //   searchIndex.value = 0;
    //   if (taskListInitResult.value.length > 0) {
    //     noRecord.value = false;
    //     if (taskListInitResult.value.length > 10) {
    //       taskListDisplay.value = taskListInitResult.value.slice(0, pageSlice);
    //       retrieveIndex.value = 1;
    //       myInfiniteScroll.value.resume();
    //     } else {
    //       taskListDisplay.value = taskListInitResult.value;
    //       myInfiniteScroll.value.stop();
    //     }
    //   } else {
    //     noRecord.value = true;
    //   }
    //   scrollArea.value.setScrollPosition("vertical", 0);
    // };
    // const sortTaskList = (taskList: any[]) => {
    //   taskList.sort((a: any, b: any) => {
    //     return b.updateDatetime.localeCompare(a.updateDatetime);
    //   });
    // };
    // const onClickItem = (item: any) => {
    //   router.push({
    //     path: "/lpDetailList",
    //     query: {
    //       taskId: item.taskId,
    //       profileName: item.profileName,
    //       so: item.so,
    //     },
    //   });
    // };
    const getData = () => {
      bridge.call("fetchTaskForLPList", {}, (data: any) => {
        loadingStatus.value = false;
        apiResult.value = JSON.parse(data) as TaskLPList[];
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
    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };
    return {
      back,
      // input,
      scrollArea,
      noRecord,
      // refresh,
      search,
      // taskListDisplay,
      titleParam,
      onClear,
      onDetail,
      onLoad,
      onSearch,
      loadingStatus,
      router,
      infiniteScroll,
      pageView,
    };
  },
});
export default LPListView;
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
  .card-item-date-text {
    color: $--card-item-date-text-color;
  }
  .card-item-labels {
    width: 100%;
    text-align: left;
  }
}
</style>

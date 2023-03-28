<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component>
    <div class="page-content">
      <div class="search" id="search">
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
      <template v-if="loading">
        <!-- <div class="row justify-center q-my-md"> -->
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
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <q-pull-to-refresh @refresh="refresh">
          <template v-if="noRecord">
            <div class="no-record">{{ $t("common.no_record") }}</div>
          </template>
          <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
            <div
              v-for="(item, index) in taskListDisplay"
              :key="index"
              @click="onClickItem(item)"
            >
              <q-item class="card-item">
                <div class="card-item-content">
                  <q-item-section class="card-item-labels">
                    <div class="card-item-label-content">
                      <q-item-label>{{ item.taskId }}</q-item-label>
                      <q-item-label
                        >{{ $t("lp.total") }}:
                        {{ item.allCartonNumber }}</q-item-label
                      >
                      <q-item-label class="card-item-date-text">{{
                        item.updateDatetime
                      }}</q-item-label>
                    </div>
                  </q-item-section>
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
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, ref, watch, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { TaskLPList } from "../models/profile";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useI18n } from "vue-i18n";
const LPListView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    const titleParam = i18n.t("lp.lp_list");
    const search = ref("");
    const input = ref();
    const taskListDisplay = ref([] as TaskLPList[]);
    const taskListSearchResult = ref([] as TaskLPList[]);
    const taskListInitResult = ref([] as TaskLPList[]);
    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const loading = ref(false);
    const noRecord = ref(false);
    const retrieveIndex = ref(0);
    const searchIndex = ref(0);
    const onSearchMode = ref(false);
    const pageSlice = 10;
    onBeforeMount(() => {
      // loading.value = true;
      bridge.call("fetchTaskForLPList", null, (res: string) => {
        loading.value = false;
        composeTaskListResult(res);
      });
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
    });
    const composeTaskListResult = (res: string) => {
      taskListInitResult.value = JSON.parse(res) as TaskLPList[];
      sortTaskList(taskListInitResult.value);
      if (taskListInitResult.value.length == 0) {
        noRecord.value = true;
      } else {
        noRecord.value = false;
        if (taskListInitResult.value.length > pageSlice) {
          taskListDisplay.value = taskListInitResult.value.slice(0, pageSlice);
          retrieveIndex.value++;
        } else {
          taskListDisplay.value = taskListInitResult.value;
          myInfiniteScroll.value.stop();
        }
      }
    };
    const composeTaskListSearchResult = (res: string) => {
      taskListSearchResult.value = JSON.parse(res) as TaskLPList[];
      sortTaskList(taskListSearchResult.value);
      if (taskListSearchResult.value.length == 0) {
        noRecord.value = true;
      } else {
        noRecord.value = false;
        if (taskListSearchResult.value.length > pageSlice) {
          taskListDisplay.value = taskListSearchResult.value.slice(
            0,
            pageSlice
          );
          searchIndex.value++;
          myInfiniteScroll.value.resume();
        } else {
          taskListDisplay.value = taskListSearchResult.value;
          myInfiniteScroll.value.stop();
        }
      }
    };
    const refresh = (done: any) => {
      myInfiniteScroll.value.resume();
      if (onSearchMode.value) {
        searchIndex.value = 0;
        const args = {
          searchCondition: search.value.toUpperCase(),
        };
        bridge.call("searchTaskForLPList", args, (res: string) => {
          composeTaskListSearchResult(res);
          done();
        });
      } else {
        retrieveIndex.value = 0;
        bridge.call("fetchTaskForLPList", null, (res: string) => {
          composeTaskListResult(res);
          done();
        });
      }
    };
    const onLoad = (index: any, done: any) => {
      if (onSearchMode.value) {
        const start = searchIndex.value * pageSlice;
        const end = (searchIndex.value + 1) * pageSlice;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (taskListSearchResult.value[i]) {
              taskListDisplay.value.push(taskListSearchResult.value[i]);
            }
          }
          if (
            taskListDisplay.value.length ==
            (searchIndex.value + 1) * pageSlice
          ) {
            searchIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      } else {
        const start = retrieveIndex.value * pageSlice;
        const end = (retrieveIndex.value + 1) * pageSlice;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (taskListInitResult.value[i]) {
              taskListDisplay.value.push(taskListInitResult.value[i]);
            }
          }
          if (
            taskListDisplay.value.length ==
            (retrieveIndex.value + 1) * pageSlice
          ) {
            retrieveIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      }
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
      myScrollArea.value.setScrollPosition("vertical", 0);
      onSearchMode.value = true;
      taskListDisplay.value = [];
      taskListSearchResult.value = [];

      const args = {
        searchCondition: search.value.toUpperCase(),
      };
      bridge.call("searchTaskForLPList", args, (res: string) => {
        composeTaskListSearchResult(res);
      });
    };
    const onClear = () => {
      search.value = "";
      input.value = "";
      onSearchMode.value = false;
      searchIndex.value = 0;
      if (taskListInitResult.value.length > 0) {
        noRecord.value = false;
        if (taskListInitResult.value.length > 10) {
          taskListDisplay.value = taskListInitResult.value.slice(0, pageSlice);
          retrieveIndex.value = 1;
          myInfiniteScroll.value.resume();
        } else {
          taskListDisplay.value = taskListInitResult.value;
          myInfiniteScroll.value.stop();
        }
      } else {
        noRecord.value = true;
      }
      myScrollArea.value.setScrollPosition("vertical", 0);
    };
    const sortTaskList = (taskList: any[]) => {
      taskList.sort((a: any, b: any) => {
        return b.updateDatetime.localeCompare(a.updateDatetime);
      });
    };
    const onClickItem = (item: any) => {
      router.push({
        path: "/lpDetailList",
        query: {
          taskId: item.taskId,
        },
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
    return {
      back,
      input,
      loading,
      myInfiniteScroll,
      myScrollArea,
      noRecord,
      refresh,
      search,
      taskListDisplay,
      titleParam,
      onClear,
      onClickItem,
      onLoad,
      onSearch,
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

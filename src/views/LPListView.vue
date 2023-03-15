<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
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
            <q-icon name="search" @click="onSearch" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="onClear" class="cursor-pointer" />
          </template>
        </q-input>
      </div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-pull-to-refresh @refresh="refresh">
          <template v-if="taskListDisplay.length > 0">
            <q-infinite-scroll
              @load="onLoad"
              :offset="50"
              ref="myInfiniteScroll"
            >
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
            </q-infinite-scroll>
          </template>
          <template v-else>
            <div class="no-record">{{ $t("common.no_record") }}</div>
          </template>
        </q-pull-to-refresh>
      </q-scroll-area>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, ref, onBeforeMount } from "vue";
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
    const taskListDisplay = ref([] as TaskLPList[]);
    const taskListSearchResult = ref([] as TaskLPList[]);
    const taskListInitResult = ref([] as TaskLPList[]);
    const myInfiniteScroll = ref();
    const defaultPageLimit = ref(10);
    const defaultPageOffset = ref(0);
    onBeforeMount(() => {
      const args = {
        pageLimit: defaultPageLimit.value,
        pageOffset: defaultPageOffset.value,
      };
      bridge.call("fetchTaskForLPList", args, (res: string) => {
        taskListInitResult.value = JSON.parse(res) as TaskLPList[];
        taskListDisplay.value = taskListInitResult.value;
        sortScanDataList(taskListDisplay.value);
      });
    });
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
    });
    const refresh = (done: any) => {
      const args = {
        pageLimit: defaultPageLimit.value,
        pageOffset: defaultPageOffset.value,
      };
      bridge.call("fetchTaskForLPList", args, (res: string) => {
        taskListInitResult.value = JSON.parse(res) as TaskLPList[];
        taskListDisplay.value = taskListInitResult.value;
        sortScanDataList(taskListDisplay.value);
        done();
      });
    };
    const onLoad = (index: any, done: any) => {
      const args = {
        pageLimit: defaultPageLimit.value,
        pageOffset: taskListInitResult.value.length,
      };
      bridge.call("fetchTaskForLPList", args, (res: string) => {
        const result = JSON.parse(res) as TaskLPList[];
        result.forEach((taskList) => {
          taskListInitResult.value.push(taskList);
        });
        taskListDisplay.value = taskListInitResult.value;
        sortScanDataList(taskListDisplay.value);
        done();
      });
    };
    const onSearch = () => {
      const args = {
        taskId: search.value,
      };
      bridge.call("searchTaskForLPList", args, (res: string) => {
        taskListSearchResult.value = JSON.parse(res) as TaskLPList[];
        taskListDisplay.value = taskListSearchResult.value;
        sortScanDataList(taskListDisplay.value);
        myInfiniteScroll.value.stop();
      });
    };
    const onClear = () => {
      search.value = "";
      taskListDisplay.value = taskListInitResult.value;
    };
    const sortScanDataList = (taskListDisplay: any[]) => {
      taskListDisplay.sort((a: any, b: any) => {
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
      myInfiniteScroll,
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

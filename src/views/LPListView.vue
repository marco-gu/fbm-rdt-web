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
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-pull-to-refresh @refresh="refresh">
          <template v-if="taskListDisplay.length > 0">
            <div
              v-for="(item, index) in taskListDisplay"
              :key="index"
              @click="onClickItem(item)"
            >
              <q-item class="card-item">
                <div>
                  <q-item-section class="card-item-labels">
                    <div class="card-item-label-content">
                      <q-item-label>{{ item.taskId }}</q-item-label>
                      <q-item-label
                        >Total: {{ item.allCartonNumber }}</q-item-label
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
          </template>
          <template v-else>
            <div class="no-record">{{ $t("continue.no_record") }}</div>
          </template>
        </q-pull-to-refresh>
      </q-scroll-area>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ScanDataManagement } from "../models/profile";
import { ProfileMaster } from "../models/profile";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useI18n } from "vue-i18n";
const LPListView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const router = useRouter();
    let result: ScanDataManagement[] = [];
    const taskListDisplay: Ref<ScanDataManagement[]> = ref([]);
    const search = ref("");
    const i18n = useI18n();
    const titleParam = i18n.t("lp.lp_list");
    const refresh = (done: any) => {
      getTaskList();
      done();
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
    const getTaskList = () => {
      bridge.call("fetchProfile", (res: string) => {
        const profiles = JSON.parse(res) as ProfileMaster[];
        var profileNames = profiles.map((element) => {
          return element.profileName;
        });

        bridge.call("fetchTaskForDataManagement", null, (res: string) => {
          result = JSON.parse(res) as ScanDataManagement[];
          result = result.filter((item) =>
            profileNames?.includes(item.profileName)
          );
          taskListDisplay.value = result;
          sortScanDataList(taskListDisplay.value);
        });
      });
    };
    const sortScanDataList = (scanDataListDisplay: any[]) => {
      scanDataListDisplay.sort((a: any, b: any) => {
        return b.updateDatetime.localeCompare(a.updateDatetime);
      });
    };
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      getTaskList();
    });
    watch(search, () => {
      if (search.value) {
        const filteredResult = result.filter(
          (item) =>
            item.taskId.toLowerCase().indexOf(search.value.toLowerCase()) > -1
        );
        taskListDisplay.value = filteredResult;
      } else {
        taskListDisplay.value = result;
      }
    });
    return {
      refresh,
      onClickItem,
      taskListDisplay,
      search,
      back,
      titleParam,
    };
  },
});
export default LPListView;
</script>
<style lang="scss" scoped>
.card-item {
  padding: 10px 0 10px 15px;
}
.card-item {
  text-align: left;
  word-break: break-all;
  .card-item-label-content {
    width: 75%;
  }
  .card-item-date-text {
    color: $--card-item-date-text-color;
  }
}
</style>

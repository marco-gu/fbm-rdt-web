<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">LP List</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
    </div>
    <q-separator color="grey-5" />

    <div class="search q-pa-sm">
      <q-input v-model="search" outlined dense placeholder="Search" clearable>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div>
      <q-pull-to-refresh @refresh="refresh">
        <q-list v-for="(item, index) in taskListDisplay" :key="index">
          <q-item clickable @click="onClickItem(item)">
            <q-item-section>
              <q-item-label>{{ item.taskId }}</q-item-label>
              <q-item-label caption>{{ item.createDatetime }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-circular-progress show-value size="50px" :value="100">
                <div style="color: black">
                  {{ item.expectedCartonNumber }}
                </div></q-circular-progress
              >
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </q-item>
          <q-separator spaced inset />
        </q-list>
      </q-pull-to-refresh>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { LP } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";

const LPListView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

    let result: LP[] = [];
    const taskListDisplay: Ref<LP[]> = ref([]);
    const search = ref("");
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
      bridge.call("fetchTask", null, (res: string) => {
        result = JSON.parse(res) as LP[];
        taskListDisplay.value = JSON.parse(res) as LP[];
      });
    };

    onMounted(() => {
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
      router,
      refresh,
      onClickItem,
      taskListDisplay,
      search,
      back,
    };
  },
});
export default LPListView;
</script>
<style lang="scss" scoped>
.wrapper {
  // background-color: #e5e5e5;
  height: 100vh;
  .header {
    display: flex;
    background: #fff;
    justify-content: space-around;
    height: 60px;
    align-items: center;
  }
  .search {
    background: #fff;
    height: 60px;
    width: 100%;
  }
  .q-item {
    background-color: #fff;
    text-align: left;
    width: 100%;
  }
}
</style>

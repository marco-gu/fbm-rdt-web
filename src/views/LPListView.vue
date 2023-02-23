<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("lp.lp_list") }}
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
                        >Total: {{ item.expectedCartonNumber }}</q-item-label
                      >
                      <q-item-label class="card-item-date-text">{{
                        item.finalDatetime
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
import { LP } from "../models/profile";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const LPListView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    let result: LP[] = [];
    const taskListDisplay: Ref<LP[]> = ref([]);
    const search = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
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
      bridge.call("fetchLPTasks", null, (res: string) => {
        result = JSON.parse(res) as LP[];
        taskListDisplay.value = JSON.parse(res) as LP[];
        taskListDisplay.value.sort((a, b) =>
          b.finalDatetime.localeCompare(a.finalDatetime)
        );
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
      router,
      refresh,
      onClickItem,
      taskListDisplay,
      search,
      back,
      homeIcon,
      arrowIcon,
    };
  },
});
export default LPListView;
</script>
<style lang="scss" scoped>
.content {
  margin-top: $--page-content-margin-top-with-search;
}
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
    color: #757575;
  }
}
</style>

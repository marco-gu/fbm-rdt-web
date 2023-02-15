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

    <q-pull-to-refresh @refresh="refresh">
      <div class="content">
        <template v-if="taskListDisplay.length > 0">
          <div
            class="data-list-container row items-center body mb-15"
            v-for="(item, index) in taskListDisplay"
            :key="index"
            @click="onClickItem(item)"
          >
            <div class="column" style="width: 90%">
              <div style="word-wrap: break-word">
                {{ item.taskId }}
              </div>
              <div style="height: 4px"></div>
              <div>Total: {{ item.expectedCartonNumber }}</div>
              <div style="height: 4px"></div>
              <div style="color: #757575">{{ item.finalDatetime }}</div>
            </div>
            <div style="width: 10%">
              <q-icon size="md" name="chevron_right" color="grey" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="no-record">{{ $t("continue.no_record") }}</div>
        </template>
      </div>
    </q-pull-to-refresh>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { LP } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";
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
    const i18n = useI18n();
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

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
  padding: 0 20px;
}

.data-list-container {
  padding-left: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  text-align: left;
  min-height: 64px;
}

.body {
  font-size: 15px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #000000;
  line-height: 18px;
}

.mb-15 {
  margin-bottom: 20px;
}
.no-record {
  text-align: center;
  width: 100%;
  color: #757575;
}
.q-item {
  text-align: left;
  width: 100%;
}
</style>

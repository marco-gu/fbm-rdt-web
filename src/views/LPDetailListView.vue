<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("lp.lp_detail_list") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="content">
      <div class="taskIdHeader">
        {{ taskId }}
      </div>
      <div>
        <div
          class="data-list-container row items-center body mb-15"
          v-for="(item, index) in filterList"
          :key="index"
          @click="onClickItem(item)"
        >
          <div>CID: {{ item.cartonId }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";

import { computed, defineComponent, onMounted, Ref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Carton } from "../models/profile";

import { useI18n } from "@/plugin/i18nPlugins";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const LPDetailListView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    const taskId = ref(route.query.taskId);
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

    const lpListDisplay: Ref<Carton[]> = ref([]);

    const back = () => {
      router.push({
        path: "/lpList",
      });
    };

    const getLPListByTaskId = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      bridge.call("fetchLPByTaskId", args, (res: string) => {
        lpListDisplay.value = JSON.parse(res) as Carton[];
      });
    };

    const filterList = computed(() =>
      lpListDisplay.value.filter((item) => item.expected == true)
    );

    onMounted(() => {
      if (typeof taskId.value === "string") {
        getLPListByTaskId(taskId.value);
      }
    });

    return {
      router,
      lpListDisplay,
      filterList,
      back,
      taskId,
      homeIcon,
      arrowIcon,
    };
  },
});
export default LPDetailListView;
</script>
<style lang="scss" scoped>
.content {
  padding: 0 20px;
  margin-top: 26px;
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

.mb-15 {
  margin-bottom: 20px;
}
.taskIdHeader {
  margin-bottom: 23px;
  background-color: #00243d;
  padding: 6px 15px;
  font-size: 18px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #ffffff;
  line-height: 22px;
  border-radius: 5px 5px 5px 5px;
  word-break: break-all;
}
</style>

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
      <div class="card-sub-title">
        {{ taskId }}
      </div>
    </div>
    <div class="content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div
          class="card-item"
          v-for="(item, index) in filterList"
          :key="index"
          @click="onClickItem(item)"
        >
          <div>CID: {{ item.cartonId }}</div>
        </div>
      </q-scroll-area>
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
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
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
  margin-top: $--page-content-margin-top-with-subtitle;
}
.card-item {
  text-align: left;
}
</style>

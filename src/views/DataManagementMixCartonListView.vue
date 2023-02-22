<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("dataManagement.mix_title") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>

    <div class="content">
      <div class="taskIdHeader">{{ taskId }}+Mix</div>
      <div
        class="data-list-container row items-center body mb-15"
        v-for="(item, index) in mixCartonListDisplay"
        :key="index"
        @click="onClickMixCarton(item)"
      >
        <div class="column" style="width: 90%">
          <div>UPC: {{ item.upc }}</div>
          <div style="height: 8px"></div>
          <div>QTY: {{ item.quantity }}</div>
        </div>
        <div style="width: 10%">
          <q-icon size="md" name="chevron_right" color="grey" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
// import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { MixCartonProduct } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";

const DataManagementMixCartonListView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    // const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const taskId = ref(route.query.taskId);
    const cartonId = ref(route.query.cartonId);
    const mixCartonListDisplay: Ref<MixCartonProduct[]> = ref([]);
    const pageTitle = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    onMounted(() => {
      getMixCartonList();
    });
    const getMixCartonList = () => {
      const args = {
        taskId: taskId.value,
        cartonId: cartonId.value,
      };
      bridge.call("fetchCartonProducts", args, (res: string) => {
        mixCartonListDisplay.value = JSON.parse(res) as MixCartonProduct[];
      });
    };
    const back = () => {
      router.push({
        path: "/dataMgmtGDEdit",
        query: {
          taskId: taskId.value,
          pageType: "Detail",
        },
      });
    };
    const onClickMixCarton = (mixCarton: MixCartonProduct) => {
      localStorage.setItem("mixCartonProduct", JSON.stringify(mixCarton));
      router.push({
        path: "/dataManagementMixCarton",
        query: {
          taskId: taskId.value,
          cartonId: cartonId.value,
          lpId: mixCarton.lpId,
        },
      });
    };
    return {
      back,
      mixCartonListDisplay,
      onClickMixCarton,
      pageTitle,
      router,
      taskId,
      homeIcon,
      arrowIcon,
    };
  },
});
export default DataManagementMixCartonListView;
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
.q-item {
  background-color: #ffffff;
  height: 60px;
  width: 100%;
}
</style>

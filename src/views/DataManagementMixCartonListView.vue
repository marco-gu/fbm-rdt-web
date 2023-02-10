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
    <div class="task-id">
      <span>{{ taskId }}</span>
    </div>
    <div class="mix-carton-header row">
      <div class="col-4">UPC</div>
      <div class="col-4">QTY</div>
    </div>
    <div class="mix-carton-list-container">
      <q-list v-for="(item, index) in mixCartonListDisplay" :key="index">
        <q-item clickable @click="onClickMixCarton(item)">
          <q-item-section class="col-4">
            <q-item-label>{{ item.upc }}</q-item-label>
          </q-item-section>
          <q-item-section class="col-4">
            <q-item-label>{{ item.quantity }}</q-item-label>
          </q-item-section>
          <q-item-section side class="col-3">
            <q-icon name="chevron_right" color="black" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useI18n } from "@/plugin/i18nPlugins";
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
    const i18n = useI18n();
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
.wrapper {
  height: 100%;
  position: relative;
  padding-bottom: 20px;
  min-height: 100vh;
}
.header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1;
  background-image: url("../assets/images/lns_bg.png");
  background-size: cover;
  padding-bottom: 10px;
  .q-item {
    height: 60px;
    width: 100%;
  }
  .title-text {
    font-size: 20px;
  }
  .search {
    margin: 0 20px;
    background-color: #ffffff;
  }
}
.q-item {
  background-color: #ffffff;
  height: 60px;
  width: 100%;
}
</style>

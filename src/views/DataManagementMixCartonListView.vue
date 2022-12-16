<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Data Management</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <div class="task-id">
        <span>{{ taskId }}</span>
      </div>
      <div class="mix-carton-header row">
        <div class="col-4">UPC</div>
        <div class="col-4">QTY</div>
      </div>
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
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
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
      router,
      back,
      taskId,
      onClickMixCarton,
      mixCartonListDisplay,
    };
  },
});
export default DataManagementMixCartonListView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  position: relative;
  .header {
    display: sticky;
    top: 0;
    width: 100%;
    background-color: #ffffff;
    z-index: 1;
    .task-id {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      background: #00243d;
      color: #fff;
    }
    .mix-carton-header {
      align-items: center;
      height: 40px;
      background: #00243d;
      color: #fff;
    }
  }
  .q-item {
    background-color: #ffffff;
    height: 60px;
    width: 100%;
  }
}
</style>

<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component>
    <div class="page-content">
      <div class="sub-title-card">{{ taskId }}+Mix</div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div
          v-for="(item, index) in mixCartonListDisplay"
          :key="index"
          @click="onClickMixCarton(item)"
        >
          <q-item class="card-item">
            <div class="card-detail-left">
              <q-item-section>
                <div v-show="item.upc != ''">
                  <q-item-label>UPC: {{ item.upc }}</q-item-label>
                </div>
                <div v-show="item.quantity != ''">
                  <q-item-label>QTY: {{ item.quantity }}</q-item-label>
                </div>
              </q-item-section>
            </div>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </q-item>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useRoute, useRouter } from "vue-router";
import { MixCartonProduct } from "../models/profile";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useStore } from "@/store";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useI18n } from "vue-i18n";
const DataManagementMixCartonListView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const route = useRoute();
    const store = useStore();
    const router = useRouter();
    const taskId = ref(route.query.taskId);
    const cartonId = ref(route.query.cartonId);
    const mixCartonListDisplay: Ref<MixCartonProduct[]> = ref([]);
    const titleParam = i18n.t("dataManagement.mix_title");
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = store.state.screenModule.screenHeight
        ? store.state.screenModule.screenHeight
        : window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      getMixCartonList();
    });
    const getMixCartonList = () => {
      var scanType = "";
      if (taskId.value?.indexOf("Receiving") != -1) {
        scanType = "Receiving";
      } else {
        scanType = "Stuffing";
      }
      const args = {
        taskId: taskId.value,
        cartonId: cartonId.value,
        scanType: scanType,
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
      router,
      taskId,
      titleParam,
    };
  },
});
export default DataManagementMixCartonListView;
</script>
<style lang="scss" scoped>
.card-item {
  padding: 10px 0 10px 15px;
  .card-detail-left {
    width: 100%;
    align-self: center;
    text-align: left;
  }
}
</style>

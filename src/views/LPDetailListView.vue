<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="sub-title-card">
        <span> {{ taskId }}</span>
      </div>
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
import { useRoute } from "vue-router";
import { Carton } from "../models/profile";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
const LPDetailListView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const route = useRoute();
    const taskId = ref(route.query.taskId);
    const i18n = useI18n();
    const lpListDisplay: Ref<Carton[]> = ref([]);
    const titleParam = i18n.t("lp.lp_detail_list");
    const backUrlParam = "/lpList";
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
      lpListDisplay,
      filterList,
      taskId,
      titleParam,
      backUrlParam,
    };
  },
});
export default LPDetailListView;
</script>

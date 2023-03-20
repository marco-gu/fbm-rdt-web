<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="sub-title-card">
        <span> {{ taskId }}</span>
      </div>
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <template v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </template>
        <template v-if="loading">
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
          <div
            class="card-item"
            v-for="(item, index) in lpDetailListDisplay"
            :key="index"
          >
            <div>CID: {{ item.cartonID }}</div>
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-scroll-area>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { onBeforeMount, defineComponent, onMounted, Ref, ref } from "vue";
import { useRoute } from "vue-router";
import { LPDetailList } from "../models/profile";
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
    const titleParam = i18n.t("lp.lp_detail_list");
    const backUrlParam = "/lpList";
    const lpDetailListDisplay = ref([] as LPDetailList[]);
    const lpDetailListInitResult = ref([] as LPDetailList[]);
    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const loading = ref(false);
    const noRecord = ref(false);
    const retrieveIndex = ref(0);
    const pageSlice = 15;
    onBeforeMount(() => {
      loading.value = true;
      const args = {
        taskID: taskId.value,
      };
      bridge.call("fetchCartonForLPDetailList", args, (res: string) => {
        loading.value = false;
        composeLpDetailListDisplay(res);
      });
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
    });
    const composeLpDetailListDisplay = (res: string) => {
      lpDetailListInitResult.value = JSON.parse(res) as LPDetailList[];
      if (lpDetailListInitResult.value.length == 0) {
        noRecord.value = true;
      } else {
        noRecord.value = false;
        if (lpDetailListInitResult.value.length > pageSlice) {
          lpDetailListDisplay.value = lpDetailListInitResult.value.slice(
            0,
            pageSlice
          );
          retrieveIndex.value++;
        } else {
          lpDetailListDisplay.value = lpDetailListInitResult.value;
          myInfiniteScroll.value.stop();
        }
      }
    };
    const onLoad = (index: any, done: any) => {
      alert("onLoad");
      const start = retrieveIndex.value * pageSlice;
      const end = (retrieveIndex.value + 1) * pageSlice;
      setTimeout(() => {
        alert("onLoad");
        for (let i = start; i < end; i++) {
          if (lpDetailListInitResult.value[i]) {
            lpDetailListDisplay.value.push(lpDetailListInitResult.value[i]);
          }
        }
        if (
          lpDetailListDisplay.value.length ==
          (retrieveIndex.value + 1) * pageSlice
        ) {
          retrieveIndex.value++;
        } else {
          myInfiniteScroll.value.stop();
        }
        done();
      }, 200);
    };
    return {
      backUrlParam,
      loading,
      lpDetailListDisplay,
      myInfiniteScroll,
      myScrollArea,
      noRecord,
      onLoad,
      taskId,
      titleParam,
    };
  },
});
export default LPDetailListView;
</script>

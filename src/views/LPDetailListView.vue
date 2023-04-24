<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('lp.lp_list'), profileName]"
      :icons="['home', 'sync']"
      @onHome="() => router.push('/home')"
      @onSync="refresh(void 0)"
    />
    <div class="page-content">
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <template v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </template>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
          <div v-for="(item, index) in lpDetailListDisplay" :key="index">
            <div class="common-card-2">
              <div class="label mb-lg">
                {{ item.cartonID }}
              </div>
              <div>{{ item.createDateTime }}</div>
            </div>
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
import { useRoute, useRouter } from "vue-router";
import { LPDetailList } from "../models/profile";
import { useI18n } from "vue-i18n";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
const LPDetailListView = defineComponent({
  components: {
    CommonHeaderComponent,
    LoadingComponent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const taskId = ref(route.query.taskId);
    const profileName = ref(route.query.profileName);
    const i18n = useI18n();
    const titleParam = i18n.t("lp.lp_detail_list");
    const backUrlParam = "/lpList";
    const lpDetailListDisplay = ref([] as LPDetailList[]);
    const lpDetailListInitResult = ref([] as LPDetailList[]);
    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const loadingStatus = ref(false);
    const noRecord = ref(false);
    const retrieveIndex = ref(0);
    const pageSlice = 15;
    onBeforeMount(() => {
      refresh(0);
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
    });
    const refresh = (done: any) => {
      loadingStatus.value = true;
      const args = {
        taskID: taskId.value,
      };
      bridge.call("fetchCartonForLPDetailList", args, (res: string) => {
        loadingStatus.value = false;
        composeLpDetailListDisplay(res);
      });
    };
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
      const start = retrieveIndex.value * pageSlice;
      const end = (retrieveIndex.value + 1) * pageSlice;
      setTimeout(() => {
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
      refresh,
      backUrlParam,
      loadingStatus,
      lpDetailListDisplay,
      myInfiniteScroll,
      myScrollArea,
      noRecord,
      onLoad,
      taskId,
      profileName,
      titleParam,
      router,
    };
  },
});
export default LPDetailListView;
</script>

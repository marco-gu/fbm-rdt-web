<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="[profileName, so]"
      :icons="['back', 'home', 'empty']"
      @onHome="() => router.push('/home')"
      @onBack="back"
    />
    <div class="page-content">
      <q-scroll-area
        ref="scrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <div v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </div>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="infiniteScroll">
          <div v-for="(item, index) in pageView" :key="index">
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
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LPDetailList } from "../models/profile";
import { useI18n } from "vue-i18n";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import { setContentHeight } from "@/utils/screen.util";
import { PAGESIZE } from "@/models/constant";
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
    const so = ref(route.query.so);
    const i18n = useI18n();
    const titleParam = i18n.t("lp.lp_detail_list");
    // const lpDetailListDisplay = ref([] as LPDetailList[]);
    // const lpDetailListInitResult = ref([] as LPDetailList[]);
    const pageView = ref([] as LPDetailList[]);
    const apiResult = ref([] as LPDetailList[]);
    const infiniteScroll = ref();
    const scrollArea = ref();
    const loadingStatus = ref(false);
    const noRecord = ref(false);
    // const retrieveIndex = ref(0);
    // const pageSlice = 15;
    const pageInit = ref(false);
    const apiPageNumber = ref(0);
    onMounted(() => {
      setContentHeight("scroll-area");
      loadingStatus.value = true;
      setTimeout(() => {
        getData();
      }, 200);
      // const deviceHeight = window.innerHeight;
      // const scrollArea = document.getElementById("scroll-area") as any;
      // scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
    });
    const onLoad = (index: any, done: any) => {
      if (!pageInit.value) {
        if (apiResult.value.length > (apiPageNumber.value + 1) * PAGESIZE) {
          const index = apiPageNumber.value + 1;
          pageView.value = apiResult.value.slice(0, index * PAGESIZE);
          apiPageNumber.value++;
        } else {
          pageView.value = apiResult.value.slice(0, apiResult.value.length);
          infiniteScroll.value.stop();
        }
        done();
      } else {
        pageInit.value = false;
      }
      done();
    };
    const back = () => {
      // router.push({
      //   path: backUrlParam,
      // });
      router.push({
        name: "lpList",
        params: {
          from: "true",
        },
      });
    };
    // const refresh = (done: any) => {
    //   loadingStatus.value = true;
    //   const args = {
    //     taskID: taskId.value,
    //   };
    //   bridge.call("fetchCartonForLPDetailList", args, (res: string) => {
    //     loadingStatus.value = false;
    //     composeLpDetailListDisplay(res);
    //   });
    // };
    // const composeLpDetailListDisplay = (res: string) => {
    //   lpDetailListInitResult.value = JSON.parse(res) as LPDetailList[];
    //   if (lpDetailListInitResult.value.length == 0) {
    //     noRecord.value = true;
    //   } else {
    //     noRecord.value = false;
    //     if (lpDetailListInitResult.value.length > pageSlice) {
    //       lpDetailListDisplay.value = lpDetailListInitResult.value.slice(
    //         0,
    //         pageSlice
    //       );
    //       retrieveIndex.value++;
    //     } else {
    //       lpDetailListDisplay.value = lpDetailListInitResult.value;
    //       myInfiniteScroll.value.stop();
    //     }
    //   }
    // };
    // const onLoad = (index: any, done: any) => {
    //   const start = retrieveIndex.value * pageSlice;
    //   const end = (retrieveIndex.value + 1) * pageSlice;
    //   setTimeout(() => {
    //     for (let i = start; i < end; i++) {
    //       if (lpDetailListInitResult.value[i]) {
    //         lpDetailListDisplay.value.push(lpDetailListInitResult.value[i]);
    //       }
    //     }
    //     if (
    //       lpDetailListDisplay.value.length ==
    //       (retrieveIndex.value + 1) * pageSlice
    //     ) {
    //       retrieveIndex.value++;
    //     } else {
    //       myInfiniteScroll.value.stop();
    //     }
    //     done();
    //   }, 200);
    // };
    const getData = () => {
      const args = {
        taskID: taskId.value,
      };
      bridge.call("fetchCartonForLPDetailList", args, (data: any) => {
        loadingStatus.value = false;
        apiResult.value = JSON.parse(data) as LPDetailList[];
        processData();
      });
    };
    const processData = () => {
      if (apiResult.value.length == 0) {
        noRecord.value = true;
        pageView.value = [];
      } else {
        pageInit.value = true;
        if (apiResult.value.length > PAGESIZE) {
          pageView.value = apiResult.value.slice(0, PAGESIZE);
          apiPageNumber.value++;
          infiniteScroll.value.resume();
        } else {
          pageView.value = apiResult.value;
          infiniteScroll.value.stop();
        }
      }
    };
    return {
      loadingStatus,
      // lpDetailListDisplay,
      infiniteScroll,
      scrollArea,
      noRecord,
      onLoad,
      taskId,
      so,
      profileName,
      titleParam,
      router,
      back,
      pageView,
    };
  },
});
export default LPDetailListView;
</script>

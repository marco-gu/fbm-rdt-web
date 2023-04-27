<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'search']"
      @onHome="goHome"
      @onBack="goBack"
      @onSearch="onSearch($event)"
    />
    <div class="page-content">
      <!-- <q-scroll-area
      ref="myScrollArea"
      id="scroll-area"
      :thumb-style="{ width: '0px' }"
    > -->
      <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
        <div v-for="(item, index) in defaultDisplay" :key="index">
          <div class="common-card-2" @click="onDetail(item)">
            <div class="label mb-lg">
              {{ item.profileName }}<span class="separator">&nbsp;|&nbsp;</span
              >{{ item.so }}
            </div>
            <div class="value">
              {{ item.po }}<span class="separator">&nbsp;|&nbsp;</span
              >{{ item.sku }}<span class="separator">&nbsp;|&nbsp;</span
              >{{ item.scanType }}
            </div>
            <div class="value mt-sm mb-lg">
              {{ item.updateDatetime }}
            </div>
            <div class="label">
              {{ item.scannedCartonNumber
              }}<span class="separator">&nbsp;of&nbsp;</span
              >{{ item.allCartonNumber
              }}<span class="separator">&nbsp;|&nbsp;</span
              >{{
                item.finishStatus === 0
                  ? $t("common.unfinished")
                  : $t("common.completed")
              }}
              <span class="separator">&nbsp;|&nbsp;</span
              >{{
                item.uploadStatus === 0
                  ? $t("common.not_upload")
                  : $t("common.uploaded")
              }}
            </div>
          </div>
        </div>
        <!-- <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </template> -->
      </q-infinite-scroll>
      <!-- </q-scroll-area> -->
      <!-- <template v-if="noRecord">
        <div class="no-record">{{ $t("common.no_record") }}</div>
      </template> -->
      <!-- <div class="footer-message">{{ $t("continue.instruction") }}</div> -->
    </div>
  </div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { DataMgmt } from "@/models/data.management";
import router from "@/router";
import { useStore } from "@/store";
import bridge from "dsbridge";

import { defineComponent, onBeforeMount, ref } from "vue";
const DataMgmtListView = defineComponent({
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const defaultDisplay = ref([] as DataMgmt[]);
    const apiResult = ref([] as DataMgmt[]);
    const noRecord = ref(false);
    const apiIndex = ref(0);
    const myInfiniteScroll = ref();
    const store = useStore();
    // const myScrollArea = ref();
    onBeforeMount(() => {
      bridge.call("fetchDataMgmt", { pageNumber: 0 }, (data: any) => {
        apiResult.value = JSON.parse(data) as any[];
        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (apiResult.value.length == 10) {
            defaultDisplay.value = apiResult.value;
            apiIndex.value++;
          } else {
            defaultDisplay.value = apiResult.value;
            myInfiniteScroll.value.stop();
          }
        }
      });
    });
    const titles = ref(["Data Management"]);
    const goHome = () => {
      router.push("/home");
    };
    const onDetail = (item: DataMgmt) => {
      store.dispatch("dataMgmtModule/saveDataMgmt", item).then(() => {
        router.push("/dataManagementSummary");
      });
    };
    const onSearch = (e: string) => {
      console.log(e);
    };
    return {
      titles,
      goHome,
      onSearch,
      myInfiniteScroll,
      // myScrollArea,
      defaultDisplay,
      onDetail,
    };
  },
});
export default DataMgmtListView;
</script>
<style scoped lang="scss"></style>

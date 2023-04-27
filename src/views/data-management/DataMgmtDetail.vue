<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'search']"
      @onBack="() => router.push('/dataManagementSummary')"
      @onHome="() => router.push('/home')"
      @onSearch="onSearch($event)"
    />
    <div class="page-content">
      <template v-if="noRecord">
        <div class="no-record">{{ $t("common.no_record") }}</div>
      </template>
      <template v-else>
        <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
          <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
            <div v-for="(item, index) in pageView" :key="index">
              <div class="common-card-2" @click="onClickCarton(item)">
                <div class="label mb-lg">
                  {{ item.cartonId }}
                </div>
                <div class="value">
                  {{ item.so }}<span class="separator">&nbsp;|&nbsp;</span
                  >{{ item.po }}<span class="separator">&nbsp;|&nbsp;</span
                  >{{ item.sku }}
                </div>
                <div class="value mt-sm mb-lg">
                  {{ item.scanDate }}
                </div>
              </div>
            </div>
            <!-- <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </template> -->
          </q-infinite-scroll>
        </q-scroll-area>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { Carton } from "@/models/profile";
import { useStore } from "@/store";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import router from "@/router";
const DataMgmtDetail = defineComponent({
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const store = useStore();
    const pageView = ref([] as Carton[]);
    const dataMgmt = ref(store.state.dataMgmtModule.dataMgmt);
    const titles = [dataMgmt.value.so, "Detail"];
    const noRecord = ref(false);
    onBeforeMount(() => {
      const args = {
        taskId: dataMgmt.value.taskID,
      };
      bridge.call("fetchLPByTaskIdForDataManagement", args, (res: string) => {
        const cartons = JSON.parse(res) as Carton[];
        if (cartons.length > 0) {
          pageView.value = cartons;
        } else {
          noRecord.value = true;
        }
      });
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    });
    const onClickCarton = (item: Carton) => {
      const data = {
        client: dataMgmt.value.client,
        so: dataMgmt.value.so,
        po: dataMgmt.value.po,
        sku: dataMgmt.value.sku,
        operation: dataMgmt.value.scanType,
        cartonID: item.cartonId,
        scanDate: item.scanDate,
      };
      store
        .dispatch("dataMgmtModule/saveSelectedCartonDetail", data)
        .then(() => {
          router.push("/dataMgmtCartonDetail");
        });
      // router.push({
      //   name: "dataMgmtCartonDetail",
      //   params: {
      //     client: dataMgmt.value.client,
      //     so: dataMgmt.value.so,
      //     po: dataMgmt.value.po,
      //     sku: dataMgmt.value.sku,
      //     operation: dataMgmt.value.scanType,
      //     cartonID: item.cartonId,
      //     scanDate: item.scanDate,
      //   },
      // });
    };
    return { titles, pageView, onClickCarton, router, noRecord };
  },
});
export default DataMgmtDetail;
</script>

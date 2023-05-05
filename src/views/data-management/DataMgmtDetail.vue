<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'search']"
      @onBack="() => router.push('/dataManagementSummary')"
      @onHome="home"
      @onSearch="onSearch($event)"
    />
    <div class="page-content">
      <template v-if="noRecord">
        <div class="no-record">{{ $t("common.no_record") }}</div>
      </template>
      <template v-else>
        <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
          <!-- <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll"> -->
          <div v-for="(item, index) in pageView" :key="index">
            <div
              class="common-card-2"
              v-touch-hold:1800="handleHold"
              @click="onCarton(item)"
            >
              <q-checkbox
                class="checkbox"
                v-model="item.isSelected"
                v-if="isEditMode"
                checked-icon="app:checkboxOn"
                unchecked-icon="app:checkboxOff"
              />
              <div class="label mb-lg">
                {{ item.cartonId }}
              </div>
              <div class="value">
                {{ item.so }}<span class="separator">&nbsp;|&nbsp;</span
                >{{ item.po
                }}<span class="separator" v-if="item.sku">&nbsp;|&nbsp;</span
                >{{ item.sku }}
              </div>
              <div class="value mt-sm">
                {{ item.scanDate }}
              </div>
            </div>
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
          <!-- </q-infinite-scroll> -->
        </q-scroll-area>
      </template>
    </div>
    <div class="bottom-coherent-button" id="bottom-button" v-show="isEditMode">
      <q-btn
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.delete')"
        :disable="isButtonDisabled"
        @click="showDeleteDialog"
      />
    </div>
  </div>
  <PopupComponent
    :visible="dialogVisible"
    :message="msg"
    :type="type"
    @close="onConfirmDialog"
    @cancel="dialogVisible = false"
  ></PopupComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { Carton, SelectedCarton } from "@/models/profile";
import { useStore } from "@/store";
import bridge from "dsbridge";
import { computed, defineComponent, onBeforeMount, onMounted, ref } from "vue";
import router from "@/router";
import { useI18n } from "vue-i18n";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
const DataMgmtDetail = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const pageView = ref([] as Carton[]);
    const dataMgmt = ref(store.state.dataMgmtModule.dataMgmt);
    const titles = [dataMgmt.value.so, "Detail"];
    const noRecord = ref(false);
    const isEditMode = ref(false);
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const pressHome = ref(false);
    onBeforeMount(() => {
      initData();
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    });
    const handleHold = () => {
      isEditMode.value = true;
      clearCheckbox();
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height =
        deviceHeight - scrollArea.offsetTop - 100 + "px";
    };
    const isButtonDisabled = computed(() => {
      return !pageView.value.some((item: any) => item["isSelected"]);
    });
    const onCarton = (item: Carton) => {
      if (!isEditMode.value) {
        const selectedCarton = {} as SelectedCarton;
        selectedCarton.client = dataMgmt.value.client;
        selectedCarton.so = dataMgmt.value.so;
        selectedCarton.po = dataMgmt.value.po;
        selectedCarton.sku = dataMgmt.value.sku || "";
        selectedCarton.operation = dataMgmt.value.scanType;
        selectedCarton.cartonID = item.cartonId;
        selectedCarton.scanDate = item.scanDate;
        selectedCarton.hub = item.hub;
        selectedCarton.quantity = item.quantity;
        selectedCarton.style = item.style;
        selectedCarton.lpID = item.lpId;
        store
          .dispatch("dataMgmtModule/saveSelectedCartonDetail", selectedCarton)
          .then(() => {
            router.push("/dataMgmtCartonDetail");
          });
      }
    };
    const cancelEditMode = () => {
      clearCheckbox();
      isEditMode.value = false;
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    };
    const clearCheckbox = () => {
      pageView.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const showDeleteDialog = () => {
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("dataManagement.delete_dialog_message");
    };
    const onConfirmDialog = () => {
      dialogVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      } else {
        let lpList = "";
        pageView.value.forEach((item: any) => {
          if (item["isSelected"] == true) {
            if (lpList.length == 0) {
              lpList = item.lpId;
            } else {
              lpList += "@" + item.lpId;
            }
          }
        });
        const apiParams = {
          lps: lpList,
        };
        bridge.call("deleteDataMgmtCartons", apiParams, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            initData();
          }
        });
        cancelEditMode();
      }
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    const initData = () => {
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
    };
    return {
      titles,
      pageView,
      onCarton,
      router,
      noRecord,
      handleHold,
      isEditMode,
      isButtonDisabled,
      showDeleteDialog,
      onConfirmDialog,
      cancelEditMode,
      dialogVisible,
      type,
      msg,
      home,
    };
  },
});
export default DataMgmtDetail;
</script>

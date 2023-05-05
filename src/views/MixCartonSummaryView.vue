<template>
  <div class="wrapper">
    <common-header-component
      :titles="[`${soNumber} | ${cartonID}`]"
      :icons="['back', 'home']"
      @onHome="onHome"
      @onBack="onBack"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <template v-if="mixCartonListDisplay.length === 0">
          <div class="no-data">
            {{ $t("common.no_record") }}
          </div>
        </template>
        <template v-else>
          <div class="scroll-area">
            <div v-for="(item, index) in mixCartonListDisplay" :key="index">
              <div class="common-card-2" v-touch-hold:1800="handleHold">
                <q-checkbox
                  class="checkbox"
                  v-model="item.isSelected"
                  checked-icon="app:checkboxOn"
                  unchecked-icon="app:checkboxOff"
                  v-show="isEditMode"
                />
                <div class="label mb-lg">Item {{ index + 1 }}</div>
                <div class="value">
                  {{ item.upc }}
                </div>
                <div item="label">
                  {{ item.style }}<span class="separator">&nbsp;&nbsp;</span
                  >{{ item.color }}<span class="separator">&nbsp;|&nbsp;</span
                  >{{ item.size }} <span class="separator">&nbsp;|&nbsp;</span
                  >{{ item.quantity }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <template v-if="isEditMode">
        <q-btn
          no-caps
          class="full-width"
          flat
          push
          :label="$t('common.delete')"
          @click="onClickDelete"
        />
      </template>
      <template v-else>
        <q-btn
          no-caps
          class="full-width"
          flat
          push
          :label="$t('common.add')"
          @click="onClickAdd"
        />
      </template>
    </div>
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :type="type"
      @close="OnClose"
      @cancel="popupVisible = false"
    ></PopupComponent>
  </div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { MixCartonProduct } from "@/models/profile";
import { ViewDisplayAttribute } from "@/utils/profile.render";
import { calScrollAreaWithBottom, softKeyPopUp } from "@/utils/screen.util";
import bridge from "dsbridge";
import { defineComponent, ref, onMounted, Ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import inputScan from "../assets/icon/compress-solid.svg";
const MixCartonSummaryView = defineComponent({
  components: {
    PopupComponent,
    CommonHeaderComponent,
  },
  setup() {
    const route = useRoute();
    const cartonID = ref("");
    const i18n = useI18n();
    const inputRef = ref(null);
    const inputScanIcon = inputScan;
    const isEditMode = ref(false);
    const mixCartonListDisplay: Ref<MixCartonProduct[]> = ref([]);
    const msg = ref("");
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const popupVisible = ref(false);
    const pressDelete = ref(false);
    const pressHome = ref(false);
    const router = useRouter();
    const scanType = ref("");
    const soNumber = ref("");
    const taskID = ref("");
    const type = ref("");
    onMounted(() => {
      calScrollAreaWithBottom("scroll-area", "bottom-button");
      softKeyPopUp(window.innerHeight, "scroll-area", "bottom-button");
      arrangeRouteParams();
      fetchCartonProducts();
      fetchSoNumberForMixCartonSummary();
    });
    watch(
      route,
      () => {
        if (route.name === "mixCartonSummary") {
          arrangeRouteParams();
          fetchCartonProducts();
          fetchSoNumberForMixCartonSummary();
        }
      },
      { deep: true }
    );
    const arrangeRouteParams = () => {
      cartonID.value = route.params.cartonID as string;
      taskID.value = route.params.taskID as string;
      scanType.value = route.params.scanType as string;
    };
    const deleteCartonProducts = () => {
      let idList: any = [];
      mixCartonListDisplay.value.forEach((item: any) => {
        if (item["isSelected"]) {
          idList.push(item.id);
        }
      });
      bridge.call("deleteCartonProducts", { idList: idList }, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          isEditMode.value = false;
          fetchCartonProducts();
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          type.value = "error";
          popupVisible.value = true;
          msg.value = i18n.t("messageCode." + androidResponse.messageCode);
        }
      });
    };
    const fetchCartonProducts = () => {
      bridge.call(
        "fetchCartonProducts",
        {
          cartonId: cartonID.value,
          taskId: taskID.value,
          scanType: scanType.value,
        },
        (res: string) => {
          mixCartonListDisplay.value = JSON.parse(res) as MixCartonProduct[];
        }
      );
    };
    const fetchSoNumberForMixCartonSummary = () => {
      bridge.call(
        "fetchSoNumberForMixCartonSummary",
        { taskID: taskID.value },
        (res: string) => {
          soNumber.value = res;
        }
      );
    };
    const handleHold = () => {
      mixCartonListDisplay.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
      isEditMode.value = true;
    };
    const onBack = () => {
      if (isEditMode.value) {
        isEditMode.value = false;
      } else {
        bridge.call("completeMixCarton", null);
      }
    };
    const onClickAdd = () => {
      router.push({
        name: "mixCarton",
        params: {
          id: route.params.id,
          from: "mixCartonSummary",
          cartonID: cartonID.value,
          taskID: taskID.value,
          scanType: scanType.value,
          itemCount: mixCartonListDisplay.value.length + 1,
        },
      });
    };
    const onClickDelete = () => {
      if (mixCartonListDisplay.value.some((item: any) => item["isSelected"])) {
        type.value = "action";
        pressDelete.value = true;
        popupVisible.value = true;
        msg.value = i18n.t("dataManagement.delete_dialog_message");
      } else {
        type.value = "error";
        popupVisible.value = true;
        msg.value = i18n.t("dataManagement.no_record_selected");
      }
    };
    const OnClose = () => {
      popupVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      } else if (pressDelete.value) {
        deleteCartonProducts();
      }
      pressHome.value = false;
      pressDelete.value = false;
    };
    const onHome = () => {
      pressHome.value = true;
      popupVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    return {
      cartonID,
      handleHold,
      inputRef,
      inputScanIcon,
      isEditMode,
      mixCartonListDisplay,
      msg,
      onBack,
      onClickAdd,
      onClickDelete,
      OnClose,
      onHome,
      pageViews,
      soNumber,
      popupVisible,
      router,
      type,
    };
  },
});
export default MixCartonSummaryView;
</script>
<style lang="scss" scoped>
.container {
  margin: 0 auto 10px;
  width: calc(100% - 46px);
}
.field {
  margin: 20px 0px;
}
.q-field {
  height: 40px;
  padding: 0px;
}
</style>

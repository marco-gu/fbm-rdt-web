<template>
  <div class="wrapper">
    <common-header-component
      :titles="[titleParam]"
      :icons="['back', 'home']"
      @onHome="() => (backHomeDialogVisible = true)"
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
            <div
              class="common-card-2"
              v-for="(item, index) in mixCartonListDisplay"
              :key="index"
              v-touch-hold:1800="handleHold"
            >
              <q-checkbox
                class="checkbox"
                v-model="item.isSelected"
                checked-icon="app:checkboxOn"
                unchecked-icon="app:checkboxOff"
                v-show="isEditMode"
              />
              <div class="label mb-lg">{{ index }}</div>
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
          :label="$t('common.cancel')"
          @click="cancelEditMode"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          no-caps
          class="full-width"
          flat
          push
          :label="$t('common.delete')"
          @click="deleteMixCarton"
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
      @close="popupVisible = false"
    ></PopupComponent>
    <q-dialog
      class="back-home-dialog"
      v-model="backHomeDialogVisible"
      persistent
    >
      <div class="dialog-container">
        <div class="dialog-container__content">
          {{ $t("common.return_home_dialog") }}
        </div>
        <div class="dialog-container__button">
          <button
            class="dialog-button cancel"
            @click="() => (backHomeDialogVisible = false)"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="dialog-button confirm"
            @click="() => router.push('/home')"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import { ViewDisplayAttribute } from "@/utils/profile.render";
import { calScrollAreaWithBottom, softKeyPopUp } from "@/utils/screen.util";
import bridge from "dsbridge";
import { defineComponent, ref, onBeforeMount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import inputScan from "../assets/icon/compress-solid.svg";
const MixCartonSummaryView = defineComponent({
  components: {
    PopupComponent,
    CommonHeaderComponent,
  },
  setup() {
    const backHomeDialogVisible = ref(false);
    const dialogVisible = ref(false);
    const i18n = useI18n();
    const inputRef = ref(null);
    const inputScanIcon = inputScan;
    const isEditMode = ref(false);
    const mixCartonListDisplay = ref([{ test: 1 }, { test: 2 }]);
    const msg = ref("");
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const popupVisible = ref(false);
    const route = useRoute();
    const router = useRouter();
    const taskID = ref("");
    const titleParam = ref("SO | CID");
    const type = ref("");
    onBeforeMount(() => {
      const param = route.params.id as any;
      console.log(param);
      const profileName = param.substring(0, param.indexOf("&"));
      const scanType = param.substring(param.indexOf("&") + 1, param.length);
    });
    onMounted(() => {
      // calculate scroll area height
      calScrollAreaWithBottom("scroll-area", "bottom-button");
      // hide bottom button if soft key up
      softKeyPopUp(window.innerHeight, "scroll-area", "bottom-button");
    });
    const cancelEditMode = () => {
      isEditMode.value = false;
    };
    const deleteMixCarton = () => {
      // TODO: deleteMixCarton
      console.log("MixCarton Summary deleteMixCarton");
    };
    const handleHold = () => {
      // TODO: edit mode
      console.log("MixCarton Summary handleHold");
      mixCartonListDisplay.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
      isEditMode.value = true;
    };
    const onBack = () => {
      // TODO: back to scan page
      console.log("MixCarton Summary onBack");
    };
    const onClickAdd = () => {
      // TODO: back to MixCarton page
      // item number = length+1
      console.log("MixCarton Summary onClickAdd");
    };
    return {
      backHomeDialogVisible,
      cancelEditMode,
      deleteMixCarton,
      dialogVisible,
      handleHold,
      inputRef,
      inputScanIcon,
      isEditMode,
      mixCartonListDisplay,
      msg,
      onBack,
      onClickAdd,
      pageViews,
      popupVisible,
      router,
      titleParam,
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

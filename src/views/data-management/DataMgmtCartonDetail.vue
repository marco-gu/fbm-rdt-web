<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="icons"
      @onHome="home"
      @onBack="() => router.push('/dataMgmtDetail')"
      @onMixed="onMixed"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div v-for="(item, index) in pageView" :key="index">
            <div class="field">
              <div class="input-title">
                <span class="text"> {{ item.displayFieldName }}</span>
              </div>
              <q-input
                class="input-field"
                input-class="text-left"
                v-model="item.model"
                borderless
                :readonly="!isEditMode || !item.editable"
                :disable="!isEditMode || !item.editable"
              >
                <template
                  v-if="item.scan == 1 && isEditMode == true"
                  v-slot:append
                >
                  <q-avatar
                    class="btn-img"
                    @click="scan(item.fieldName, $event)"
                  >
                    <q-img
                      no-transition
                      no-spinner
                      :src="inputScanIcon"
                      width="12px"
                    />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        v-show="isEditMode"
        no-caps
        unelevated
        :ripple="false"
        class="full-width"
        @click="cancelEditMode"
        :label="$t('common.cancel')"
      />
      <q-separator v-show="isEditMode" vertical inset color="white" />
      <q-btn
        :ripple="false"
        no-caps
        unelevated
        class="full-width"
        @click="onSubmit"
      >
        {{ label }}
      </q-btn>
    </div>
    <PopupComponent
      :visible="dialogVisible"
      :message="msg"
      :type="type"
      @close="onConfirmDialog"
      @cancel="dialogVisible = false"
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
import { ProfileDisplayAttribute } from "@/models/profile";
import router from "@/router";
import { useStore } from "@/store";
import {
  composeViewElement,
  ProfileElementLevel,
} from "@/utils/profile.render";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import inputScan from "../../assets/icon/compress-solid.svg";
type ViewElement = {
  displayFieldName: string;
  model: string;
  scan: number;
  editable: boolean;
};
const DataMgmtCartonDetail = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const store = useStore();
    // const pageView: ViewElement[] = [];
    const pageView = ref([] as ViewElement[]);
    const inputScanIcon = inputScan;
    const titles = [
      store.state.dataMgmtModule.selectedCartonDetail.so,
      store.state.dataMgmtModule.selectedCartonDetail.cartonID,
    ];
    const isEditMode = ref(false);
    const i18n = useI18n();
    const label = ref(i18n.t("common.edit"));
    const myForm = ref();
    const type = ref("");
    const msg = ref("");
    const dialogVisible = ref(false);
    const icons = ref(["back", "home", "mixed"]);
    const pressHome = ref(false);
    const pressSave = ref(false);
    onBeforeMount(() => {
      store.state.dataMgmtModule.profile.forEach(
        (item: ProfileDisplayAttribute) => {
          if (item.type == store.state.dataMgmtModule.dataMgmt.scanType) {
            if (item.level == ProfileElementLevel.CARTON_INDIVIDUAL) {
              const element = composeViewElement(item);
              element.editable = false;
              const fieldName = item.displayDataFieldName;
              let canAdd = false;
              switch (fieldName) {
                case "Quantity":
                  element.model = ref(
                    store.state.dataMgmtModule.selectedCartonDetail.quantity
                  );
                  canAdd = true;
                  break;
                case "Style":
                  element.model = ref(
                    store.state.dataMgmtModule.selectedCartonDetail.style
                  );
                  canAdd = true;
                  break;
                case "HUB":
                  element.model = ref(
                    store.state.dataMgmtModule.selectedCartonDetail.hub
                  );
                  canAdd = true;
                  break;
                case "SKU":
                  element.model = ref(
                    store.state.dataMgmtModule.selectedCartonDetail.sku
                  );
                  canAdd = true;
                  break;
              }
              if (canAdd) {
                pageView.value.push(element as never);
                canAdd = false;
              }
            }
          }
        }
      );
      pageView.value.push({
        displayFieldName: "Client",
        model: store.state.dataMgmtModule.selectedCartonDetail.client,
        scan: 0,
        editable: false,
      });
      pageView.value.push({
        displayFieldName: "Operation",
        model: store.state.dataMgmtModule.selectedCartonDetail.operation,
        scan: 0,
        editable: false,
      });
      pageView.value.push({
        displayFieldName: "Shipping Order",
        model: store.state.dataMgmtModule.selectedCartonDetail.so,
        scan: 0,
        editable: false,
      });
      pageView.value.push({
        displayFieldName: "Purchase Order",
        model: store.state.dataMgmtModule.selectedCartonDetail.po,
        scan: 0,
        editable: false,
      });
      pageView.value.push({
        displayFieldName: "Carton ID",
        model: store.state.dataMgmtModule.selectedCartonDetail.cartonID,
        scan: 1,
        editable: true,
      });
      pageView.value.push({
        displayFieldName: "Scan Date",
        model: store.state.dataMgmtModule.selectedCartonDetail.scanDate,
        scan: 0,
        editable: false,
      });
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    });
    const onConfirmDialog = () => {
      dialogVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      } else if (pressSave.value) {
        const apiParams = {
          LPID: store.state.dataMgmtModule.selectedCartonDetail.lpID,
          CartonID: "",
          Style: "",
          Quantity: "",
          HUB: "",
        };
        pageView.value.forEach((item) => {
          switch (item.displayFieldName) {
            case "Quantity":
              apiParams.Quantity = item.model;
              break;
            case "Style":
              apiParams.Style = item.model;
              break;
            case "HUB":
              apiParams.HUB = item.model;
              break;
            case "Carton ID":
              apiParams.CartonID = item.model;
              break;
          }
        });
        bridge.call(
          "updateCartonForDataManagement",
          apiParams,
          (res: string) => {
            const androidResponse = JSON.parse(res) as AndroidResponse<any>;
            if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
              router.push("/dataMgmtDetail");
            }
          }
        );
      }
    };
    const onSubmit = () => {
      if (isEditMode.value) {
        myForm.value.validate().then((success: any) => {
          if (success) {
            pressSave.value = true;
            type.value = "action";
            dialogVisible.value = true;
            msg.value = i18n.t("dataManagement.update_dialog_message");
          }
        });
      } else {
        isEditMode.value = true;
        icons.value = ["back", "home", "empty"];
        label.value = i18n.t("common.save");
      }
    };
    const onMixed = () => {
      const item = {
        taskID: store.state.dataMgmtModule.dataMgmt.taskID,
        cartonID: store.state.dataMgmtModule.selectedCartonDetail.cartonID,
      };
      store
        .dispatch("dataMgmtModule/saveSelectedCartonHeader", item)
        .then(() => {
          router.push("/dataMgmtCartonMixed");
        });
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
      icons.value = ["back", "home", "mixed"];
      label.value = i18n.t("common.edit");
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    return {
      pageView,
      titles,
      router,
      inputScanIcon,
      label,
      onSubmit,
      isEditMode,
      myForm,
      type,
      msg,
      dialogVisible,
      onConfirmDialog,
      onMixed,
      icons,
      cancelEditMode,
      home,
    };
  },
});
export default DataMgmtCartonDetail;
</script>

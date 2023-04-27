<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'mixed']"
      @onHome="() => router.push('/home')"
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
    <div class="bottom-button" id="bottom-button">
      <q-btn no-caps unelevated class="full-width" @click="onSubmit">
        {{ label }}
      </q-btn>
    </div>
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :type="type"
      @close="OnClosePopUp"
    ></PopupComponent>
  </div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import router from "@/router";
import { useStore } from "@/store";
import { defineComponent, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
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
    const route = useRoute();
    const pageView: ViewElement[] = [];
    const inputScanIcon = inputScan;
    const titles = [
      store.state.dataMgmtModule.selectedCartonDetail.so,
      store.state.dataMgmtModule.selectedCartonDetail.cartonID,
    ];
    const isEditMode = ref(false);
    const i18n = useI18n();
    const label = ref(i18n.t("dataManagement.edit"));
    const myForm = ref();
    const type = ref("");
    const msg = ref("");
    const popupVisible = ref(false);
    pageView.push({
      displayFieldName: "Client",
      model: store.state.dataMgmtModule.selectedCartonDetail.client,
      scan: 0,
      editable: false,
    });
    pageView.push({
      displayFieldName: "Operation",
      model: store.state.dataMgmtModule.selectedCartonDetail.operation,
      scan: 0,
      editable: false,
    });
    pageView.push({
      displayFieldName: "Shipping Order",
      model: store.state.dataMgmtModule.selectedCartonDetail.so,
      scan: 0,
      editable: false,
    });
    pageView.push({
      displayFieldName: "Purchase Order",
      model: store.state.dataMgmtModule.selectedCartonDetail.po,
      scan: 0,
      editable: false,
    });
    if (route.params.sku) {
      pageView.push({
        displayFieldName: "SKU",
        model: store.state.dataMgmtModule.selectedCartonDetail.sku,
        scan: 0,
        editable: false,
      });
    }
    pageView.push({
      displayFieldName: "Carton ID",
      model: store.state.dataMgmtModule.selectedCartonDetail.cartonID,
      scan: 1,
      editable: true,
    });
    pageView.push({
      displayFieldName: "Scan Date",
      model: store.state.dataMgmtModule.selectedCartonDetail.scanDate,
      scan: 0,
      editable: false,
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 1 + "px";
    });
    const OnClosePopUp = () => {
      popupVisible.value = false;
      router.push("dataMgmtDetail");
    };
    const onSubmit = () => {
      if (isEditMode.value) {
        myForm.value.validate().then((success: any) => {
          if (success) {
            type.value = "info";
            popupVisible.value = true;
            msg.value = i18n.t("dataManagement.update_dialog_message");
          }
        });
      } else {
        isEditMode.value = true;
        label.value = i18n.t("dataManagement.save");
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
      popupVisible,
      OnClosePopUp,
      onMixed,
    };
  },
});
export default DataMgmtCartonDetail;
</script>

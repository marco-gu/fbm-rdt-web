<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'detail']"
      @onHome="home"
      @onBack="() => router.push('/dataMgmtList')"
      @onDetail="() => router.push('/dataMgmtDetail')"
    />
    <div class="page-content">
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <q-form @submit="onSubmit" ref="myForm">
          <div v-for="(item, i) in pageView" :key="i">
            <div class="field">
              <div class="input-title">
                <span class="text"> {{ item.displayFieldName }}</span>
              </div>
              <q-input
                class="input-field"
                input-class="text-left"
                v-model="item.model"
                lazy-rules
                :rules="[item.valid]"
                borderless
                :readonly="!isEditMode || !item.editable"
                :disable="!isEditMode || !item.editable"
              >
                <template v-if="item.scan == 1 && isEditMode" v-slot:append>
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
  </div>
  <PopupComponent
    :visible="popupVisible"
    :message="msg"
    :type="type"
    @close="OnClose"
    @cancel="popupVisible = false"
  ></PopupComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import { DataMgmt } from "@/models/data.management";
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
const DataMgmtSummary = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const inputScanIcon = inputScan;
    const pageView = ref([] as any[]);
    const dataMgmtView = ref(store.state.dataMgmtModule.dataMgmt);
    const titles = [dataMgmtView.value.client, dataMgmtView.value.so];
    const label = ref(i18n.t("common.edit"));
    const myForm = ref();
    const isEditMode = ref(false);
    const type = ref("");
    const msg = ref("");
    const popupVisible = ref(false);
    const pressHome = ref(false);
    onBeforeMount(() => {
      composeView(dataMgmtView.value);
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 1 + "px";
    });
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
        label.value = i18n.t("common.save");
      }
    };
    const composeView = (obj: DataMgmt) => {
      bridge.call(
        "fetchProfileByProfileCode",
        { taskId: obj.taskID },
        (res: any) => {
          const profile = JSON.parse(res) as ProfileDisplayAttribute[];
          store.dispatch("dataMgmtModule/saveProfile", profile);
          pageView.value.push({
            displayFieldName: "Client",
            model: dataMgmtView.value.client,
          });
          pageView.value.push({
            displayFieldName: "Operation",
            model: dataMgmtView.value.scanType,
          });
          profile.forEach((item: ProfileDisplayAttribute) => {
            if (item.type == obj.scanType) {
              if (
                item.level == ProfileElementLevel.CARTON_COMMON ||
                item.level == ProfileElementLevel.ORDER
              ) {
                const element = composeViewElement(item);
                element.editable = true;
                switch (element.fieldName) {
                  case "PO":
                    element.model = ref(obj.po);
                    break;
                  case "SO":
                    element.model = ref(obj.so);
                    break;
                  case "SKU":
                    element.model = ref(obj.sku);
                    break;
                  case "ContainerNumber":
                    element.model = ref(obj.containerNumber);
                    break;
                  case "TotalCBM":
                    element.model = ref(obj.totalCBM);
                    break;
                  case "TotalWeight":
                    element.model = ref(obj.totalWeight);
                    break;
                  default:
                    break;
                }
                pageView.value.push(element);
              }
            }
          });
          pageView.value.push({
            displayFieldName: "Scanned Carton",
            model:
              dataMgmtView.value.scannedCartonNumber +
              "/" +
              dataMgmtView.value.allCartonNumber,
          });
          pageView.value.push({
            displayFieldName: "Updated Date",
            model: dataMgmtView.value.updateDatetime,
          });
        }
      );
    };
    const OnClose = () => {
      popupVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      } else {
        router.push("/dataMgmtList");
      }
    };
    const home = () => {
      pressHome.value = true;
      popupVisible.value = true;
      type.value = "action";
      msg.value = msg.value = i18n.t("common.return_home");
    };
    return {
      titles,
      pageView,
      router,
      onSubmit,
      label,
      isEditMode,
      inputScanIcon,
      myForm,
      type,
      popupVisible,
      msg,
      OnClose,
      home,
    };
  },
});
export default DataMgmtSummary;
</script>
<style scoped lang="scss"></style>

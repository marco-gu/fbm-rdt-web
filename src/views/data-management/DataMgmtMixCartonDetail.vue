<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="back"
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
                lazy-rules
                :rules="[item.valid]"
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
        no-caps
        unelevated
        class="full-width"
        :ripple="false"
        @click="onSubmit"
      >
        {{ label }}
      </q-btn>
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
import { ProfileDisplayAttribute } from "@/models/profile";
import router from "@/router";
import {
  composeViewElement,
  ProfileElementLevel,
} from "@/utils/profile.render";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
import inputScan from "../../assets/icon/compress-solid.svg";
import PopupComponent from "@/components/PopupComponent.vue";
import bridge from "dsbridge";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { setContentHeightWithBtn } from "@/utils/screen.util";
const DataMgmtCartonMixedDetail = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const titles = [
      route.params.cartonID,
      store.state.dataMgmtModule.cartonMixItem.displayName,
    ];
    const myForm = ref();
    const pageView = ref([] as any[]);
    const isEditMode = ref(false);
    const i18n = useI18n();
    const label = ref(i18n.t("common.edit"));
    const type = ref("");
    const msg = ref("");
    const dialogVisible = ref(false);
    const inputScanIcon = inputScan;
    const pressHome = ref(false);
    const pressSave = ref(false);
    const editDialogSuccess = ref(false);
    const obj = JSON.parse(
      JSON.stringify(store.state.dataMgmtModule.cartonMixItem.attribute)
    );
    onBeforeMount(() => {
      composeView();
    });
    onMounted(() => {
      setContentHeightWithBtn("scroll-area");
    });
    const composeView = () => {
      store.state.dataMgmtModule.profile.forEach(
        (item: ProfileDisplayAttribute) => {
          if (item.type == store.state.dataMgmtModule.dataMgmt.scanType) {
            if (item.level == ProfileElementLevel.CARTON_UPC) {
              const element = composeViewElement(item);
              element.editable = true;
              switch (item.displayDataFieldName) {
                case "UPC":
                  element.model = ref(obj.upc);
                  break;
                case "Color":
                  element.model = ref(obj.color);
                  break;
                case "Style":
                  element.model = ref(obj.style);
                  break;
                case "Size":
                  element.model = ref(obj.size);
                  break;
                case "Quantity":
                  element.model = ref(obj.value.quantity);
                  break;
                default:
                  break;
              }
              pageView.value.push(element as never);
            }
          }
        }
      );
    };
    const onSubmit = () => {
      if (isEditMode.value) {
        myForm.value.validate().then((success: any) => {
          if (success) {
            type.value = "action";
            dialogVisible.value = true;
            pressSave.value = true;
            msg.value = i18n.t("dataManagement.update_dialog_message");
          }
        });
      } else {
        isEditMode.value = true;
        label.value = i18n.t("common.save");
      }
    };
    const showEditSuccessDialog = () => {
      editDialogSuccess.value = true;
      dialogVisible.value = true;
      type.value = "success";
      msg.value = i18n.t("common.edit_success");
    };
    const onConfirmDialog = () => {
      if (editDialogSuccess.value) {
        dialogVisible.value = false;
        router.push("/dataMgmtMixCartonList");
      } else {
        dialogVisible.value = false;
        if (pressHome.value) {
          router.push("/home");
        } else if (pressSave.value) {
          const apiParams = {
            id: store.state.dataMgmtModule.cartonMixItem.id,
            lpId: store.state.dataMgmtModule.cartonMixItem.lpId,
            UPC: "",
            Color: "",
            Size: "",
            Quantity: "",
            Style: "",
            taskId: store.state.dataMgmtModule.dataMgmt.taskID,
          };
          pageView.value.forEach((item: any) => {
            switch (item.displayFieldName) {
              case "UPC":
                apiParams.UPC = item.model;
                break;
              case "Color":
                apiParams.Color = item.model;
                break;
              case "Style":
                apiParams.Style = item.model;
                break;
              case "Size":
                apiParams.Size = item.model;
                break;
              case "Quantity":
                apiParams.Quantity = item.model;
                break;
            }
          });
          bridge.call(
            "updateCartonProductForDataManagement",
            apiParams,
            (res: string) => {
              const androidResponse = JSON.parse(res) as AndroidResponse<any>;
              if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
                showEditSuccessDialog();
              }
            }
          );
        }
      }
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
      label.value = i18n.t("common.edit");
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    const back = () => {
      router.push("/dataMgmtMixCartonList");
    };
    return {
      titles,
      router,
      pageView,
      isEditMode,
      label,
      myForm,
      onSubmit,
      cancelEditMode,
      inputScanIcon,
      type,
      dialogVisible,
      msg,
      onConfirmDialog,
      home,
      back,
    };
  },
});
export default DataMgmtCartonMixedDetail;
</script>

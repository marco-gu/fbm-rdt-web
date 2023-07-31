<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="back"
    />
    <div class="page-content">
      <q-scroll-area
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
        ref="scrollAreaRef"
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
                ref="inputRef"
                v-model="item.model"
                @focus="onFocus(i)"
                @keyup.enter="onInputKeyUp($event, i)"
                @paste="validPaste($event, i)"
                lazy-rules
                :rules="[item.valid]"
                :maxlength="item.length"
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
    :messageCode="msgCode"
    @close="onConfirmDialog"
    @cancel="dialogVisible = false"
  ></PopupComponent>
  <NotifyComponent
    :visible="notifyVisible"
    :message="msg"
    @close="onCloseNotify"
  >
  </NotifyComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { ProfileDisplayAttribute } from "@/models/profile";
import router from "@/router";
import {
  composeViewElement,
  ProfileElementLevel,
  toUpperCaseElementInput,
  validPasteInput,
} from "@/utils/profile.render";
import { defineComponent, onBeforeMount, onMounted, ref, watch } from "vue";
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
import { resizeScreen, setContentHeightWithBtn } from "@/utils/screen.util";
import NotifyComponent from "@/components/NotifyComponent.vue";
const DataMgmtCartonMixedDetail = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    NotifyComponent,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const titles = [
      route.params.cartonID,
      store.state.dataMgmtModule.cartonMixItem.displayName,
    ];
    const myForm = ref();
    const inputRef = ref();
    const pageView = ref([] as any[]);
    const isEditMode = ref(false);
    const i18n = useI18n();
    const label = ref(i18n.t("common.edit"));
    const type = ref("");
    const msg = ref("");
    const msgCode = ref("");
    const dialogVisible = ref(false);
    const inputScanIcon = inputScan;
    const pressHome = ref(false);
    const pressSave = ref(false);
    const notifyVisible = ref(false);
    const obj = store.state.dataMgmtModule.cartonMixItem.attribute;
    const scrollAreaRef = ref(null);
    let position = 0;
    onBeforeMount(() => {
      composeView();
    });
    onMounted(() => {
      // const deviceHeight = store.state.screenModule.screenHeight;
      setContentHeightWithBtn("scroll-area");
      resizeScreen(window.innerHeight, "scroll-area", "bottom-button", store);
    });
    const composeView = () => {
      store.state.dataMgmtModule.profile.forEach(
        (item: ProfileDisplayAttribute) => {
          if (item.type == store.state.dataMgmtModule.dataMgmt.scanType) {
            if (item.level == ProfileElementLevel.CARTON_UPC) {
              const element = composeViewElement(item);
              element.editable = true;
              switch (item.dataFieldName) {
                case "UPC":
                  element.model = ref(obj.upc);
                  element.scan = 1;
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
                  element.model = ref(obj.quantity);
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
    const onConfirmDialog = () => {
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
          switch (item.fieldName) {
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
              notifyVisible.value = true;
              msg.value = i18n.t("common.modify_success");
            } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
              type.value = "error";
              dialogVisible.value = true;
              msg.value = i18n.t("messageCode." + androidResponse.messageCode);
              msgCode.value = androidResponse.messageCode;
            }
          }
        );
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
      router.push({
        path: "/dataMgmtMixCartonList",
        query: {
          from: "true",
        },
      });
    };
    const multiWatchSources = [pageView.value];
    toUpperCaseElementInput(multiWatchSources);
    const scan = (fieldName: string, event: Event) => {
      const isCamera = store.state.commonModule.scanDevice === "camera";
      if (isCamera) {
        const reqParams = {
          scanType: "DM",
          fieldName: fieldName,
        };
        bridge.call("scanForInput", reqParams);
      } else {
        event.stopPropagation();
      }
    };
    bridge.register("getScanResult", (res: string) => {
      const param = inputRef.value as any;
      let scanFieldName = "";
      pageView.value.forEach((view: any) => {
        const key = "DM_" + view.fieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.model = res.substring(res.lastIndexOf("_") + 1);
          scanFieldName = view.fieldName;
        }
      });
      param.forEach((t: any, i: number) => {
        if (pageView.value[i].fieldName == scanFieldName) {
          pageView.value[i].model = pageView.value[i].model.substring(
            0,
            pageView.value[i].length
          );
          t.validate(pageView.value[i].model);
        }
      });
    });
    const onInputKeyUp = (event: KeyboardEvent, index: number) => {
      if (event.code === "Enter" || event.which === 13) {
        const param = inputRef.value as any;
        param.forEach((t: any, i: number) => {
          if (i === index) {
            const inputText = t.$props.modelValue;
            t.validate(inputText).then(() => {
              if (param.length > index + 1) {
                param[index + 1].focus();
              }
            });
          }
          if (index == param.length - 1) {
            position = index;
          }
        });
      }
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const onCloseNotify = () => {
      notifyVisible.value = false;
      router.push("/dataMgmtMixCartonList");
    };
    const onFocus = (val: any) => {
      position = val;
    };
    watch(
      () => store.state.screenModule.softKeyStatus,
      (newVal) => {
        const scrollRef = scrollAreaRef.value as any;
        if (scrollRef) {
          scrollRef.setScrollPercentage("vertical", 0);
        }
        if (newVal && position > 1) {
          setTimeout(() => {
            scrollRef.setScrollPercentage("vertical", 0.95);
          }, 0);
        }
      }
    );
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
      msgCode,
      onConfirmDialog,
      home,
      back,
      inputRef,
      scan,
      validPaste,
      onInputKeyUp,
      notifyVisible,
      onCloseNotify,
      onFocus,
      scrollAreaRef,
    };
  },
});
export default DataMgmtCartonMixedDetail;
</script>

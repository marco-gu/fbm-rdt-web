<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <q-input
            class="card-item-input"
            v-model="profileCode"
            input-class="text-right"
            :input-style="{ fontSize: '15px' }"
            :prefix="$t('profile.profile_text')"
            readonly
            borderless
            dense
          />
          <div class="card-item-input">
            <div>{{ $t("lp.scan_type") }}</div>
            <div>
              <q-radio
                color="secondary"
                v-if="receivingFlag"
                v-model="scanType"
                val="Receiving"
                :label="$t('common.receiving')"
                @click="changeScanType('Receiving')"
              />
              <q-radio
                color="secondary"
                v-if="stuffingFlag"
                v-model="scanType"
                val="Stuffing"
                :label="$t('common.stuffing')"
                @click="changeScanType('Stuffing')"
              />
            </div>
          </div>
          <div v-for="(item, i) in pageViews" :key="i">
            <div v-if="item.display == 1">
              <div class="card-item-input">
                <div>
                  {{ item.displayFieldName }}
                </div>
                <q-input
                  class="card-item-input-field no-shadow"
                  :input-style="{ fontSize: '15px' }"
                  input-class="text-right"
                  ref="inputRef"
                  v-model="item.model"
                  @keyup.enter="onInputKeyUp($event, i)"
                  @paste="validPaste($event, i)"
                  :maxlength="item.length"
                  lazy-rules
                  :rules="[item.valid]"
                  borderless
                  dense
                >
                  <template v-slot:append>
                    <q-avatar
                      v-if="item.scan == 1"
                      @click="scan(item.fieldName, $event)"
                    >
                      <q-img
                        no-transition
                        no-spinner
                        :src="inputScanIcon"
                        width="16px"
                      />
                    </q-avatar>
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-button" id="bottom-button">
      <q-btn no-caps unelevated class="full-width" @click="onSubmit">
        {{ bottomButtonLable }}
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
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import {
  ProfileDisplayAttribute,
  ProfileCartonCommonLevel,
  ProfileOrderLevel,
  ProfileMaster,
} from "@/models/profile";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ViewDisplayAttribute,
  composeViewElement,
  ProfileElementLevel,
  toUpperCaseElementInput,
  validPasteInput,
} from "@/utils/profile.render";
import { useI18n } from "vue-i18n";
import { useStore } from "@/store";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { softKeyPopUp } from "../utils/screen.util";
import inputScan from "../assets/images/input_scan.svg";
import PopupComponent from "@/components/PopupComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
// Define Scan Type
const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}
// Define Validation Type
const enum ValidationType {
  PREVALIDATION = "PreValidation",
  OFFLINE = "Offline",
}
const LpSearchView = defineComponent({
  components: {
    HeaderComponent,
    PopupComponent,
    LoadingComponent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const $q = useQuasar();
    const inputRef = ref(null);
    const i18n = useI18n();
    const profileName = ref("");
    const profileCode = ref("");
    const clientCode = ref("");
    const scanType = ref("");
    const myForm = ref();
    const inputScanIcon = inputScan;
    // Define Page Elements
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const receivingViews = ref([] as ViewDisplayAttribute[]);
    const stuffingViews = ref([] as ViewDisplayAttribute[]);
    // Define Receiving or Stuffing Radio Status
    const receivingFlag = ref(false);
    const stuffingFlag = ref(false);
    const mode = route.params.id as string;
    const bottomButtonLable =
      mode == "online" ? i18n.t("lp.generate") : i18n.t("lp.start_scan");
    const titleParam =
      route.params.id == "online"
        ? i18n.t("lp.lp_search")
        : i18n.t("lp.offline_scan");
    const backUrlParam = "/profile/" + route.params.id;
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
    const type = ref("");
    const msg = ref("");
    const popupVisible = ref(false);
    const canJumpNextPage = ref(false);
    const nextPageParam = ref();
    const loadingStatus = ref(false);
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      // softkey popup
      softKeyPopUp(deviceHeight, "scroll-area", "bottom-button");
      const initData = JSON.parse(
        localStorage.getItem("profile") as never
      ) as ProfileMaster;
      profileName.value = initData.profileName;
      profileCode.value = initData.profileCode;

      clientCode.value = initData.clientCode;
      receivingFlag.value = initData.receivingScanFlag == 1 ? true : false;
      stuffingFlag.value = initData.stuffingScanFlag == 1 ? true : false;
      scanType.value =
        receivingFlag.value == true ? ScanType.RECEIVING : ScanType.STUFFING;
      initData.attributes.forEach((item: ProfileDisplayAttribute) => {
        if (
          item.level == ProfileElementLevel.CARTON_COMMON ||
          item.level == ProfileElementLevel.ORDER
        ) {
          const element = composeViewElement(item);
          if (item.type == ScanType.RECEIVING) {
            receivingViews.value.push(element);
          } else {
            stuffingViews.value.push(element);
          }
        }
      });
      pageViews.value =
        scanType.value == ScanType.RECEIVING
          ? receivingViews.value
          : stuffingViews.value;
      nextTick(() => {
        if (store.state.commonModule.scanDevice !== "camera") {
          const param = inputRef.value as any;
          if (param && param.length > 0) {
            param[0].focus();
          }
        }
      });
    });
    const composeRouteParam = (routeParams: any, source: any) => {
      source.forEach((view: ViewDisplayAttribute) => {
        if (view.display == 1) {
          routeParams[view.displayFieldName] = view.model;
        }
      });
    };
    const composeApiParam = (apiParams: any, source: any, mode: string) => {
      if (mode == "online") {
        apiParams.validationType = ValidationType.PREVALIDATION;
      } else {
        apiParams.validationType = ValidationType.OFFLINE;
      }
      const profileOrderLevel = new ProfileOrderLevel();
      const profileCartonCommonLevel = new ProfileCartonCommonLevel();
      let j: keyof ProfileOrderLevel;
      let k: keyof ProfileCartonCommonLevel;
      for (j in profileOrderLevel) {
        apiParams[j] = "";
      }
      for (k in profileCartonCommonLevel) {
        apiParams[k] = "";
      }
      source.forEach((view: ViewDisplayAttribute) => {
        for (j in profileOrderLevel) {
          if (j == view.fieldName) {
            if (view.model) {
              apiParams[j] = view.model;
            }
          }
        }
        for (k in profileCartonCommonLevel) {
          if (k == view.fieldName) {
            if (view.model) {
              apiParams[k] = view.model;
            }
          }
        }
      });
    };
    const reset = (param: any) => {
      param.forEach((t: any) => {
        if (t.modelValue == "") {
          t.resetValidation();
        } else {
          t.validate(t.modelValue);
        }
      });
    };
    const changeScanType = (val: string) => {
      if (
        (receivingFlag.value && val == ScanType.RECEIVING) ||
        (stuffingFlag.value && val == ScanType.STUFFING)
      ) {
        nextTick(() => {
          reset(inputRef.value);
        });
        pageViews.value =
          scanType.value == ScanType.RECEIVING
            ? receivingViews.value
            : stuffingViews.value;
      }
    };
    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          loadingStatus.value = true;
          // showLoading($q);
          // the same for online & offline
          const routeParams = {
            scanned: 0,
            total: 0,
            taskID: "",
            profileCode: profileCode.value,
            profileName: profileName.value,
            type: "",
          };
          // the same for online & offline
          const apiParams = {
            profileName: profileName.value,
            clientCode: clientCode.value,
            scanType: scanType.value,
            validationType: "",
          };
          composeApiParam(apiParams, pageViews.value, mode);
          composeRouteParam(routeParams, pageViews.value);
          if (mode == "online") {
            bridge.call("fetchLp", apiParams, (res: string) => {
              // closeLoading($q);
              loadingStatus.value = false;
              const androidResponse = JSON.parse(res) as AndroidResponse<any>;
              if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
                routeParams.scanned = androidResponse.data.scanned;
                routeParams.total = androidResponse.data.total;
                routeParams.taskID = androidResponse.data.taskID;
                routeParams.type = scanType.value;
                type.value = "success";
                popupVisible.value = true;
                msg.value = i18n.t("messageCode.E93-05-0005");
                // const message = i18n.t("messageCode.E93-05-0005");
                // popupSuccessMsg($q, message);
                canJumpNextPage.value = true;
                nextPageParam.value = routeParams;
                // setTimeout(() => {
                //   router.push({
                //     name: "scan",
                //     params: routeParams,
                //   });
                // }, 2000);
              } else if (androidResponse.status == AndroidResponseStatus.INFO) {
                // const message = i18n.t(
                //   "messageCode." + androidResponse.messageCode
                // );
                // popupInfoMsg($q, message);
                type.value = "info";
                popupVisible.value = true;
                msg.value = i18n.t(
                  "messageCode." + androidResponse.messageCode
                );
              } else if (
                androidResponse.status == AndroidResponseStatus.ERROR
              ) {
                // const message = i18n.t(
                //   "messageCode." + androidResponse.messageCode
                // );
                // popupErrorMsg($q, message);
                type.value = "error";
                popupVisible.value = true;
                msg.value = i18n.t(
                  "messageCode." + androidResponse.messageCode
                );
              }
            });
          } else {
            bridge.call("createTask", apiParams);
            closeLoading($q);
            pageViews.value.forEach((t) => {
              t.model = "";
            });
            nextTick(() => {
              reset(inputRef.value);
            });
          }
        }
      });
    };
    const OnClosePopUp = () => {
      popupVisible.value = false;
      if (canJumpNextPage.value) {
        router.push({
          name: "scan",
          params: nextPageParam.value,
        });
      }
    };
    // 4- Convert the input data value into upper case if it is not
    const multiWatchSources = [receivingViews.value, stuffingViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const scan = (fieldName: string, event: Event) => {
      const isCamera = store.state.commonModule.scanDevice === "camera";
      if (isCamera) {
        const reqParams = {
          scanType: scanType.value,
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
      if (scanType.value == ScanType.RECEIVING) {
        receivingViews.value.forEach((receivingView: any) => {
          const key = scanType.value + "_" + receivingView.fieldName;
          if (key == res.substring(0, res.lastIndexOf("_"))) {
            receivingView.model = res.substring(res.lastIndexOf("_") + 1);
            scanFieldName = receivingView.fieldName;
          }
        });
        param.forEach((t: any, i: number) => {
          if (receivingViews.value[i].fieldName == scanFieldName) {
            t.validate(receivingViews.value[i].model);
          }
        });
      } else {
        stuffingViews.value.forEach((stuffingView: any) => {
          const key = scanType.value + "_" + stuffingView.fieldName;
          if (key == res.substring(0, res.lastIndexOf("_"))) {
            stuffingView.model = res.substring(res.lastIndexOf("_") + 1);
            scanFieldName = stuffingView.fieldName;
          }
        });
        param.forEach((t: any, i: number) => {
          if (stuffingViews.value[i].fieldName == scanFieldName) {
            t.validate(stuffingViews.value[i].model);
          }
        });
      }
    });
    // onUnmounted(() => {
    //   closeLoading($q);
    // });
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
        });
      }
    };
    return {
      profileCode,
      scanType,
      onSubmit,
      receivingFlag,
      stuffingFlag,
      pageViews,
      changeScanType,
      scan,
      inputRef,
      validPaste,
      bottomButtonLable,
      myForm,
      onInputKeyUp,
      titleParam,
      inputScanIcon,
      backUrlParam,
      type,
      popupVisible,
      msg,
      OnClosePopUp,
      loadingStatus,
    };
  },
});
export default LpSearchView;
</script>

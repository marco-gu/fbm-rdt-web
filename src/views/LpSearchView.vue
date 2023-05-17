<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component> -->
    <common-header-component
      :titles="[
        profileCode,
        route.params.id == 'online'
          ? $t('lp.lp_search')
          : $t('lp.offline_scan'),
      ]"
      :icons="['back', 'clear', 'home']"
      @onHome="homePopup = true"
      @onClear="onClear()"
      @onBack="() => router.push(backUrlParam)"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div class="field">
            <div class="input-title">
              <span class="text">{{ $t("profile.profile_text") }}</span>
            </div>
            <q-input
              class="input-field"
              input-class="text-left"
              v-model="profileCode"
              readonly
              borderless
            >
            </q-input>
          </div>
          <div class="field">
            <div>
              <div class="input-title">
                <span class="text">{{ $t("lp.scan_type") }}</span>
              </div>
              <q-select
                behavior="menu"
                borderless
                class="select-field"
                v-model="scanType"
                :options="options"
              />
            </div>
          </div>
          <div v-for="(item, i) in pageViews" :key="i">
            <div v-if="item.display == 1">
              <div class="field">
                <div class="input-title">
                  <span class="text">{{ item.displayFieldName }}</span>
                </div>
                <q-input
                  class="input-field"
                  input-class="text-left"
                  ref="inputRef"
                  v-model="item.model"
                  @keyup.enter="onInputKeyUp($event, i)"
                  @paste="validPaste($event, i)"
                  :maxlength="item.length"
                  lazy-rules
                  :rules="[item.valid]"
                  borderless
                >
                  <template v-if="item.scan == 1" v-slot:append>
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
    <PopupComponent
      :visible="homePopup"
      :message="$t('common.return_home')"
      :type="'action'"
      @close="
        () => {
          homePopup = false;
          router.push('/home');
        }
      "
      @cancel="homePopup = false"
    />
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
import bridge from "dsbridge";
import { defineComponent, nextTick, onMounted, ref, watch } from "vue";
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
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { setContentHeightWithBtn, softKeyPopUp } from "../utils/screen.util";
import PopupComponent from "@/components/PopupComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import inputScan from "../assets/icon/compress-solid.svg";
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
    CommonHeaderComponent,
    PopupComponent,
    LoadingComponent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const inputRef = ref(null);
    const i18n = useI18n();
    const profileName = ref("");
    const profileCode = ref("");
    const clientCode = ref("");
    const scanType = ref("");
    const myForm = ref();
    const inputScanIcon = ref();
    inputScanIcon.value = inputScan;
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
    const options = ref([]);
    const homePopup = ref(false);

    // const options = [i18n.t("common.receiving"), i18n.t("common.stuffing")];
    onMounted(() => {
      const deviceHeight = store.state.screenModule.screenHeight;
      setContentHeightWithBtn("scroll-area", deviceHeight);
      // calculate scroll area height

      // softkey popup
      softKeyPopUp(deviceHeight, "scroll-area", "bottom-button");
      const initData = JSON.parse(
        localStorage.getItem("profile") as never
      ) as ProfileMaster;
      profileName.value = initData.profileName;
      profileCode.value = initData.profileCode;

      clientCode.value = initData.clientCode;
      receivingFlag.value = initData.receivingScanFlag == 1 ? true : false;
      if (receivingFlag.value) {
        options.value.push(i18n.t("common.receiving") as never);
      }
      stuffingFlag.value = initData.stuffingScanFlag == 1 ? true : false;
      if (stuffingFlag.value) {
        options.value.push(i18n.t("common.stuffing") as never);
      }
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
    // const changeScanType = (val: string) => {
    //   if (
    //     (receivingFlag.value && val == ScanType.RECEIVING) ||
    //     (stuffingFlag.value && val == ScanType.STUFFING)
    //   ) {
    //     nextTick(() => {
    //       reset(inputRef.value);
    //     });
    //     pageViews.value =
    //       scanType.value == ScanType.RECEIVING
    //         ? receivingViews.value
    //         : stuffingViews.value;
    //   }
    // };
    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          loadingStatus.value = true;
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
                canJumpNextPage.value = true;
                nextPageParam.value = routeParams;
              } else if (androidResponse.status == AndroidResponseStatus.INFO) {
                type.value = "info";
                popupVisible.value = true;
                msg.value = i18n.t(
                  "messageCode." + androidResponse.messageCode
                );
              } else if (
                androidResponse.status == AndroidResponseStatus.ERROR
              ) {
                type.value = "error";
                popupVisible.value = true;
                msg.value = i18n.t(
                  "messageCode." + androidResponse.messageCode
                );
              }
            });
          } else {
            bridge.call("createTask", apiParams);
            loadingStatus.value = false;
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
    const onClear = () => {
      myForm.value.reset();
      pageViews.value.forEach((t) => {
        t.model = "";
      });
    };
    watch(
      scanType,
      () => {
        if (
          (receivingFlag.value && scanType.value == ScanType.RECEIVING) ||
          (stuffingFlag.value && scanType.value == ScanType.STUFFING)
        ) {
          nextTick(() => {
            reset(inputRef.value);
          });
          pageViews.value =
            scanType.value == ScanType.RECEIVING
              ? receivingViews.value
              : stuffingViews.value;
        }
      },
      { immediate: true }
    );
    return {
      profileCode,
      scanType,
      onSubmit,
      receivingFlag,
      stuffingFlag,
      pageViews,
      // changeScanType,
      scan,
      inputRef,
      validPaste,
      bottomButtonLable,
      myForm,
      onInputKeyUp,
      inputScanIcon,
      backUrlParam,
      type,
      popupVisible,
      msg,
      OnClosePopUp,
      loadingStatus,
      router,
      route,
      model: ref(null),
      options,
      onClear,
      homePopup,
    };
  },
});
export default LpSearchView;
</script>

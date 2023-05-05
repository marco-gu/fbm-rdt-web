<template>
  <div class="wrapper">
    <common-header-component
      :titles="[titleParam]"
      :icons="['back', 'home']"
      @onHome="onHome"
      @onBack="closeCartonDetail"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
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
                        color="secondary"
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
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('carton.carton_detail_save')"
        @click="onSubmit"
      />
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
  ProfileCartonIndividualLevel,
  ProfileDisplayAttribute,
} from "@/models/profile";
import {
  composeViewElement,
  ViewDisplayAttribute,
  toUpperCaseElementInput,
  validPasteInput,
} from "@/utils/profile.render";
import { calScrollAreaWithBottom, softKeyPopUp } from "@/utils/screen.util";
import bridge from "dsbridge";
import { defineComponent, ref, onBeforeMount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import inputScan from "../assets/images/input_scan.svg";
const CartonDetailView = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const cartonID = ref("99999999999999999999");
    const i18n = useI18n();
    const inputRef = ref(null);
    const inputScanIcon = inputScan;
    const inputScanType = ref("CartonDetail");
    let isCamera = true;
    const msg = ref("");
    const myForm = ref();
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const popupVisible = ref(false);
    const pressHome = ref(false);
    const taskID = ref("");
    const titleParam = ref("");
    const type = ref("");
    const route = useRoute();
    const router = useRouter();
    bridge.register("getCartonDetailParam", (res: string) => {
      const param = JSON.parse(res);
      cartonID.value = param.cartonID;
      taskID.value = param.taskID;
      titleParam.value = `${param.cartonID}: ${i18n.t("common.detail")}`;
    });
    bridge.register("closeCartonDetail", () => {
      closeCartonDetail();
    });
    bridge.register("getScanResult", (res: string) => {
      const param = inputRef.value as any;
      let scanFieldName = "";
      pageViews.value.forEach((pageView: any) => {
        const key = inputScanType.value + "_" + pageView.fieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          pageView.model = res.substring(res.lastIndexOf("_") + 1);
          scanFieldName = pageView.fieldName;
        }
      });
      param.forEach((t: any, i: number) => {
        if (pageViews.value[i].fieldName == scanFieldName) {
          t.validate(pageViews.value[i].model);
        }
      });
    });
    onBeforeMount(() => {
      const param = route.params.id as any;
      const profileName = param.substring(0, param.indexOf("&"));
      const scanType = param.substring(param.indexOf("&") + 1, param.length);
      const args = {
        profileName: profileName,
        scanType: scanType,
      };
      bridge.call("getCartonDetailProfile", args, (res: any) => {
        const cartonDetailProfiles = JSON.parse(
          res
        ) as ProfileDisplayAttribute[];
        cartonDetailProfiles.forEach((item) => {
          const element = composeViewElement(item);
          pageViews.value.push(element);
        });
      });
      bridge.call("getScanDevice", (res: string) => {
        isCamera = res === "camera";
      });
    });
    onMounted(() => {
      // calculate scroll area height
      calScrollAreaWithBottom("scroll-area", "bottom-button");
      // hide bottom button if soft key up
      softKeyPopUp(window.innerHeight, "scroll-area", "bottom-button");
    });
    const composeApiParam = (apiParams: any, source: any[]) => {
      const profileCartonIndividualLevel = new ProfileCartonIndividualLevel();
      let j: keyof ProfileCartonIndividualLevel;
      for (j in profileCartonIndividualLevel) {
        apiParams[j] = "";
      }
      source.forEach((view: ViewDisplayAttribute) => {
        for (j in profileCartonIndividualLevel) {
          if (j == view.fieldName) {
            apiParams[j] = view.model;
          }
        }
      });
    };
    const reset = () => {
      pageViews.value.forEach((t) => {
        t.model = "";
      });
      myForm.value.resetValidation();
    };
    const closeCartonDetail = () => {
      // Step 1: Check is include mandatory field
      let isIncludeMandatory = false;
      pageViews.value.forEach((view) => {
        if (view.mandatory == 1) {
          isIncludeMandatory = true;
        }
      });
      if (!isIncludeMandatory) {
        bridge.call("completeCartonDetail", null, () => {
          reset();
        });
      } else {
        // Step 2: Check input all required field
        myForm.value.validate().then((success: any) => {
          if (success) {
            type.value = "error";
            popupVisible.value = true;
            msg.value = i18n.t("messageCode.E93-08-0001");
          } else {
            type.value = "error";
            popupVisible.value = true;
            msg.value = i18n.t("messageCode.E93-08-0002");
          }
        });
      }
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          const apiParams = {
            cartonID: cartonID.value,
            taskID: taskID.value,
          };
          composeApiParam(apiParams, pageViews.value);
          bridge.call("addCartonDetail", apiParams, () => {
            reset();
          });
        }
      });
    };
    const multiWatchSources = [pageViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const scan = (fieldName: string, event: Event) => {
      if (isCamera) {
        const reqParams = {
          scanType: inputScanType.value,
          fieldName: fieldName,
        };
        bridge.call("scanForInput", reqParams);
      } else {
        event.stopPropagation();
      }
    };
    const OnClose = () => {
      popupVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      }
    };
    const onHome = () => {
      pressHome.value = true;
      popupVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    return {
      closeCartonDetail,
      inputRef,
      inputScanIcon,
      msg,
      myForm,
      OnClose,
      onHome,
      onSubmit,
      pageViews,
      popupVisible,
      router,
      scan,
      titleParam,
      type,
      validPaste,
    };
  },
});
export default CartonDetailView;
</script>

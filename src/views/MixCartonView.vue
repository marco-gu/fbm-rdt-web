<template>
  <div class="wrapper">
    <common-header-component
      :titles="[`${cartonID}: ${$t('carton.item')}${itemCount}`]"
      :icons="['back', 'home', 'empty']"
      @onHome="onHome"
      @onBack="onBack"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div v-for="(item, i) in pageViews" :key="i" class="container">
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
        :label="$t('carton.mix_carton_add')"
        @click="onSubmit"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('carton.mix_carton_complete')"
        @click="complete"
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
  ProfileDisplayAttribute,
  ProfileMixCartonLevel,
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
import inputScan from "../assets/icon/compress-solid.svg";
const MixCartonView = defineComponent({
  components: {
    PopupComponent,
    CommonHeaderComponent,
  },
  setup() {
    const cartonID = ref("99999999999999999999");
    const completeMixCarton = ref(false);
    const i18n = useI18n();
    const inputRef = ref(null);
    const inputScanIcon = inputScan;
    const inputScanType = ref("MixCarton");
    const itemCount = ref(1);
    const msg = ref("");
    const myForm = ref();
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const popupVisible = ref(false);
    const pressHome = ref(false);
    const route = useRoute();
    const router = useRouter();
    const scanType = ref("");
    const taskID = ref("");
    const type = ref("");
    let isCamera = true;
    bridge.register("getMixCartonParam", (res: string) => {
      const mixCartonParam = JSON.parse(res);
      cartonID.value = mixCartonParam.cartonID;
      scanType.value = mixCartonParam.scanType;
      taskID.value = mixCartonParam.taskID;
      fetchCartonProducts();
    });
    const fetchCartonProducts = () => {
      bridge.call(
        "fetchCartonProducts",
        {
          cartonId: cartonID.value,
          taskId: taskID.value,
          scanType: scanType.value,
        },
        (res) => {
          const mixCartonItems = JSON.parse(res) as any[];
          if (mixCartonItems.length > 0) {
            navigateToSummaryPage();
          } else {
            // if scan a new carton (0 carton product) for the 2nd time, will still in mixCartonSummary page, should be in mixCarton page
            navigateToMixCartonPage();
          }
        }
      );
    };
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
    // bridge.register("closeMixCarton", () => {
    //   closeMixCarton();
    // });
    onBeforeMount(() => {
      const param = route.params.id as any;
      const args = {
        profileName: param.substring(0, param.indexOf("&")),
        scanType: param.substring(param.indexOf("&") + 1, param.length),
      };
      bridge.call("getMixCartonProfile", args, (res: any) => {
        const mixProfiles = JSON.parse(res) as ProfileDisplayAttribute[];
        mixProfiles.forEach((item) => {
          const element = composeViewElement(item);
          pageViews.value.push(element);
        });
      });
      bridge.call("getScanDevice", (res: string) => {
        isCamera = res === "camera";
      });
    });
    onMounted(() => {
      calScrollAreaWithBottom("scroll-area", "bottom-button");
      softKeyPopUp(window.innerHeight, "scroll-area", "bottom-button");
      arrangeRouteParams();
    });
    const arrangeRouteParams = () => {
      if (
        route.params.from === "mixCartonSummary" ||
        route.params.from === "mixCarton"
      ) {
        cartonID.value = route.params.cartonID as string;
        taskID.value = route.params.taskID as string;
        scanType.value = route.params.scanType as string;
        itemCount.value = parseInt(route.params.itemCount as string);
      }
    };
    const complete = () => {
      completeMixCarton.value = true;
      onSubmit();
    };
    const reset = () => {
      pageViews.value.forEach((t) => {
        t.model = "";
      });
      myForm.value.resetValidation();
    };
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
    const composeApiParam = (apiParams: any, source: any[]) => {
      const profileMixCartonLevel = new ProfileMixCartonLevel();
      let j: keyof ProfileMixCartonLevel;
      for (j in profileMixCartonLevel) {
        apiParams[j] = "";
      }
      source.forEach((view: ViewDisplayAttribute) => {
        for (j in profileMixCartonLevel) {
          if (j == view.fieldName) {
            apiParams[j] = view.model;
          }
        }
      });
    };
    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          const apiParams = {
            cartonID: cartonID.value,
            scanType: scanType.value,
            taskID: taskID.value,
          };
          composeApiParam(apiParams, pageViews.value);
          bridge.call("addMixCarton", apiParams, () => {
            if (completeMixCarton.value) {
              completeMixCarton.value = false;
              navigateToSummaryPage();
            } else {
              itemCount.value++;
              reset();
            }
          });
        }
      });
    };
    const closeMixCarton = () => {
      if (itemCount.value == 0) {
        // Step 1: Check is include mandatory field
        let isIncludeMandatory = false;
        pageViews.value.forEach((view) => {
          if (view.mandatory == 1) {
            isIncludeMandatory = true;
          }
        });
        if (!isIncludeMandatory) {
          // bridge.call("completeMixCarton", null, () => {
          //   reset();
          // });
        } else {
          // Step 2: Check input all required field
          myForm.value.validate().then((success: any) => {
            if (success) {
              type.value = "error";
              popupVisible.value = true;
              msg.value = i18n.t("messageCode.E93-07-0001");
            } else {
              type.value = "error";
              popupVisible.value = true;
              msg.value = i18n.t("messageCode.E93-07-0002");
            }
          });
        }
      } else {
        // bridge.call("completeMixCarton", null, () => {
        //   reset();
        // });
      }
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const multiWatchSources = [pageViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const navigateToSummaryPage = () => {
      router.push({
        name: "mixCartonSummary",
        params: {
          id: route.params.id,
          cartonID: cartonID.value,
          taskID: taskID.value,
          scanType: scanType.value,
        },
      });
    };
    const navigateToMixCartonPage = () => {
      router.push({
        name: "mixCarton",
        params: {
          id: route.params.id,
          from: "mixCarton",
          cartonID: cartonID.value,
          taskID: taskID.value,
          scanType: scanType.value,
          itemCount: 1,
        },
      });
    };
    const onBack = () => {
      navigateToSummaryPage();
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
      cartonID,
      complete,
      inputRef,
      inputScanIcon,
      itemCount,
      msg,
      myForm,
      onBack,
      OnClose,
      onSubmit,
      onHome,
      pageViews,
      popupVisible,
      scan,
      type,
      validPaste,
    };
  },
});
export default MixCartonView;
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

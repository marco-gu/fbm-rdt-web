<template>
  <div class="wrapper">
    <!-- <header-component
      :titleParam="titleParam"
      :backFunctionParam="closeMixCarton"
      :homeVisibleParam="false"
    >
    </header-component> -->
    <common-header-component
      :titles="[titleParam]"
      :icons="['home', 'clear']"
      @onHome="() => router.push('/home')"
      @onClear="onClear()"
    />
    <div class="page-content">
      <div class="sub-title-card">
        <div>{{ cartonID }}</div>
        <div>{{ $t("carton.item_count") }}: {{ itemCount }}</div>
      </div>
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
                        :color="secondary"
                        no-transition
                        no-spinner
                        :src="inputScanIcon"
                        width="12px"
                      />
                    </q-avatar>
                  </template>
                </q-input>
              </div>
              <!-- <div class="card-item-input">
                <div>
                  {{ item.displayFieldName }}
                </div>
                <q-input
                  class="card-item-input-field no-shadow"
                  :input-style="{ fontSize: '15px' }"
                  input-class="text-right"
                  ref="inputRef"
                  v-model="item.model"
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
              </div> -->
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
      @close="popupVisible = false"
    ></PopupComponent>
    <q-dialog v-model="dialogVisible" persistent>
      <div class="dialog-container">
        <div class="dialog-container__content">
          {{ $t("carton.add_mix_carton") }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button cancel" @click="onClose">
            {{ $t("carton.mix_carton_complete") }}
          </button>
          <button class="dialog-button confirm" @click="onConfirm">
            {{ $t("carton.mix_carton_add") }}
          </button>
        </div>
      </div>
    </q-dialog>
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
import { useRoute } from "vue-router";
import inputScan from "../assets/icon/compress-solid.svg";
const MixCartonView = defineComponent({
  components: {
    PopupComponent,
    CommonHeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref("99999999999999999999");
    const lastCartonID = ref("99999999999999999999");
    const itemCount = ref(0);
    const inputRef = ref(null);
    const dialogVisible = ref(false);
    const scanType = ref("");
    const completeMixCarton = ref(false);
    const taskID = ref("");
    const myForm = ref();
    const titleParam = i18n.t("carton.mix_carton_header");
    const route = useRoute();
    let isCamera = true;
    const inputScanIcon = inputScan;
    const type = ref("");
    const msg = ref("");
    const popupVisible = ref(false);
    const inputScanType = ref("MixCarton");
    bridge.register("getMixCartonParam", (res: string) => {
      const mixCartonParam = JSON.parse(res);
      cartonID.value = mixCartonParam.cartonID;
      scanType.value = mixCartonParam.scanType;
      taskID.value = mixCartonParam.taskID;
      if (lastCartonID.value != cartonID.value) {
        itemCount.value = 0;
        lastCartonID.value = cartonID.value;
      }
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
    bridge.register("closeMixCarton", () => {
      closeMixCarton();
    });
    onBeforeMount(() => {
      const param = route.params.id as any;
      const profileName = param.substring(0, param.indexOf("&"));
      const scanType = param.substring(param.indexOf("&") + 1, param.length);
      const args = {
        profileName: profileName,
        scanType: scanType,
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
      // calculate scroll area height
      calScrollAreaWithBottom("scroll-area", "bottom-button");
      // hide bottom button if soft key up
      softKeyPopUp(window.innerHeight, "scroll-area", "bottom-button");
    });
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
              bridge.call("completeMixCarton", null, () => {
                itemCount.value++;
                reset();
              });
            } else {
              dialogVisible.value = true;
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
          bridge.call("completeMixCarton", null, () => {
            reset();
          });
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
        bridge.call("completeMixCarton", null, () => {
          reset();
        });
      }
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const multiWatchSources = [pageViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const onConfirm = () => {
      dialogVisible.value = false;
      itemCount.value++;
      reset();
    };
    const onClose = () => {
      dialogVisible.value = false;
      bridge.call("completeMixCarton", null, () => {
        itemCount.value++;
        reset();
      });
    };
    return {
      onClose,
      onConfirm,
      onSubmit,
      complete,
      pageViews,
      itemCount,
      cartonID,
      inputRef,
      closeMixCarton,
      validPaste,
      scan,
      dialogVisible,
      myForm,
      titleParam,
      inputScanIcon,
      type,
      popupVisible,
      msg,
    };
  },
});
export default MixCartonView;
</script>
<style lang="scss" scoped>
.sub-title-card {
  flex-direction: column;
}
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

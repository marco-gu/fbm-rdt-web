<template>
  <div class="wrapper">
    <header-component
      :titleParam="titleParam"
      :backFunctionParam="closeMixCarton"
      :homeVisibleParam="false"
    >
    </header-component>
    <div class="page-content">
      <div class="sub-title-card">
        <div>{{ cartonID }}</div>
        <div>{{ $t("carton.item_count") }}: {{ itemCount }}</div>
      </div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
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
                  @paste="validPaste($event, i)"
                  clearable
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
                      <q-icon name="qr_code_scanner" size="16px" />
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
import HeaderComponent from "@/components/HeaderComponent.vue";
import {
  ProfileDisplayAttribute,
  ProfileMixCartonLevel,
} from "@/models/profile";
import { popupErrorMsg } from "@/plugin/popupPlugins";
import {
  composeViewElement,
  ViewDisplayAttribute,
  toUpperCaseElementInput,
  validPasteInput,
} from "@/utils/profile.render";
import { softKeyPopUp } from "@/utils/screen.util";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, ref, onBeforeMount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
const MixCartonView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref("99999999999999999999");
    const itemCount = ref(0);
    const $q = useQuasar();
    const inputRef = ref(null);
    const dialogVisible = ref(false);
    const scanType = ref("");
    const completeMixCarton = ref(false);
    const lastCartonID = ref("99999999999999999999");
    const myForm = ref();
    const titleParam = i18n.t("carton.mix_carton_header");
    const route = useRoute();
    let isCamera = true;
    bridge.register("getMixCartonParam", (res: string) => {
      const mixCartonParam = JSON.parse(res);
      cartonID.value = mixCartonParam.cartonID;
      scanType.value = mixCartonParam.scanType;
      if (lastCartonID.value != cartonID.value) {
        itemCount.value = 0;
        lastCartonID.value = cartonID.value;
      }
    });
    bridge.register("getScanResult", (res: string) => {
      const param = inputRef.value as any;
      let scanFieldName = "";
      pageViews.value.forEach((pageView: any) => {
        const key = "Default_" + pageView.fieldName;
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
      const args = {
        profileName: route.params.id,
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
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      // hide bottom button if soft key up
      softKeyPopUp(deviceHeight, "scroll-area", "bottom-button");
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
          scanType: "Default",
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
            const message = i18n.t("messageCode.E93-07-0001");
            popupErrorMsg($q, message);
          } else {
            const message = i18n.t("messageCode.E93-07-0002");
            popupErrorMsg($q, message);
          }
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
    };
  },
});
export default MixCartonView;
</script>
<style lang="scss" scoped>
.sub-title-card {
  flex-direction: column;
}
</style>

<template>
  <div class="wrapper">
    <header-component
      :titleParam="titleParam"
      :backFunctionParam="closeCartonDetail"
      :homeVisibleParam="false"
    >
    </header-component>
    <div class="page-content">
      <div class="sub-title-card">
        {{ cartonID }}
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
        :label="$t('carton.carton_detail_cancel')"
        @click="back"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('carton.carton_detail_save')"
        @click="onSubmit"
      />
    </div>
  </div>
</template>
<script lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
import {
  ProfileCartonIndividualLevel,
  ProfileDisplayAttribute,
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
const CartonDetailView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref("99999999999999999999");
    const $q = useQuasar();
    const inputRef = ref(null);
    const myForm = ref();
    let isCamera = true;
    const titleParam = i18n.t("carton.carton_detail_header");
    const route = useRoute();
    bridge.register("getCartonDetailParam", (res: string) => {
      const cartonDetailParam = JSON.parse(res);
      cartonID.value = cartonDetailParam.cartonID;
    });
    bridge.register("closeCartonDetail", () => {
      closeCartonDetail();
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
    onBeforeMount(() => {
      const args = {
        profileName: route.params.id,
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
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      // hide bottom button if soft key up
      softKeyPopUp(deviceHeight, "scroll-area", "bottom-button");
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
            const message = i18n.t("messageCode.E93-08-0001");
            popupErrorMsg($q, message);
          } else {
            const message = i18n.t("messageCode.E93-08-0002");
            popupErrorMsg($q, message);
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
          scanType: "Default",
          fieldName: fieldName,
        };
        bridge.call("scanForInput", reqParams);
      } else {
        event.stopPropagation();
      }
    };
    return {
      cartonID,
      pageViews,
      closeCartonDetail,
      onSubmit,
      inputRef,
      validPaste,
      scan,
      myForm,
      titleParam,
    };
  },
});
export default CartonDetailView;
</script>

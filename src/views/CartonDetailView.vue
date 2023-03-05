<template>
  <div class="wrapper">
    <header-component
      :titleParam="titleParam"
      :backFunctionParam="back"
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
  CartonDetailAttribute,
  ProfileCartonIndividualLevel,
} from "@/models/profile";
import { popupErrorMsg } from "@/plugin/popupPlugins";
import {
  composeViewElement,
  ProfileElementLevel,
  ViewDisplayAttribute,
  toUpperCaseElementInput,
  validPasteInput,
} from "@/utils/profile.render";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, ref, onBeforeMount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const CartonDetailView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref();
    const $q = useQuasar();
    let alreadyRendered = false;
    let cartonView = {} as CartonDetailAttribute;
    const inputRef = ref(null);
    const myForm = ref();
    let isCamera = true;
    const titleParam = i18n.t("carton.carton_detail_header");
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      // hide bottom button if soft key up
      window.onresize = () => {
        const resizeHeight = window.innerHeight;
        scrollArea.style.height = resizeHeight - scrollArea.offsetTop + "px";
        const bottom = document.getElementById("bottom-button") as any;
        if (deviceHeight - window.innerHeight > 0) {
          bottom.style.visibility = "hidden";
        } else {
          bottom.style.visibility = "visible";
        }
      };
    });
    onBeforeMount(() => {
      bridge.call("getScanDevice", (res: string) => {
        isCamera = res === "camera";
      });
    });
    bridge.register("closeCartonDetail", () => {
      back();
    });
    if (alreadyRendered == false) {
      bridge.register("getCartonDetail", (res: string) => {
        cartonView = JSON.parse(res);
        if (!alreadyRendered) {
          alreadyRendered = true;
          cartonView.profileDetails.forEach((item) => {
            if (item.level == ProfileElementLevel.CARTON_INDIVIDUAL) {
              const element = composeViewElement(item);
              pageViews.value.push(element);
            }
          });
        }
        cartonID.value = cartonView.cartonID;
      });
    }
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
    const back = () => {
      let allowReturn = true;
      pageViews.value.forEach((view) => {
        if (view.mandatory == 1) {
          allowReturn = false;
          return;
        }
      });
      if (!allowReturn) {
        const message = "Don't allow to miss the input";
        popupErrorMsg($q, message);
      } else {
        bridge.call("completeCartonDetail", null, () => {
          reset();
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
    return {
      cartonID,
      pageViews,
      back,
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

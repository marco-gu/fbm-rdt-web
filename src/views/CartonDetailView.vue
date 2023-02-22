<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("carton.carton_detail_header") }}
        </div>
      </div>
      <div class="card-sub-title">
        {{ cartonID }}
      </div>
    </div>
    <div class="content">
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
                  <q-avatar @click="scan(item.fieldName)">
                    <q-icon name="qr_code_scanner" size="16px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </q-form>
    </div>
    <div class="bottom" id="bottom-button">
      <q-btn
        no-caps
        unelevated
        @click="onSubmit"
        class="full-width"
        color="secondary"
        :label="$t('carton.carton_detail_save')"
      />
      <q-btn
        no-caps
        unelevated
        @click="back"
        class="full-width"
        text-color="#757575"
        color="white"
        outline
        :label="$t('carton.carton_detail_cancel')"
      />
    </div>
  </div>
</template>
<script lang="ts">
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
import { defineComponent, nextTick, ref } from "vue";
import arrowImg from "../assets/images/arrow.svg";
const CartonDetailView = defineComponent({
  setup() {
    window.onresize = () => {
      const bottom = document.getElementById("bottom-button") as any;
      if (originalHeight - window.innerHeight > 0) {
        bottom.style.visibility = "hidden";
      } else {
        bottom.style.visibility = "visible";
      }
    };
    const originalHeight = window.innerHeight;
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref();
    const $q = useQuasar();
    let alreadyRendered = false;
    let cartonView = {} as CartonDetailAttribute;
    const inputRef = ref(null);
    const arrowIcon = arrowImg;
    const myForm = ref();
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
    const reset = (param: any) => {
      pageViews.value.forEach((t) => {
        t.model = "";
      });
      param.forEach((t: any) => {
        if (t) {
          t.resetValidation();
        }
      });
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
          nextTick(() => {
            reset(inputRef.value);
          });
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
            nextTick(() => {
              reset(inputRef.value);
            });
          });
        }
      });
    };
    const multiWatchSources = [pageViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const scan = (fieldName: string) => {
      const reqParams = {
        scanType: "Default",
        fieldName: fieldName,
      };
      bridge.call("scanForInput", reqParams);
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
      arrowIcon,
      myForm,
    };
  },
});
export default CartonDetailView;
</script>
<style lang="scss" scoped>
.content {
  margin-top: $--page-content-margin-top-no-search;
}
.bottom {
  position: fixed;
  bottom: 20px;
  .q-btn:nth-child(2) {
    margin-top: 10px;
  }
}
</style>

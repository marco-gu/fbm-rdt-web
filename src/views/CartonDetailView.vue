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
    </div>
    <div class="content">
      <div class="carton-info">
        <span>{{ cartonID }}</span>
      </div>
      <q-form @submit="onSubmit" ref="myForm">
        <div>
          <div v-for="(item, i) in pageViews" :key="i">
            <div v-if="item.display == 1">
              <div class="item-container mb-15">
                <div>
                  {{ item.displayFieldName }}
                </div>
                <q-input
                  ref="inputRef"
                  v-model="item.model"
                  @paste="validPaste($event, i)"
                  clearable
                  :maxlength="item.length"
                  input-class="text-right"
                  lazy-rules
                  :rules="[item.valid]"
                  borderless
                  dense
                  class="common-input no-shadow"
                >
                  <template v-slot:append>
                    <q-avatar @click="scan(item.fieldName)">
                      <q-icon name="qr_code_scanner" size="18px" />
                    </q-avatar>
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </div>
      </q-form>
    </div>
    <div class="button-bottom">
      <div>
        <q-btn
          no-caps
          unelevated
          @click="onSubmit"
          class="full-width"
          color="secondary"
          :label="$t('carton.carton_detail_save')"
        />
      </div>
      <div class=".mt-23">
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
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const CartonDetailView = defineComponent({
  setup() {
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref();
    const $q = useQuasar();
    let alreadyRendered = false;
    let cartonView = {} as CartonDetailAttribute;
    const inputRef = ref(null);
    const homeIcon = homeImg;
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
      homeIcon,
      arrowIcon,
      myForm,
    };
  },
});
export default CartonDetailView;
</script>
<style lang="scss" scoped>
.content {
  padding: 0 20px;
  margin-top: 26px;
  min-height: 600px;
}
.carton-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  background: #00243d;
  color: #fff;
  flex-flow: column;
  margin-bottom: 23px;
  border-radius: 5px;
  height: 45px;
}
.common-input {
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  font-size: 18px;
  height: 50px;
  padding-top: 5px;
  padding-left: 15px;
  padding-right: 15px;
  &.no-shadow {
    box-shadow: none;
  }
}
.button-bottom {
  position: absolute;
  margin: 0 20px;
  bottom: 20px;
  width: calc(100% - 40px);
}
.mb-15 {
  margin-bottom: 20px;
}
.item-container {
  text-align: left;
  height: 50px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
}
.mt-23 {
  margin-top: 20px;
}
</style>

<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <q-img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("carton.carton_detail_header") }}
        </div>
      </div>
    </div>
    <!-- <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back()">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Carton Detail</span>
        </q-item-section>
      </q-item>
    </div> -->
    <!-- <q-separator color="grey-5" /> -->
    <div class="carton-info">
      <span>{{ cartonID }}</span>
    </div>
    <q-form @submit="onSubmit">
      <div v-for="(item, i) in pageViews" :key="i">
        <div v-if="item.display == 1">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span style="padding-left: 1rem; color: black">
              {{ item.displayFieldName }}
            </span>

            <q-input
              ref="inputRef"
              v-model="item.model"
              @paste="validPaste($event, i)"
              clearable
              input-class="text-right"
              lazy-rules
              :rules="[item.valid]"
              :maxlength="item.length"
              borderless
              style="padding: 0px 16px"
            >
              <template v-slot:append>
                <q-avatar v-if="item.scan == 1" @click="scan(item.fieldName)">
                  <q-icon name="qr_code_scanner" />
                </q-avatar>
              </template>
            </q-input>
          </div>
          <q-separator color="grey-5" />
        </div>
      </div>
      <div class="bottom">
        <q-btn no-caps style="width: 48%" flat push type="submit">Save</q-btn>
        <q-separator vertical inset color="white" />
        <q-btn no-caps style="width: 52%" flat push @click="back">Cancel</q-btn>
      </div>
    </q-form>
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
      const apiParams = {
        cartonID: cartonID.value,
      };
      composeApiParam(apiParams, pageViews.value);
      bridge.call("addCartonDetail", apiParams, () => {
        nextTick(() => {
          reset(inputRef.value);
        });
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
    };
  },
});
export default CartonDetailView;
</script>
<style lang="scss" scoped>
// .wrapper {
//   height: 100vh;
//   display: flex;
//   flex-flow: column;
//   background: rgb(233, 229, 229);
// }
// .header {
//   display: flex;
//   background: #fff;
//   justify-content: space-around;
//   height: 60px;
//   align-items: center;
// }
.carton-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  background: #00243d;
  color: #fff;
  flex-flow: column;
}

.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  background: #42b0d5;
  color: white;
  width: 100%;
  height: 50px;
}
</style>

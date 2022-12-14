<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Data Management</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
    </div>

    <q-separator color="grey-5" />

    <div>
      <q-item class="taskIdHeader">
        <q-item-section>
          {{ taskId }}
        </q-item-section>
      </q-item>
    </div>

    <div>
      <div v-for="(item, i) in dynamicViews" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
          "
        >
          <span style="padding-left: 1rem; color: black">
            {{ item.dataFieldName }}
          </span>
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
            style="padding: 0px 16px"
          >
            <template v-slot:append>
              <q-avatar v-if="item.scan == 1" @click="scan(item.dataFieldName)">
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <div
          v-show="item.editable === false && pageType === 'Detail'"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            height: 48.3px;
          "
        >
          <span style="padding-left: 1rem; color: #757575">
            {{ item.dataFieldName }}
          </span>
          <div style="padding: 0px 16px; color: #757575">
            {{ item.model }}
          </div>
        </div>
        <q-separator color="grey-5" />
      </div>
    </div>

    <div class="bottom row">
      <q-btn
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        push
        label="Save"
        @click="deleteProfile"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        type="submit"
        push
        label="Delete"
        @click="cancelEditMode"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        v-show="pageType == 'Detail'"
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        type="submit"
        push
        label="Mix"
        @click="goToMix"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Carton, DisplayAttribute } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";
import { composeReg } from "../utils/regUtil";

// Define Display Attribute
const enum DisplayAttributesLevel {
  ORDER = "order",
  CARTON_COMMON = "cartoncommon",
  CARTON_INDIVIDUAL = "cartonindividual",
}

type ViewElement = {
  dataFieldName: string;
  level: string;
  mandatory: number;
  model: Ref<unknown>;
  reg: RegExp;
  display: number;
  scan: number;
  length: number;
  editable: boolean;
  valid: (val: string) => Promise<unknown>;
};

// Define fields for both manual type-in or scanning for SO, the rests are based on scan profile definition
const scanOrTypeInList = ["SO"];

const DataManagementDetailView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    const taskId = ref(route.query.taskId);
    const scanType =
      taskId.value?.indexOf("Receiving") !== -1 ? "Receiving" : "Stuffing";

    const cartonDetail = JSON.parse(
      localStorage.getItem("dataMgmtCarton") as never
    ) as Carton;

    const soId = ref(route.query.soId);
    var pageType = ref(route.query.pageType);

    const dynamicViews: Ref<ViewElement[]> = ref([]);

    //taskId.value = "NIKE_SGN5727886_4700522258_Receiving";
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

    const profileAttrListDisplay: Ref<DisplayAttribute[]> = ref([]);
    const search = ref("");

    const goToMix = () => {
      router.push({
        path: "/dataMgmtMixEdit",
        query: {
          taskId: taskId.value,
        },
      });
    };

    const back = () => {
      router.push({
        path: "/dataMgmtGD",
        query: {
          taskId: taskId.value,
          pageType: pageType.value,
        },
      });
    };

    const getProfileDetailAttrList = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      bridge.call("fetchProfileByProfileCode", args, (res: string) => {
        profileAttrListDisplay.value = JSON.parse(res) as DisplayAttribute[];
        profileAttrListDisplay.value.forEach((attr: DisplayAttribute) => {
          if (attr.type == scanType) {
            const element = composeViewElements(attr);
            if (element) {
              dynamicViews.value.push(element);
            }
          }
        });
      });
    };

    // Compose View
    const composeViewElements = (attr: DisplayAttribute) => {
      if (
        attr.level == DisplayAttributesLevel.CARTON_COMMON ||
        attr.level == DisplayAttributesLevel.ORDER ||
        attr.level == DisplayAttributesLevel.CARTON_INDIVIDUAL
      ) {
        const viewElement = {} as ViewElement;
        viewElement.dataFieldName = attr.dataFieldName;
        viewElement.editable = false;
        switch (viewElement.dataFieldName) {
          case "PO":
            viewElement.model = ref(cartonDetail.po);
            break;
          case "SO":
            viewElement.model = ref(cartonDetail.so);
            viewElement.editable = true;
            break;
          case "CartonID":
            viewElement.model = ref(cartonDetail.cartonId);
            break;
          case "ContainerNumber":
            viewElement.model = ref(cartonDetail.containerNumber);
            break;
          case "Style":
            viewElement.model = ref(cartonDetail.style);
            break;
          case "Quantity":
            viewElement.model = ref(cartonDetail.quantity);
            break;
          case "HUB":
            viewElement.model = ref(cartonDetail.hub);
            break;
          default:
            break;
        }
        viewElement.level = attr.level;
        viewElement.mandatory = attr.mandatory;

        viewElement.reg = new RegExp(composeReg(attr.format));
        viewElement.display = attr.combo;
        viewElement.scan = attr.scan == "1" ? 1 : 0;
        viewElement.length = Math.abs(attr.maxLength);
        scanOrTypeInList.forEach((t) => {
          if (t == viewElement.dataFieldName) {
            viewElement.scan = 1;
          }
        });
        viewElement.valid = (val: string) => {
          return new Promise((resolve) => {
            if (viewElement.mandatory == 1 && !val) {
              resolve(`Please input ${viewElement.dataFieldName}`);
            } else {
              if (attr.maxLength < 0 && val.length > Math.abs(attr.maxLength)) {
                resolve(
                  `Please input not more than ${Math.abs(
                    attr.maxLength
                  )} charactors`
                );
              } else if (attr.maxLength > 0 && val.length != attr.maxLength) {
                resolve(
                  `Please input not more or less than ${attr.maxLength} charactors`
                );
              } else if (!viewElement.reg.test(val)) {
                resolve("Please input correct format");
              } else {
                resolve(true);
              }
            }
          });
        };
        return viewElement;
      }
    };

    onMounted(() => {
      if (typeof taskId.value === "string") {
        getProfileDetailAttrList(taskId.value);
      }
    });

    return {
      router,
      goToMix,
      search,
      back,
      taskId,
      soId,
      pageType,
      getProfileDetailAttrList,
      dynamicViews,
      cartonDetail,
    };
  },
});
export default DataManagementDetailView;
</script>
<style lang="scss" scoped>
.wrapper {
  background-color: #e5e5e5;
  height: 100vh;
  .header {
    display: flex;
    background: #fff;
    justify-content: space-around;
    height: 60px;
    align-items: center;
  }
  .search {
    background: #fff;
    height: 60px;
    width: 100%;
  }
  .q-item {
    background-color: #fff;
    text-align: left;
    width: 100%;
  }
  .taskIdHeader {
    background: #040000;
    color: #ffffff;
    height: 47px;
    text-align: center;
    font-size: 13.3px;
  }
  .tab {
    background: #040000;
    color: #ffffff;
    height: 48.3px;
    text-align: center;
    font-size: 16px;
  }
  .list {
    background: #ffffff;
    color: gray;
    height: 50.6px;
    text-align: center;
    font-size: 16px;
  }
}
.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  width: 100%;
  height: 50px;
}
</style>

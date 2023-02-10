<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("dataManagement.mix_title") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="task-id">
      <span>{{ taskId }}</span>
    </div>
    <q-form @submit="handleSave">
      <div class="mix-carton-container">
        <div v-for="(item, i) in dynamicViews" :key="i">
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
              :maxlength="item.length"
              input-class="text-right"
              lazy-rules
              :rules="[item.valid]"
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
        <q-btn
          no-caps
          style="width: 48%"
          flat
          push
          :label="$t('common.save')"
          type="submit"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          no-caps
          style="width: 48%"
          flat
          push
          :label="$t('common.delete')"
          @click="handleDelete"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          no-caps
          style="width: 48%"
          flat
          type="submit"
          push
          :label="$t('common.cancel')"
          @click="back"
        />
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useI18n } from "@/plugin/i18nPlugins";
import { useRoute, useRouter } from "vue-router";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import {
  ViewDisplayAttribute,
  composeViewElement,
  ProfileElementLevel,
  composeReg,
} from "@/utils/profile.render";
import { ProfileDisplayAttribute, MixCartonProduct } from "@/models/profile";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}

const DataManagementMixCartonView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const lpId = ref(route.query.lpId);
    const taskId = ref(route.query.taskId);
    const cartonId = ref(route.query.cartonId);
    const scanType = ref("");
    const inputRef = ref(null);
    const dynamicViews: Ref<ViewDisplayAttribute[]> = ref([]);
    const mixCartonProduct = ref();
    const profileAttrListDisplay: Ref<ProfileDisplayAttribute[]> = ref([]);
    const pageTitle = ref("");
    const cancelLabel = ref("");
    const deleteLabel = ref("");
    const saveLabel = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    onMounted(() => {
      if (route.query.taskId) {
        scanType.value =
          route.query.taskId.indexOf(ScanType.RECEIVING) !== -1
            ? ScanType.RECEIVING
            : ScanType.STUFFING;
      }
      getProfile();
      mixCartonProduct.value = JSON.parse(
        localStorage.getItem("mixCartonProduct") as never
      ) as MixCartonProduct;
    });
    const getProfile = () => {
      const args = {
        taskId: taskId.value,
      };
      bridge.call("fetchProfileByProfileCode", args, (res: string) => {
        profileAttrListDisplay.value = JSON.parse(
          res
        ) as ProfileDisplayAttribute[];
        profileAttrListDisplay.value.forEach(
          (attr: ProfileDisplayAttribute) => {
            if (
              attr.type == scanType.value &&
              attr.level == ProfileElementLevel.CARTON_UPC
            ) {
              const element = composeViewElement(attr);

              switch (element.fieldName) {
                case "UPC":
                  element.model.value = mixCartonProduct.value.upc;
                  break;
                case "Color":
                  element.model.value = mixCartonProduct.value.color;
                  break;
                case "Style":
                  element.model.value = mixCartonProduct.value.style;
                  break;
                case "Size":
                  element.model.value = mixCartonProduct.value.size;
                  break;
                case "Quantity":
                  element.model.value = mixCartonProduct.value.quantity;
                  break;
                default:
                  break;
              }

              dynamicViews.value.push(element);
            }
          }
        );
      });
    };

    const scan = (fieldName: string) => {
      const reqParams = {
        scanType: scanType.value,
        fieldName: fieldName,
      };
      bridge.call("scanForInput", reqParams);
    };

    bridge.register("getScanResult", (res: string) => {
      dynamicViews.value.forEach((view: any) => {
        const key = scanType.value + "_" + view.fieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.model = res.substring(res.lastIndexOf("_") + 1);
        }
      });
    });

    const back = () => {
      router.push({
        path: "/dataManagementMixCartonList",
        query: {
          taskId: taskId.value,
          cartonId: cartonId.value,
        },
      });
    };

    const handleSave = () => {
      const args = composeSaveApiArgs();
      bridge.call("updateCartonProduct", args, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          popupSuccessMsg($q, "Successfully saved");
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    const composeSaveApiArgs = () => {
      let args = {
        id: mixCartonProduct.value.id,
        lpId: lpId.value,
        upc: mixCartonProduct.value.upc,
        color: mixCartonProduct.value.color,
        size: mixCartonProduct.value.size,
        qty: mixCartonProduct.value.qty,
        style: mixCartonProduct.value.style,
      };
      dynamicViews.value.forEach((viewElement: ViewDisplayAttribute) => {
        switch (viewElement.fieldName) {
          case "UPC":
            args.upc = viewElement.model;
            break;
          case "Color":
            args.color = viewElement.model;
            break;
          case "Size":
            args.size = viewElement.model;
            break;
          case "Quantity":
            args.qty = viewElement.model;
            break;
          case "Style":
            args.style = viewElement.model;
            break;
          default:
            break;
        }
      });
      return args;
    };
    const handleDelete = () => {
      const args = {
        id: mixCartonProduct.value.id,
      };
      bridge.call("deleteCartonProduct", args, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          popupSuccessMsg($q, "Successfully deleted");
          router.push({
            path: "/dataManagementMixCartonList",
            query: {
              taskId: taskId.value,
              cartonId: cartonId.value,
            },
          });
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    return {
      back,
      cancelLabel,
      deleteLabel,
      dynamicViews,
      handleSave,
      handleDelete,
      inputRef,
      pageTitle,
      router,
      saveLabel,
      scan,
      taskId,
      homeIcon,
      arrowIcon,
    };
  },
});
export default DataManagementMixCartonView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100%;
  position: relative;
  padding-bottom: 20px;
  min-height: 100vh;
}
.header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1;
  background-image: url("../assets/images/lns_bg.png");
  background-size: cover;
  padding-bottom: 10px;
  .q-item {
    height: 60px;
    width: 100%;
  }
  .title-text {
    font-size: 20px;
  }
  .search {
    margin: 0 20px;
    background-color: #ffffff;
  }
}
.q-item {
  background-color: #ffffff;
  height: 60px;
  width: 100%;
}
.task-id {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: #00243d;
  color: #fff;
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

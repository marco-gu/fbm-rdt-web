<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">{{ pageTitle }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <div class="task-id">
        <span>{{ taskId }}</span>
      </div>
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
          :label="saveLabel"
          type="submit"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          no-caps
          style="width: 48%"
          flat
          push
          :label="deleteLabel"
          @click="handleDelete"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          no-caps
          style="width: 48%"
          flat
          type="submit"
          push
          :label="cancelLabel"
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
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
      i18n.category.value = "DataManagementView";
      pageTitle.value = i18n.$t("pageTitle");
      cancelLabel.value = i18n.$t("cancelLabel");
      deleteLabel.value = i18n.$t("deleteLabel");
      saveLabel.value = i18n.$t("saveLabel");
    });
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
    };
  },
});
export default DataManagementMixCartonView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  position: relative;
  .header {
    display: sticky;
    top: 0;
    width: 100%;
    background-color: #ffffff;
    z-index: 1;
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
}
</style>

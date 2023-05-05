<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="() => router.push('/dataMgmtCartonDetail')"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div v-for="(item, index) in pageView" :key="index">
          <div
            class="common-card-2"
            @click="onDetail(item)"
            v-touch-hold:1800="handleHold"
          >
            <q-checkbox
              class="checkbox"
              v-model="item.isSelected"
              v-if="isEditMode"
              checked-icon="app:checkboxOn"
              unchecked-icon="app:checkboxOff"
            />
            <div class="label mb-lg">
              {{ item.displayName }}
            </div>
            <div class="value">
              {{ item.attribute.upc }}
            </div>
            <div item="label">
              {{ item.attribute.style
              }}<span class="separator">&nbsp;&nbsp;</span
              >{{ item.attribute.color
              }}<span class="separator">&nbsp;|&nbsp;</span
              >{{ item.attribute.size }}
              <span class="separator">&nbsp;|&nbsp;</span
              >{{ item.attribute.quantity }}
            </div>
          </div>
        </div>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        v-show="isEditMode"
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
      <q-separator v-show="isEditMode" vertical inset color="white" />
      <q-btn
        no-caps
        unelevated
        :ripple="false"
        class="full-width"
        :disable="isButtonDisabled"
        @click="onSubmit"
      >
        {{ label }}
      </q-btn>
    </div>
  </div>
  <PopupComponent
    :visible="dialogVisible"
    :message="msg"
    :type="type"
    @close="onConfirmDialog"
    @cancel="dialogVisible = false"
  ></PopupComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { ProfileDisplayAttribute } from "@/models/profile";
import router from "@/router";
import { ProfileElementLevel } from "@/utils/profile.render";
import bridge from "dsbridge";
import { computed, defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
import PopupComponent from "@/components/PopupComponent.vue";
const DataMgmtCartonMixed = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const label = ref(i18n.t("dataManagement.add"));
    const titles = [
      store.state.dataMgmtModule.selectedCartonHeader.cartonID,
      "Detail",
    ];
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const pageView = ref([] as any[]);
    const isEditMode = ref(false);
    const pressDelete = ref(false);
    const pressHome = ref(false);
    onBeforeMount(() => {
      bridge.call(
        "fetchMixCartonItemsForDM",
        {
          cartonID: store.state.dataMgmtModule.selectedCartonHeader.cartonID,
          taskID: store.state.dataMgmtModule.selectedCartonHeader.taskID,
        },
        (res) => {
          const mixCartonItems = JSON.parse(res) as any[];
          mixCartonItems.forEach((mixItem: any, index: number) => {
            let number = index + 1;
            const viewElement = {
              displayName: "item" + number,
              id: mixItem.id,
              lpId: mixItem.lpId,
              attribute: {
                upc: "",
                color: "",
                style: "",
                size: "",
                quantity: "",
              },
            };
            store.state.dataMgmtModule.profile.forEach(
              (item: ProfileDisplayAttribute) => {
                if (item.type == store.state.dataMgmtModule.dataMgmt.scanType) {
                  if (item.level == ProfileElementLevel.CARTON_UPC) {
                    const fieldName = item.displayDataFieldName;
                    switch (fieldName) {
                      case "UPC":
                        viewElement.attribute.upc = ref(mixItem.upc);
                        break;
                      case "Color":
                        viewElement.attribute.color = ref(mixItem.color);
                        break;
                      case "Style":
                        viewElement.attribute.style = ref(mixItem.style);
                        break;
                      case "Size":
                        viewElement.attribute.size = ref(mixItem.size);
                        break;
                      case "Quantity":
                        viewElement.attribute.quantity = ref(mixItem.quantity);
                        break;
                      default:
                        break;
                    }
                  }
                }
              }
            );
            pageView.value.push(viewElement);
          });
        }
      );
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 50 + "px";
    });
    const onDetail = (item: any) => {
      if (!isEditMode.value) {
        store.dispatch("dataMgmtModule/saveMixCartonItem", item).then(() => {
          router.push({
            name: "dataMgmtCartonMixedDetail",
            params: {
              cartonID:
                store.state.dataMgmtModule.selectedCartonHeader.cartonID,
            },
          });
        });
      }
    };
    const handleHold = () => {
      isEditMode.value = true;
      label.value = i18n.t("common.delete");
      clearCheckbox();
    };
    const clearCheckbox = () => {
      pageView.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
      label.value = i18n.t("dataManagement.add");
      clearCheckbox();
    };
    const isButtonDisabled = computed(() => {
      return isEditMode.value == true
        ? !pageView.value.some((item: any) => item["isSelected"])
        : false;
    });
    const onSubmit = () => {
      if (isEditMode.value) {
        dialogVisible.value = true;
        type.value = "action";
        pressDelete.value = true;
        msg.value = i18n.t("dataManagement.delete_dialog_message");
      }
      {
        // add
      }
    };
    const onConfirmDialog = () => {
      dialogVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      } else if (pressDelete.value) {
        cancelEditMode();
        // todo detele
      }
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    return {
      titles,
      router,
      pageView,
      onDetail,
      label,
      handleHold,
      isEditMode,
      cancelEditMode,
      dialogVisible,
      type,
      msg,
      isButtonDisabled,
      onSubmit,
      onConfirmDialog,
      home,
    };
  },
});
export default DataMgmtCartonMixed;
</script>

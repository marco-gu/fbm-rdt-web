<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home']"
      @onHome="() => router.push('/home')"
      @onBack="() => router.push('/dataMgmtCartonDetail')"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div v-for="(item, index) in pageView" :key="index">
          <div class="common-card-2" @click="onDetail(item)">
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
    <div class="bottom-button" id="bottom-button">
      <q-btn no-caps unelevated class="full-width" @click="onSubmit">
        {{ label }}
      </q-btn>
    </div>
  </div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { ProfileDisplayAttribute } from "@/models/profile";
import router from "@/router";
import { ProfileElementLevel } from "@/utils/profile.render";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
const DataMgmtCartonMixed = defineComponent({
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const label = ref(i18n.t("dataManagement.add"));
    const titles = [
      store.state.dataMgmtModule.selectedCartonHeader.cartonID,
      "Detail",
    ];
    const pageView = ref([] as any[]);
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
      store.dispatch("dataMgmtModule/saveMixCartonItem", item).then(() => {
        // router.push("/dataMgmtCartonMixedDetail");
        router.push({
          name: "dataMgmtCartonMixedDetail",
          params: {
            cartonID: store.state.dataMgmtModule.selectedCartonHeader.cartonID,
          },
        });
      });
    };
    return { titles, router, pageView, onDetail, label };
  },
});
export default DataMgmtCartonMixed;
</script>

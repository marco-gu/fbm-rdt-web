<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home']"
      @onHome="() => router.push('/home')"
      @onBack="() => router.push('/dataMgmtCartonMixed')"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div v-for="(item, index) in pageView" :key="index">
            <div class="field">
              <div class="input-title">
                <span class="text"> {{ item.displayFieldName }}</span>
              </div>
              <q-input
                class="input-field"
                input-class="text-left"
                v-model="item.model"
                borderless
                :readonly="!isEditMode || !item.editable"
                :disable="!isEditMode || !item.editable"
              >
                <template
                  v-if="item.scan == 1 && isEditMode == true"
                  v-slot:append
                >
                  <q-avatar
                    class="btn-img"
                    @click="scan(item.fieldName, $event)"
                  >
                    <q-img
                      no-transition
                      no-spinner
                      :src="inputScanIcon"
                      width="12px"
                    />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
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
import {
  composeViewElement,
  ProfileElementLevel,
} from "@/utils/profile.render";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
const DataMgmtCartonMixedDetail = defineComponent({
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const titles = [
      route.params.cartonID,
      store.state.dataMgmtModule.mixcartonItem.displayName,
    ];
    const pageView: [] = [];
    const isEditMode = ref(false);
    const i18n = useI18n();
    const label = ref(i18n.t("dataManagement.edit"));
    onBeforeMount(() => {
      store.state.dataMgmtModule.profile.forEach(
        (item: ProfileDisplayAttribute) => {
          if (item.type == store.state.dataMgmtModule.dataMgmt.scanType) {
            if (item.level == ProfileElementLevel.CARTON_UPC) {
              const element = composeViewElement(item);
              element.editable = true;
              const fieldName = item.displayDataFieldName;
              switch (fieldName) {
                case "UPC":
                  element.model = ref(
                    store.state.dataMgmtModule.mixcartonItem.attribute.upc
                  );
                  break;
                case "Color":
                  element.model = ref(
                    store.state.dataMgmtModule.mixcartonItem.attribute.color
                  );
                  break;
                case "Style":
                  element.model = ref(
                    store.state.dataMgmtModule.mixcartonItem.attribute.style
                  );
                  break;
                case "Size":
                  element.model = ref(
                    store.state.dataMgmtModule.mixcartonItem.attribute.size
                  );
                  break;
                case "Quantity":
                  element.model = ref(
                    store.state.dataMgmtModule.mixcartonItem.attribute.quantity
                  );
                  break;
                default:
                  break;
              }
              pageView.push(element as never);
            }
          }
        }
      );
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 1 + "px";
    });
    return { titles, router, pageView, isEditMode, label };
  },
});
export default DataMgmtCartonMixedDetail;
</script>

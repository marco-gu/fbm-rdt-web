<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="sub-title-card">
        <div class="sub-title-card_section">
          <div class="sub-title-card__number">
            {{ scanned }}
          </div>
          <div class="sub-title-card__label">{{ $t("lp.scanned") }}</div>
        </div>
        <q-separator vertical inset color="white" />
        <div class="sub-title-card_section">
          <div class="sub-title-card__number">
            {{ total }}
          </div>
          <div class="sub-title-card__label">{{ $t("lp.total_number") }}</div>
        </div>
      </div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit">
          <div v-for="(item, i) in views" :key="i">
            <div class="card-item-input">
              <div>
                {{ item.key }}
              </div>
              <q-input
                class="card-item-input-field no-shadow"
                :input-style="{ fontSize: '15px' }"
                input-class="text-right"
                v-model="item.value"
                borderless
                dense
              >
              </q-input>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-button" id="bottom-button">
      <q-btn
        no-caps
        unelevated
        @click="onSubmit"
        class="full-width"
        :label="$t('lp.start_scan')"
        color="secondary"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import bridge from "dsbridge";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useI18n } from "vue-i18n";
type ViewElement = {
  key: string;
  value: string;
};
const ScanView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    const profileCode = ref("");
    const taskID = ref("");
    const type = ref("");
    const profileName = ref("");
    const scanned = ref(0);
    const total = ref(0);
    const views = ref([] as ViewElement[]);
    const data = ref();
    const titleParam = i18n.t("lp.scan");
    const backUrlParam = "/lpSearch/online";
    onMounted(() => {
      // calculate scroll area height if bottom button exist
      const bottom = document.getElementById("bottom-button") as any;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop + "px";
      data.value = route.params as any;
      for (const key in data.value) {
        switch (key) {
          case "id":
            break;
          case "scanned":
            scanned.value = data.value[key];
            break;
          case "total":
            total.value = data.value[key];
            break;
          case "taskID":
            taskID.value = data.value[key];
            break;
          case "profileCode": {
            profileCode.value = data.value[key];
            const element: ViewElement = {
              key: "Profile",
              value: data.value[key],
            };
            views.value.push(element);
            break;
          }
          case "type": {
            type.value = data.value[key];
            const element: ViewElement = {
              key: "Scan Type",
              value: data.value[key],
            };
            views.value.push(element);
            break;
          }
          case "profileName":
            profileName.value = data.value[key];
            break;
          default: {
            const element: ViewElement = {
              key: key.charAt(0).toUpperCase() + key.slice(1),
              value: data.value[key],
            };
            views.value.push(element);
            break;
          }
        }
      }
    });
    const onSubmit = () => {
      const args = {
        taskID: taskID.value,
        type: type.value,
        profileName: profileName.value,
        pageType: route.params.id,
      };
      bridge.call("scan", args);
    };
    bridge.register("returnLpSearch", () => {
      router.push("/lpSearch/" + route.params.id);
    });
    return {
      scanned,
      total,
      onSubmit,
      views,
      titleParam,
      backUrlParam,
    };
  },
});
export default ScanView;
</script>
<style lang="scss" scoped>
.sub-title-card {
  .sub-title-card_section {
    flex: 1;
    font-size: 18px;
  }
  &__number {
    font-weight: bold;
    text-align: center;
  }
  &__label {
    text-align: center;
  }
}
</style>

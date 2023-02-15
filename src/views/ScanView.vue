<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("lp.scan") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="content">
      <div class="scan-card">
        <div class="scan-card__section">
          <div class="scan-card__number">
            {{ scanned }}
          </div>
          <div class="scan-card__label">{{ $t("lp.scanned") }}</div>
        </div>
        <q-separator vertical inset color="white" />
        <div class="scan-card__section">
          <div class="scan-card__number">
            {{ total }}
          </div>
          <div class="scan-card__label">{{ $t("lp.total_number") }}</div>
        </div>
      </div>
      <q-form @submit="onSubmit">
        <div v-for="(item, i) in views" :key="i" class="section-item">
          <div>{{ item.key }}</div>
          <div>{{ item.value }}</div>
        </div>
        <div class="button-bottom">
          <q-btn
            no-caps
            unelevated
            type="submit"
            class="full-width"
            :label="$t('lp.start_scan')"
            color="secondary"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import bridge from "dsbridge";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
type ViewElement = {
  key: string;
  value: string;
};
const ScanView = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const profileCode = ref("");
    const taskID = ref("");
    const type = ref("");
    const scanned = ref(0);
    const total = ref(0);
    const views = ref([] as ViewElement[]);
    const data = ref();
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    onMounted(() => {
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
    const back = () => {
      router.push("/lpSearch/" + route.params.id);
    };
    const home = () => {
      router.push("/home");
    };
    const onSubmit = () => {
      const args = {
        taskID: taskID.value,
        type: type.value,
        profileCode: profileCode.value,
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
      back,
      home,
      views,
      homeIcon,
      arrowIcon,
    };
  },
});
export default ScanView;
</script>
<style lang="scss" scoped>
.content {
  padding: 0 20px;
}
.button-bottom {
  position: fixed;
  bottom: 20px;
  width: calc(100% - 40px);
}
.section-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 18px;
  margin-bottom: 15px;
}

.scan-card {
  background-color: #00243d;
  border-radius: 10px;
  width: 100%;
  display: flex;
  color: #ffffff;
  text-align: center;
  padding: 15px 0;
  margin: 15px 0 25px 0;
  justify-content: space-around;
  &__section {
    flex: 1;
  }
  &__number {
    font-size: 36px;
    font-weight: bold;
  }
  &__label {
    font-size: 22px;
  }
}
</style>

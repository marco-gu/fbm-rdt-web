<template>
  <div class="wrapper">
    <div class="header">
      <q-toolbar class="common-toolbar">
        <q-btn flat round dense icon="arrow_back" @click="back" />
        <q-toolbar-title :shrink="false">
          {{ $t("lp.scan") }}
        </q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="home" @click="home" />
      </q-toolbar>
    </div>
    <div class="container">
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
    };
  },
});
export default ScanView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  .container {
    padding: 0 20px;
  }
  .button-bottom {
    position: fixed;
    bottom: 10px;
    width: calc(100% - 40px);
  }
  .section-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
    border-radius: 5px;
    padding: 10px 15px;
    font-size: 18px;
    margin-bottom: 15px;
    color: #757575;
  }
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

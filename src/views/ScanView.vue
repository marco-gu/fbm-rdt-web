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
      <div class="card-sub-title">
        <div class="card-sub-title_section">
          <div class="card-sub-title__number">
            {{ scanned }}
          </div>
          <div class="card-sub-title__label">{{ $t("lp.scanned") }}</div>
        </div>
        <q-separator vertical inset color="white" />
        <div class="card-sub-title_section">
          <div class="card-sub-title__number">
            {{ total }}
          </div>
          <div class="card-sub-title__label">{{ $t("lp.total_number") }}</div>
        </div>
      </div>
    </div>
    <div class="content">
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
    <div class="bottom" id="bottom">
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
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
import { useStore } from "@/store";
type ViewElement = {
  key: string;
  value: string;
};
const ScanView = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const profileCode = ref("");
    const taskID = ref("");
    const type = ref("");
    const profileName = ref("");
    const scanned = ref(0);
    const total = ref(0);
    const views = ref([] as ViewElement[]);
    const data = ref();
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    onMounted(() => {
      // calculate scroll area height if bottom button exist
      // const deviceHeight = store.state.screenModule.screenHeight;
      const bottom = document.getElementById("bottom") as any;
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
    const back = () => {
      router.push("/lpSearch/online");
    };
    const home = () => {
      router.push("/home");
    };
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
  margin-top: $--page-content-margin-top-with-subtitle;
}
.card-sub-title {
  display: flex;
  color: #ffffff;
  text-align: center;
  justify-content: space-between;
  padding: 10px 0px;
  .card-sub-title_section {
    flex: 1;
    align-items: center;
  }
  &__number {
    font-size: 20px;
    font-weight: bold;
  }
  &__label {
    text-align: center;
    font-size: 18px;
  }
}
.bottom {
  position: fixed;
  bottom: 20px;
}
</style>

<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Scan</span></q-item-section
        >
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div>
    <q-card class="my-card" flat bordered>
      <q-card-section horizontal>
        <q-card-section style="width: 50%">
          <div>
            <span style="font-size: 26px; color: white"> {{ scanned }} </span>
          </div>
          <div><span style="font-size: 20px; color: white">Scanned</span></div>
        </q-card-section>
        <q-separator vertical inset color="white" />
        <q-card-section style="width: 50%">
          <div>
            <span style="font-size: 26px; color: white">{{ total }}</span>
          </div>
          <div>
            <span style="font-size: 20px; color: white">Total Number</span>
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-form @submit="onSubmit" style="background: #fff">
      <div v-for="(item, i) in views" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <label style="padding-left: 1rem; color: black">{{ item.key }}</label>
          <q-input
            v-model="item.value"
            input-class="text-right"
            borderless
            style="padding: 0px 16px"
            readonly
          >
          </q-input>
        </div>
        <q-separator color="grey-5" />
      </div>
      <div style="position: fixed; bottom: 0px; width: 100%">
        <q-btn
          no-caps
          type="submit"
          class="full-width"
          label="Start Scan Carton ID"
          style="background: #42b0d5; color: #fff; height: 40px"
        />
      </div>
    </q-form>
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
  display: flex;
  flex-flow: column;
  background: rgb(233, 229, 229);
}
.header {
  display: flex;
  background: #fff;
  justify-content: space-around;
  height: 60px;
  align-items: center;
}
.my-card {
  width: 100%;
  background-color: #00243d;
}
</style>

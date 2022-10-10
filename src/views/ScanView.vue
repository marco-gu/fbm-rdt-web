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
          <div><span style="font-size: 26px; color: white">0</span></div>
          <div><span style="font-size: 20px; color: white">Scanned</span></div>
        </q-card-section>
        <q-separator vertical inset color="white" />
        <q-card-section style="width: 50%">
          <div><span style="font-size: 26px; color: white">3000</span></div>
          <div><span style="font-size: 20px; color: white">Total</span></div>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-form @submit="onSubmit" style="background: #fff">
      <q-input
        v-model="profileName"
        prefix="Profile"
        input-class="text-right"
        readonly
        borderless
        style="padding: 0px 16px"
      >
      </q-input>
      <q-separator color="grey-5" />
      <q-input
        v-model="type"
        prefix="Type"
        input-class="text-right"
        readonly
        borderless
        style="padding: 0px 16px"
      >
      </q-input>
      <q-separator color="grey-5" />
      <q-input
        v-model="soNumber"
        prefix="SO"
        input-class="text-right"
        readonly
        borderless
        style="padding: 0px 16px"
      >
      </q-input>
      <q-separator color="grey-5" />
      <q-input
        v-model="poNumber"
        prefix="PO"
        input-class="text-right"
        readonly
        borderless
        style="padding: 0px 16px"
      >
      </q-input>
      <q-separator color="grey-5" />
      <q-input
        v-model="skuNumber"
        prefix="SKU"
        input-class="text-right"
        readonly
        borderless
        style="padding: 0px 16px"
      >
      </q-input>
      <q-separator color="grey-5" />

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
const ScanView = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const profileName = ref("");
    const type = ref("");
    const soNumber = ref("");
    const poNumber = ref("");
    onMounted(() => {
      profileName.value = route.params.profileName as string;
      type.value = route.params.type as string;
      soNumber.value = route.params.so as string;
      poNumber.value = route.params.po as string;
    });
    const scan = () => {
      const args = {
        profileName: profileName.value,
        so: soNumber.value,
        po: poNumber.value,
      };
      bridge.call("scan", args, (res: any) => {
        console.log(res);
      });
      // router.push("/home");
    };
    return {
      router,
      profileName,
      type,
      soNumber,
      poNumber,
      scan,
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

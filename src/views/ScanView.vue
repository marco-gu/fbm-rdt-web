<template>
  <div class="wrapper">
    <div class="header">
      <div style="width: 100%">
        <q-item clickable>
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
    </div>
    <div style="width: 95%; padding-left: 10px; margin-top: 10px">
      <q-field label="Profile" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline">
            {{ profileName }}
          </div>
        </template>
      </q-field>
    </div>
    <div style="width: 95%; padding-left: 10px; margin-top: 10px">
      <q-field label="Type" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline">
            {{ type }}
          </div>
        </template>
      </q-field>
    </div>
    <div style="width: 95%; padding-left: 10px; margin-top: 10px">
      <q-field label="SO" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline">
            {{ soNumber }}
          </div>
        </template>
      </q-field>
    </div>
    <div style="width: 95%; padding-left: 10px; margin-top: 10px">
      <q-field label="PO" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline">
            {{ poNumber }}
          </div>
        </template>
      </q-field>
    </div>
    <div style="margin-top: 150px" @click="scan">
      <q-btn size="25px" round color="primary" icon="qr_code_scan" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import bridge from "dsbridge";
const ScanView = defineComponent({
  methods: {
    back() {
      this.router.go(-1);
    },
    home() {
      this.router.push("/home");
    },
  },
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
      router.push("/home");
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
}
.header {
  background: #027be3;
  padding-top: 1px;
  padding-bottom: 1px;
  display: flex;
  color: #fff;
  justify-content: space-around;
}
</style>

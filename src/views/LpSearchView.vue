<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">LP Search</span></q-item-section
        >
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
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
      <q-field borderless style="padding: 0px 16px" item-aligned>
        <template v-slot:control>
          <div>
            <span>Scan Type</span>
          </div>
        </template>
        <div style="display: flex; color: black">
          <q-radio
            v-model="scanType"
            val="Receiving"
            label="Receiving"
            @click="onClick"
          />
          <q-radio
            v-model="scanType"
            val="Stuffing"
            label="Stuffing"
            @click="onClick"
          />
        </div>
      </q-field>
      <q-separator color="grey-5" />
      <q-input
        ref="inputSoRef"
        v-model="soNumber"
        prefix="SO"
        clearable
        input-class="text-right"
        lazy-rules
        :rules="[soFormatRule]"
        borderless
        style="padding: 0px 16px"
      >
        <template v-slot:append>
          <q-avatar>
            <q-icon name="qr_code_scanner" />
          </q-avatar>
        </template>
      </q-input>
      <q-separator color="grey-5" />
      <div v-if="isPoNumberVisible">
        <q-input
          ref="inputPoRef"
          v-model="poNumber"
          prefix="PO"
          clearable
          input-class="text-right"
          lazy-rules
          :rules="[poFormatRule]"
          borderless
          style="padding: 0px 16px"
        >
          <template v-slot:append>
            <q-avatar>
              <q-icon name="qr_code_scanner" />
            </q-avatar>
          </template>
        </q-input>
        <q-separator color="grey-5" />
      </div>
      <div v-if="isSkuNumberVisible">
        <q-input
          ref="inputSkuRef"
          v-model="skuNumber"
          prefix="SKU"
          clearable
          input-class="text-right"
          lazy-rules
          :rules="[skuFormatRule]"
          borderless
          style="padding: 0px 16px"
        >
          <template v-slot:append>
            <q-avatar>
              <q-icon name="qr_code_scanner" />
            </q-avatar>
          </template>
        </q-input>
        <q-separator color="grey-5" />
      </div>
      <div style="position: fixed; bottom: 0px; width: 100%">
        <q-btn
          no-caps
          type="submit"
          class="full-width"
          label="Generate"
          style="background: #42b0d5; color: #fff; height: 40px"
        />
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import { ApiResponseDto } from "@/models/api.response";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
const LpSearchView = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const profileName = ref("");
    const scanType = ref("Receiving");
    const soNumber = ref("");
    const inputSoRef = ref("");
    const poNumber = ref("");
    const inputPoRef = ref("");
    const isPoNumberVisible = ref(true);
    const skuNumber = ref("");
    const inputSkuRef = ref("");
    const isSkuNumberVisible = ref(false);
    const $q = useQuasar();
    const alertErrorMessage = (message: any) => {
      $q.notify({
        position: "center",
        color: "red-5",
        textColor: "white",
        icon: "error",
        timeout: 2000,
        message: message,
      });
    };
    onMounted(() => {
      // TODO get profile from Router
      const profileData = route.params.profile as string;
      alert(profileData);
      alert(JSON.parse(profileData).client);

      profileName.value = "NIKE";
    });
    const onSubmit = () => {
      $q.loading.show({
        delay: 400,
      });
      const args = {
        // TODO clientCode
        clientCode: "WOLV",
        so: soNumber.value,
        po: poNumber.value,
        sku: skuNumber.value,
      };
      bridge.call("fetchLp", args, (res: string) => {
        const apiResponse = JSON.parse(res) as ApiResponseDto<any>;
        $q.loading.hide();
        if (apiResponse.statusCode == 200) {
          alert("success");
        } else {
          alertErrorMessage(apiResponse.errorMessage);
        }
      });
    };
    const onClick = () => {
      const tempSo = inputSoRef.value as any;
      tempSo.resetValidation();
      soNumber.value = "";
      const tempPo = inputPoRef.value as any;
      tempPo.resetValidation();
      poNumber.value = "";
      const tempSku = inputSkuRef.value as any;
      tempSku.resetValidation();
      skuNumber.value = "";
    };
    // TODO
    const soFormatRule = (val: string) => {
      switch (scanType.value) {
        case "Receiving":
          return new Promise((resolve) => {
            if (!val) {
              resolve("Please input SO");
            } else {
              if (soNumber.value.length > 18) {
                resolve("Please input not more than 18 charactors");
              } else {
                resolve(true);
              }
            }
          });
        case "Stuffing":
          return new Promise((resolve) => {
            if (!val) {
              resolve("Please input SO");
            } else {
              if (soNumber.value.length > 10) {
                resolve("Please input not more than 10 charactors");
              } else {
                resolve(true);
              }
            }
          });
      }
    };
    // TODO
    const poFormatRule = (val: string) => {
      switch (scanType.value) {
        case "Receiving":
          return new Promise((resolve) => {
            if (!val) {
              resolve("Please input PO");
            } else {
              if (poNumber.value.length > 18) {
                resolve("Please input not more than 18 charactors");
              } else {
                resolve(true);
              }
            }
          });
        case "Stuffing":
          return new Promise((resolve) => {
            if (!val) {
              resolve("Please input PO");
            } else {
              if (poNumber.value.length > 10) {
                resolve("Please input not more than 10 charactors");
              } else {
                resolve(true);
              }
            }
          });
      }
    };
    // TODO
    const skuFormatRule = (val: string) => {
      switch (scanType.value) {
        case "Receiving":
          return new Promise((resolve) => {
            if (!val) {
              resolve("Please input SKU");
            } else {
              if (skuNumber.value.length > 18) {
                resolve("Please input not more than 18 charactors");
              } else {
                resolve(true);
              }
            }
          });
        case "Stuffing":
          return new Promise((resolve) => {
            if (!val) {
              resolve("Please input SKU");
            } else {
              if (skuNumber.value.length > 10) {
                resolve("Please input not more than 10 charactors");
              } else {
                resolve(true);
              }
            }
          });
      }
    };
    return {
      router,
      profileName,
      scanType,
      soNumber,
      inputSoRef,
      poNumber,
      inputPoRef,
      skuNumber,
      isPoNumberVisible,
      isSkuNumberVisible,
      onSubmit,
      soFormatRule,
      poFormatRule,
      skuFormatRule,
      onClick,
    };
  },
});
export default LpSearchView;
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
</style>

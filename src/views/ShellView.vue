<template>
  <div class="shell-header">Welcome to Scan APP</div>
  <div class="shell-container">
    <q-card class="my-card text-white">
      <q-card-actions>
        <q-btn no-caps @click="clickRDT" flat class="full-width"
          >Please enter RDT scan</q-btn
        >
      </q-card-actions>
    </q-card>
    <q-card class="my-card text-white">
      <q-card-actions>
        <q-btn no-caps flat class="full-width">Please enter Kober scan</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>
<script lang="ts">
import { post } from "@/service/http";
import { useStore } from "../store";
import { composeScreenData } from "@/utils/type3.parse";
import { defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    onMounted(() => {
      const shell = document.getElementById("app") as any;
      shell.style.backgroundColor = "#609cd4";
    });
    const clickRDT = () => {
      const engineRequest = {
        countryAbbreviatedName: "GBR",
      };
      post(process.env.VUE_APP_BASE_URL, engineRequest).then((data: any) => {
        store.commit("workflowModule/saveScreenModel", composeScreenData(data));
        router.push("/rdt");
      });
    };
    return {
      clickRDT,
    };
  },
});
</script>
<style lang="scss" scoped>
.shell-header {
  display: flex;
  color: white;
  font-size: 18px;
  font-weight: 500;
  justify-content: center;
  margin-top: 10%;
}
.shell-container {
  margin-top: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.shell-container .my-card {
  margin-bottom: 20px;
  width: 100%;
  max-width: 250px;
  background-color: #204c7c;
}
</style>

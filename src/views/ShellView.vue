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
import { defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
import { EngineRequset } from "@/entity/request.entity";
import ck65 from "../assets/mock/New_RDT_Login_Response.json";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    onMounted(() => {
      // TODO initial screen background color
      const shell = document.getElementById("app") as HTMLElement;
      shell.style.backgroundColor = "#609cd4";
    });
    const clickRDT = () => {
      // TODO country
      localStorage.setItem("country", "GBR");
      const request = {} as EngineRequset;
      request.sessionId = "";
      request.screenDepth = 0;
      // post(request).then((data: unknown) => {
      //   store.commit("workflowModule/onSubmit", data);
      //   router.push("/rdt");
      // });
      const data = ck65;
      store.commit("workflowModule/onSubmit", data);
      router.push("/rdt");
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
  font-size: 20px;
  font-weight: 500;
  justify-content: center;
  padding-top: 20%;
}
.shell-container {
  margin-top: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.shell-container .my-card {
  margin-bottom: 10%;
  width: 100%;
  max-width: 250px;
  background-color: #204c7c;
}
</style>

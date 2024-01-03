<template>
  <div id="display">
    <p class="rdt row2 center">
      <span class="rdt style_block">R</span>
      <span class="rdt style_block">D</span>
      <span class="rdt style_block">T</span>
    </p>
    <p class="rdt row3 center" style="font-size: 24px">EMULATOR</p>
    <div class="rdt line"></div>
    <p class="rdt row4 center" style="font-size: 14px">Welcome to NEW RDT</p>
    <p class="rdt row4 center" style="font-size: 14px">
      Version 3.0 Alpha, Januarary 2024
    </p>
    <p
      class="rdt row5 center"
      style="font-size: 24px; cursor: default"
      @click="clickRDT"
    >
      Enter to Start
    </p>
  </div>
</template>
<script lang="ts">
import { post } from "@/service/http";
import { useStore } from "../store";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { EngineRequset } from "@/entity/request.entity";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const clickRDT = () => {
      localStorage.setItem("country", "GBR");
      const request = {} as EngineRequset;
      request.sessionId = "";
      request.screenDepth = 0;
      post(request).then((data: unknown) => {
        store.commit("workflowModule/onSubmit", data);
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
p {
  margin: 0px;
}
</style>

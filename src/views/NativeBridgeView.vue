<template>
  <div class="content"></div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import bridge from "dsbridge";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const route = useRoute();
    const path = route.params.id as string;
    const router = useRouter();
    bridge.register("backHome", () => {
      router.push("/home");
    });
    bridge.register("refreshCargoImages", () => {
      router.push({
        path: "/cargoImageList",
      });
    });
    bridge.register("returnContinueJobs", () => {
      router.push({
        path: "/continueJobs",
      });
    });
  },
});
</script>

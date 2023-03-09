<template>
  <div class="content"></div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const router = useRouter();
    bridge.register("backHome", () => {
      router.push("/home");
    });
    bridge.call("retrieveCargoImages", null, (data: any) => {
      router.push({
        path: "/imageAccess",
        query: {
          data: data,
        },
      });
    });
  },
});
</script>
<style lang="scss" scoped>
.content {
  background: white;
}
</style>

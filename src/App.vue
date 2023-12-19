<template>
  <router-view></router-view>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "./store";
import { setShellStyle } from "./utils/screen.utils";

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    onMounted(() => {
      const shell = document.getElementById("app") as HTMLElement;
      // window.addEventListener("keyup", handleKeyDown);
      setShellStyle(shell);
    });
    // onUnmounted(() => {
    //   window.removeEventListener("keyup", handleKeyDown);
    // });
    // const handleKeyDown = (event: any) => {
    //   {
    //     switch (event.keyCode) {
    //       case 13:
    //         store.dispatch("workflowModule/onSubmit");
    //         break;
    //       case 27:
    //         localStorage.clear();
    //         if (store.state.workflowModule.screenModel.title == "Login") {
    //           router.push("/");
    //         } else {
    //           store.dispatch("workflowModule/onCancel");
    //         }
    //         break;
    //     }
    //   }
    // };
  },
});
</script>

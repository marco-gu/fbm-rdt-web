<template>
  <div style="margin-bottom: 21.5px">SETUP & OPTIONS</div>
  <div class="line-item" v-for="item in menus" v-bind:key="item">
    <div class="label-item">
      <span>{{ item }} </span>
    </div>
  </div>

  <div style="position: absolute; bottom: 20px">
    <div style="font-size: 10px; margin: 20px 0 10px 0">
      [Pg1/1] 0:Pg_Up, 9:Pg_Dn, X-Exit
    </div>
    <option-input-component @optionValue="optionValue"></option-input-component>
  </div>
  <router-view></router-view>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import OptionInputComponent from "@/components/options/OptionInputComponent.vue";

export default defineComponent({
  components: {
    OptionInputComponent,
  },
  setup() {
    const router = useRouter();
    const menus = ["1. Generic Settings"];
    const optionValue = (value: number) => {
      if (value == 1) {
        router.push("/options/setting");
      }
    };
    return {
      menus,
      optionValue,
    };
  },
});
</script>

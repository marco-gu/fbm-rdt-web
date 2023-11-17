<template>
  <div style="margin-bottom: 21.5px">SETUP & OPTIONS</div>
  <div class="line-item" v-for="item in menus" v-bind:key="item">
    <div class="label-item">
      <span @click="onClick" style="cursor: pointer">{{ item }} </span>
    </div>
  </div>

  <div style="position: fixed; bottom: 20px">
    <div style="font-size: 10px; margin: 20px 0 10px 0">
      [Pg1/1] 0:Pg_Up, 9:Pg_Dn, X-Exit
    </div>
    <option-input-component></option-input-component>
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
    // TODO Menu
    const menus = ["1. Generic Settings"];
    const input = {
      name: "Option",
      attributeName: "test",
      defaultValue: "",
      inputType: "input",
      max: "",
      autoFocus: true,
      tabindex: 1,
      labelX: 0,
      valueX: 9,
    };
    const onClick = () => {
      router.push("/options/setting");
    };
    return {
      menus,
      input,
      onClick,
    };
  },
});
</script>

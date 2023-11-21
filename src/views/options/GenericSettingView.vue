<template>
  <div>
    <div style="margin-bottom: 21.5px">Generic Settings</div>
    <div class="line-item" v-for="item in settings" v-bind:key="item">
      <div class="label-item">
        <span>{{ item }} </span>
      </div>
    </div>
    <div style="position: fixed; bottom: 20px">
      <div style="font-size: 10px; margin: 20px 0 10px 0">
        [Pg1/1] 0:Pg_Up, 9:Pg_Dn, X-Exit
      </div>
      <option-input-component
        @optionValue="optionValue"
      ></option-input-component>
    </div>
  </div>
  <router-view></router-view>
</template>
<script lang="ts">
import OptionInputComponent from "@/components/options/OptionInputComponent.vue";
import { useStore } from "@/store";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  components: {
    OptionInputComponent,
  },
  setup() {
    const store = useStore();
    const model = ref();
    const router = useRouter();
    const settings = [
      "1. Server Selection",
      "2. Sounds Mgmt.",
      "3. Vibration Mgmt.",
    ];
    const optionValue = (value: number) => {
      if (value == 1) {
        router.push("/options/serverSelection");
      }
    };
    return {
      settings,
      model,
      optionValue,
    };
  },
});
</script>

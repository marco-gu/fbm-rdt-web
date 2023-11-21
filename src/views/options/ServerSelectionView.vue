<template>
  <div>
    <div style="margin-bottom: 21.5px">Server Selection</div>
    <div
      class="line-item"
      v-for="(item, index) in countries"
      v-bind:key="index"
    >
      <div class="label-item">
        <span style="cursor: pointer"
          >{{ index + 1 }}. {{ item.definedAreaName }}
        </span>
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
</template>
<script lang="ts">
import OptionInputComponent from "@/components/options/OptionInputComponent.vue";
import router from "@/router";
import { get } from "@/service/http";
import { useStore } from "@/store";
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  components: {
    OptionInputComponent,
  },
  setup() {
    const countries = ref([] as any[]);
    const store = useStore();
    onMounted(() => {
      // retrieve country
      get("countries").then((data) => {
        countries.value = data as never[];
      });
    });
    const optionValue = (value: number) => {
      if (typeof value != "string") {
        store.commit(
          "workflowModule/saveCountry",
          countries.value[value - 1].abbreviatedName.toUpperCase()
        );
        router.push("/");
      }
    };
    return {
      countries,
      optionValue,
    };
  },
});
</script>

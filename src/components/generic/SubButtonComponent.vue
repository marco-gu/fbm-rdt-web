<template>
  <div style="margin-left: auto; padding: 10px">
    <i
      :class="
        click == true ? 'fa-solid fa-plus fa-xl' : 'fa-solid fa-minus fa-xl'
      "
      @click="enterSubForm"
    ></i>
  </div>
</template>
<script lang="ts">
import { EngineRequset } from "@/entity/request.entity";
import { UserSettingDto } from "@/entity/response.entity";
import { post } from "@/service/http";
import { defineComponent, ref } from "vue";
import { useStore } from "@/store";

const SubButtonComponent = defineComponent({
  setup() {
    const click = ref(true);
    const store = useStore();
    const subForm = store.state.workflowModule.subFormModel;
    if (subForm.screenRows && subForm.screenRows.size > 0) {
      click.value = false;
    }
    const enterSubForm = () => {
      if (click.value) {
        const request = {} as EngineRequset;
        request.sessionId = localStorage.getItem("sessionId") as string;
        request.countryAbbreviatedName = "GBR";
        request.actionKey = "subForm";
        request.userSettingDto = {} as UserSettingDto;
        post("RDTEngine", request).then((data) => {
          store.commit("workflowModule/saveSubForm", data);
        });
      } else {
        click.value = true;
        store.commit("workflowModule/clearSubForm");
      }
    };
    return {
      enterSubForm,
      click,
    };
  },
});
export default SubButtonComponent;
</script>

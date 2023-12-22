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
import { EngineRequset, UserSettingDto } from "@/entity/request.entity";
import { post } from "@/service/http";
import { defineComponent, ref } from "vue";
import { useStore } from "@/store";
import New_RDT_Response from "../../assets/mock/New_RDT_Response.json";

const SubButtonComponent = defineComponent({
  setup() {
    const store = useStore();
    const click = ref(!store.state.workflowModule.isSubFormRender);
    // const subForm = store.state.workflowModule.subFormModel;
    // if (subForm.screenRows && subForm.screenRows.size > 0) {
    //   click.value = false;
    // }
    console.log(click.value);
    const enterSubForm = () => {
      const flag = true;
      if (click.value) {
        click.value = false;
        if (flag) {
          const data = New_RDT_Response;
          store.commit("workflowModule/saveSubForm", data);
          // const request = {} as EngineRequset;
          // request.sessionId = localStorage.getItem("sessionId") as string;
          // request.screenDepth = 1;
          // request.countryAbbreviatedName = "GBR";
          // request.actionKey = "subForm";
          // request.userSettingDto = {} as UserSettingDto;
          // post(request).then((data) => {
          //   store.commit("workflowModule/saveSubForm", data);
          // });
        }
        store.commit("workflowModule/saveSubFormRenderStatus", true);
      } else {
        click.value = true;
        store.commit("workflowModule/saveSubFormRenderStatus", false);
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

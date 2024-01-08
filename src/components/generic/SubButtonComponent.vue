<template>
  <!-- <div class="line-item label-container" style="width: 100%">
    <template v-for="(item, index) in details" :key="index">
      <div
        v-if="item.value"
        class="label-block"
        :style="{
          fontSize: calcFontSize(item),
        }"
      >
        {{ item.value }}
      </div>
    </template>
  </div> -->
  <div
    class="pop_btn"
    @click="onClickSubScreen"
    style="margin-left: auto; padding: 0px"
  >
    <i :class="screenDepth == 0 ? 'fa-solid fa-plus' : 'fa-solid fa-minus'"></i>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs } from "vue";
import { useStore } from "@/store";
import _ from "lodash";
import { FieldDto } from "@/entity/response.entity";

const SubButtonComponent = defineComponent({
  setup(props) {
    // const { details } = toRefs(props);
    const store = useStore();
    const screenDepth = ref(store.state.workflowModule.screenDepth);
    const subScreenModel = _.cloneDeep(
      store.state.workflowModule.subScreenModel
    );
    const onClickSubScreen = () => {
      if (screenDepth.value == 0) {
        if (!_.isEmpty(subScreenModel)) {
          store.commit("workflowModule/onOpenSubScreen", true);
        } else {
          store.dispatch("workflowModule/onClickSubBtn");
        }
      } else {
        store.commit("workflowModule/onCloseSubScreen", false);
      }
    };
    // const calcFontSize = (item: FieldDto) => {
    //   const screenStyle = localStorage.getItem("screenStyle") as string;
    //   const fontSize = JSON.parse(screenStyle).fontSize;
    //   return fontSize + item.fontSize + "px";
    // };
    return {
      onClickSubScreen,
      screenDepth,
      // calcFontSize,
    };
  },
});
export default SubButtonComponent;
</script>
<style lang="scss" scoped>
.pop_btn {
  display: inline-block;
  width: 26px;
  height: 26px;
  position: absolute;
  bottom: 50px;
  right: 4px;
  text-align: center;
  color: #ffeead;
  background-color: #00346e;
  font-size: 26px;
  border-radius: 3px;
  z-index: 10;
  cursor: pointer;
}
.pop_btn:hover {
  cursor: pointer;
  width: 32px;
  height: 32px;
  right: 4px;
  color: #ffc58f;
  font-size: 28px;
  font-weight: 900;
}
</style>

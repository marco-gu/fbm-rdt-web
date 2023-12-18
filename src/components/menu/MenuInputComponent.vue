<template>
  <div class="line-item inputs-container">
    <div class="label-block">
      {{ label }}
    </div>
    <div class="input-block">
      <input id="123" ref="input" v-model="value" style="width: 10px" />
    </div>
    <div class="label-block" style="margin-left: 10px">
      {{ page }}
    </div>
  </div>
</template>
<script lang="ts">
import { Ref, defineComponent, ref, toRefs, onMounted } from "vue";
const MenuInputComponent = defineComponent({
  props: {
    details: {
      type: Array,
    },
  },
  setup(props) {
    const { details } = toRefs(props);
    const label = ref();
    const input = ref();
    const page = ref("(total 2)");
    const items = details.value;
    onMounted(() => {
      const element = document.getElementById("123") as any;
      element.addEventListener("keyup", handleKeyDown);
    });
    const handleKeyDown = (event: any) => {
      console.log("28");
      event.stopPropagation();
    };
    items?.forEach((t: any) => {
      switch (t.attributeType) {
        case "listSingleLabel":
          label.value = t.value;
          break;
        case "listSinglePage":
          page.value = t.value;
          break;
      }
    });
    const value = ref();
    return {
      label,
      page,
      value,
    };
  },
});
export default MenuInputComponent;
</script>
<style lang="scss" scoped>
.inputs-container {
  width: 100%;
  // justify-content: space-between;
  .label-block {
    text-align: left;
  }
  .input-block {
    display: flex;
    align-items: center;
    padding-left: 2px;
    textarea {
      border: none;
      resize: none;
      padding-left: 4px;
      height: 24px;
      line-height: 1;
      font-size: 10px;
      color: #ffc58f;
      background-color: #00346e;
      &:focus {
        outline: none;
      }
    }
    input {
      border: none;
      color: #ffc58f;
      background-color: #00346e;
      &:focus {
        outline: none;
        background-color: blue;
      }
      &:active {
        background-color: blue;
      }
    }
  }
}
.measure-text-length {
  height: 0;
  opacity: 0;
  position: absolute;
  left: -1000px;
}
</style>

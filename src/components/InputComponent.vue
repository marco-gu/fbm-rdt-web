<template>
  <div class="field">
    <div class="title">
      <span class="text">{{ label }}</span>
    </div>
    <q-input
      :maxlength="maxlength"
      :rules="[rule]"
      v-model="text"
      borderless
      input-class="text-left"
      :input-style="{ fontSize: '15px', padding: '3px 0 0 0px' }"
      style="position: relative; top: -22px"
    >
      <template v-slot:append>
        <q-avatar class="btn-img">
          <q-img
            :color="secondary"
            no-transition
            no-spinner
            :src="inputScanIcon"
            width="14px"
          />
        </q-avatar>
      </template>
    </q-input>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs } from "vue";
import inputScan from "../assets/icon/compress-solid.svg";

export default defineComponent({
  name: "inputComponent",
  props: {
    displayFieldName: {
      type: String,
    },
    displayFieldValue: {
      type: String,
    },
    fieldlength: {
      type: Number,
    },
    valid: {
      type: Function,
    },
  },
  setup(props) {
    const inputScanIcon = inputScan;
    const { displayFieldName, displayFieldValue, fieldlength, valid } =
      toRefs(props);
    const label = displayFieldName.value;
    const maxlength = fieldlength.value;
    const rule = valid.value;
    const text = displayFieldValue;
    return {
      inputScanIcon,
      label,
      text,
      maxlength,
      rule,
    };
  },
});
</script>
<style lang="scss">
.field {
  height: 40px;
  margin: 26px 23px;
  border: 1px solid #e5e2dc;
  .title {
    position: relative;
    text-align: left;
    top: -8px;
    left: 20px;
    font-size: 10px;
    .text {
      padding: 0 5px;
      background-color: #ffffff;
    }
  }
  .btn-img {
    margin-right: -5px;
  }
}
.field:focus-within {
  border: 1px solid #64b2d4;
}
.q-field {
  height: 65px;
  padding: 0 0 0 10px;
}
</style>

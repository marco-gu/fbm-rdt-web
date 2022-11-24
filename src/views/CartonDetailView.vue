<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar>
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Carton Detail</span>
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <div class="carton-info">
      <span>{{ cartonID }}</span>
    </div>
    <!-- <q-form style="background: #fff" @submit="onSubmit">
      <div v-for="(item, i) in pageViews" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span style="padding-left: 1rem; color: black">
            {{ item.name }}
          </span>

          <q-input
            ref="inputRef"
            v-model="item.value"
            clearable
            input-class="text-right"
            lazy-rules
            :rules="[item.rule]"
            borderless
            style="padding: 0px 16px"
          >
          </q-input>
        </div>
        <q-separator color="grey-5" />
      </div>
      <div class="bottom" :ref="two">
        <q-btn no-caps style="width: 48%" flat push type="submit">Add</q-btn>
        <q-separator vertical inset color="white" />
        <q-btn no-caps style="width: 52%" flat push @click="complete"
          >Complete</q-btn
        >
      </div>
    </q-form> -->
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
const CartonDetailView = defineComponent({
  setup() {
    const cartonID = ref("11");
    return {
      cartonID,
    };
  },
});
export default CartonDetailView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-flow: column;
  background: rgb(233, 229, 229);
}
.header {
  display: flex;
  background: #fff;
  justify-content: space-around;
  height: 60px;
  align-items: center;
}
.carton-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: #00243d;
  color: #fff;
  flex-flow: column;
}

.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  background: #42b0d5;
  color: white;
  width: 100%;
  height: 50px;
}
</style>

<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">{{ pageTitle }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <q-form @submit="onSubmit" style="background: #fff">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >
        <span style="padding-left: 1rem; color: black"> Reason </span>
        <q-select
          borderless
          style="width: 150px; margin-right: 20px; padding-left: 50px"
          bg-color="white"
          v-model="reason"
          :options="options"
          behavior="menu"
        />
      </div>
      <q-separator color="grey-5" />
      <div v-for="(item, i) in pageViews" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span style="padding-left: 1rem; color: black">
            {{ item.displayFieldName }}
          </span>
          <q-input
            v-model="item.value"
            clearable
            input-class="text-right"
            lazy-rules
            borderless
            style="padding: 0px 16px"
          >
            <template v-slot:append>
              <q-avatar @click="scan(item.displayFieldName)">
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <q-separator color="grey-5" />
      </div>
      <div class="bottom">
        <q-btn
          no-caps
          style="width: 48%"
          flat
          push
          label="Save"
          @click="save"
        />
        <q-separator vertical inset color="white" />
        <q-btn
          no-caps
          style="width: 48%"
          flat
          push
          label="Cancel"
          @click="back"
        />
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const cartonImageView = defineComponent({
  setup() {
    const pageTitle = "Add Cargo";
    const router = useRouter();
    const reason = ref("Damage");
    const pageViews = ref([] as any);
    const options = ["Damage", "Other"];
    onMounted(() => {
      pageViews.value = [
        {
          displayFieldName: "SO",
          value: ref(""),
        },
        {
          displayFieldName: "PO",
          value: ref(""),
        },
        {
          displayFieldName: "CID",
          value: ref(""),
        },
      ];
    });
    const back = () => {
      router.push("/imageAccess");
    };
    const home = () => {
      router.push("/home");
    };
    const save = () => {
      // save
    };
    return {
      pageTitle,
      back,
      home,
      pageViews,
      reason,
      save,
      options,
    };
  },
});
export default cartonImageView;
</script>
<style lang="scss">
.wrapper {
  height: 100vh;
  position: relative;
}
.header {
  position: sticky;
  top: 0;
  width: 100%;
  background-color: #ffffff;
  z-index: 1;
  .q-item {
    background-color: #ffffff;
    height: 60px;
    width: 100%;
  }
  .title-text {
    font-size: 21px;
  }
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

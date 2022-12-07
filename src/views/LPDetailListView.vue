<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">LP List</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
    </div>
    <q-separator color="grey-5" />
    <q-item-section class="taskIdHeader">
      {{ taskId }}
    </q-item-section>
    <div>
      <q-list v-for="(item, index) in lpListDisplay" :key="index">
        <q-item clickable @click="onClickItem(item)">
          <q-item-section>
            <q-item-label>Carton Id: {{ item.cartonId }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator spaced inset />
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";

import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LP } from "../models/profile";

import { useI18n } from "@/plugin/i18nPlugins";

const LPDetailListView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    const taskId = ref(route.query.taskId);
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

    const lpListDisplay: Ref<LP[]> = ref([]);

    const back = () => {
      router.push({
        path: "/taskList",
      });
    };

    const getLPListByTaskId = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      bridge.call("fetchLPByTaskId", args, (res: string) => {
        lpListDisplay.value = JSON.parse(res) as LP[];
      });
    };

    onMounted(() => {
      if (typeof taskId.value === "string") {
        getLPListByTaskId(taskId.value);
      }
    });

    return {
      router,
      lpListDisplay,
      back,
      taskId,
    };
  },
});
export default LPDetailListView;
</script>
<style lang="scss" scoped>
.wrapper {
  .header {
    display: flex;
    background: #fff;
    justify-content: space-around;
    height: 60px;
    align-items: center;
  }
  .search {
    background: #fff;
    height: 60px;
    width: 100%;
  }
  .q-item {
    background-color: #ffffff;
    text-align: left;
    width: 100%;
  }
  .taskIdHeader {
    background: #040000;
    color: #ffffff;
    height: 44px;
  }
}
</style>

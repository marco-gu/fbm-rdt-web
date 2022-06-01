<template>
  <div class="wrapper">
    <div class="header">
      <div style="width: 100%">
        <q-item clickable>
          <q-item-section avatar @click="back">
            <q-icon name="arrow_back" />
          </q-item-section>
          <q-item-section>
            <span style="font-size: 21px">Profile</span></q-item-section
          >
          <q-item-section avatar @click="home">
            <q-icon name="home" />
          </q-item-section>
        </q-item>
      </div>
    </div>
    <div style="margin-top: 10px">
      <div v-if="result.length > 0">
        <q-list v-for="(item, index) in result" :key="index">
          <q-item clickable @click="next(item.client)">
            <q-item-section style="text-align: left">
              <q-item-label>{{ item.client }}</q-item-label>
              <q-item-label caption>{{ item.updateDate }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </q-item>
          <q-separator spaced inset />
        </q-list>
      </div>
      <q-pull-to-refresh @refresh="refresh">
        <q-list>
          <q-item> </q-item>
        </q-list>
      </q-pull-to-refresh>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useRouter } from "vue-router";
import { ProfileMaster } from "../models/profile";
const ProfileView = defineComponent({
  methods: {
    back() {
      this.router.go(-1);
    },
    home() {
      this.router.push("/home");
    },
    next(client: string) {
      this.router.push({ name: "lpSearch", params: { client } });
    },
  },
  setup() {
    const router = useRouter();
    const result: Ref<ProfileMaster[]> = ref([]);
    onMounted(() => {
      bridge.call("fetchProfile", (res: any) => {
        result.value = JSON.parse(res) as ProfileMaster[];
      });
    });
    const refresh = (done: any) => {
      const args = { whId: "NAS01" };
      bridge.call("refreshProfile", args, (res: any) => {
        result.value = JSON.parse(res) as ProfileMaster[];
        done();
      });
    };

    return {
      router,
      refresh,
      result,
    };
  },
});
export default ProfileView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-flow: column;
}
.header {
  background: #027be3;
  padding-top: 1px;
  padding-bottom: 1px;
  display: flex;
  color: #fff;
  justify-content: space-around;
}
</style>

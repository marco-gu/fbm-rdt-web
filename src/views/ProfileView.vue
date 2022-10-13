<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
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
    <q-separator color="grey-5" />
    <div style="margin-top: 10px">
      <div v-if="result.length > 0">
        <q-list v-for="(item, index) in result" :key="index">
          <q-item clickable @click="onClickProfile(item)">
            <q-item-section style="text-align: left">
              <q-item-label>{{ item.client }}</q-item-label>
              <q-item-label caption>{{ item.effectiveDate }}</q-item-label>
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
  },
  setup() {
    const router = useRouter();
    const result: Ref<ProfileMaster[]> = ref([]);
    const refresh = (done: any) => {
      bridge.call("refreshProfile", {}, () => {
        done();
        getProfileList();
      });
    };

    const onClickProfile = (profileItem: any) => {
      router.push({
        name: "lpSearch",
        params: { profile: JSON.stringify(profileItem) },
      });
    };
    const getProfileList = () => {
      bridge.call("fetchProfile", (res: string) => {
        result.value = JSON.parse(res) as ProfileMaster[];
      });
    };
    onMounted(() => {
      getProfileList();
    });

    return {
      router,
      refresh,
      result,
      onClickProfile,
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
  display: flex;
  background: #fff;
  justify-content: space-around;
  height: 60px;
  align-items: center;
}
</style>

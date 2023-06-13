<template>
  <div class="card-area">
    <div class="card" @click="goOnline">
      <div class="title">{{ onlineTitle }}</div>
      <div>
        {{ onlineDesc }}
      </div>
    </div>
    <div class="card" @click="goOffline">
      <div class="title">{{ offlineTitle }}</div>
      <div>
        {{ offlineDesc }}
      </div>
    </div>
    <div class="card" @click="goContinue">
      <div v-show="incompleteCount == 0">
        <div style="margin-bottom: 5px">
          <q-img
            no-transition
            no-spinner
            :src="bellCompleteIcon"
            width="20px"
          />
        </div>
        <div>{{ continueWithNo }}</div>
      </div>
      <div v-show="incompleteCount != 0">
        <div style="margin-bottom: 5px">
          <q-img no-transition no-spinner :src="bellIcon" width="20px" />
        </div>
        <div>
          {{ continuePartialOne }}
          <span style="color: #d62d23; font-weight: bold">{{
            incompleteCount
          }}</span>
          {{ continuePartialTwo }}
          <span style="color: black; font-weight: bold">{{ totalCount }} </span>
          {{ continuePartialThree }}
        </div>
      </div>
    </div>
  </div>
  <div class="more">
    <div
      :class="[isAnimation == true ? 'more-message-animation' : 'more-message']"
    >
      <div>{{ labelOne }}</div>
      <div @click="userManualVisible = true">{{ labelTwo }}</div>
    </div>
    <div
      :class="[isAnimation == true ? 'more-icon-animation' : 'more-icon']"
      id="pointer"
    >
      <q-img no-transition no-spinner :src="pointIcon" width="14px" />
    </div>
    <div
      :class="[isAnimation == true ? 'more-spirit-animation' : 'more-spirit']"
    >
      <q-img no-transition no-spinner :src="spiritIcon" width="60px" />
    </div>
  </div>
  <UserManual
    :dialogVisible="userManualVisible"
    @close="userManualVisible = false"
  >
  </UserManual>
</template>
<script lang="ts">
import { defineComponent, onBeforeMount, ref, computed } from "vue";
import bellComplete from "../assets/icon/bell-complete.svg";
import bell from "../assets/icon/bell-solid.svg";
import point from "../assets/icon/arrow-pointer-solid.svg";
import spirit from "../assets/icon/lns_spirit.png";
import { useRouter } from "vue-router";
import bridge from "dsbridge";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
import UserManual from "@/components/UserManualComponent.vue";
const NewMainView = defineComponent({
  components: { UserManual },
  setup() {
    const router = useRouter();
    const bellIcon = bell;
    const bellCompleteIcon = bellComplete;
    const pointIcon = point;
    const spiritIcon = spirit;
    const incompleteCount = ref(0);
    const totalCount = ref(0);
    const isAnimation = ref();
    const store = useStore();
    const i18n = useI18n();
    const onlineTitle = i18n.t("main.onlineTitle");
    const offlineTitle = i18n.t("main.offlineTitle");
    const onlineDesc = i18n.t("main.online");
    const offlineDesc = i18n.t("main.offline");
    const continueWithNo = i18n.t("main.continueWithNo");
    const continuePartialOne = i18n.t("main.continuePartialOne");
    const continuePartialTwo = i18n.t("main.continuePartialTwo");
    const continuePartialThree = i18n.t("main.continuePartialThree");
    const labelOne = i18n.t("main.labelOne");
    const labelTwo = i18n.t("main.labelTwo");
    const userManualVisible = ref(false);

    setTimeout(() => {
      if (isAnimation.value) {
        const pointer = document.getElementById("pointer") as any;
        pointer.style.visibility = "visible";
      }
    }, 2000);
    onBeforeMount(() => {
      bridge.call("retrieveContinueJobAndTotalCounts", null, (data: any) => {
        const apiResult = JSON.parse(data);
        if (apiResult) {
          incompleteCount.value = apiResult.incompleteCount;
          totalCount.value = apiResult.totalCount;
        }
      });
    });
    isAnimation.value = store.state.commonModule.isAnimation;
    store.dispatch("commonModule/setStopAnimation");
    const goOnline = () => {
      router.push("/profile/online");
    };
    const goOffline = () => {
      router.push("/profile/offline");
    };
    const goContinue = () => {
      router.push("/continueJobs");
    };
    const dynamicPaddingY = computed(() => {
      return window.innerHeight < 600 ? "2%" : "5%";
    });
    return {
      bellIcon,
      pointIcon,
      spiritIcon,
      incompleteCount,
      totalCount,
      goOnline,
      goOffline,
      goContinue,
      bellCompleteIcon,
      isAnimation,
      onlineTitle,
      offlineTitle,
      onlineDesc,
      offlineDesc,
      continuePartialOne,
      continuePartialTwo,
      continuePartialThree,
      continueWithNo,
      labelOne,
      labelTwo,
      userManualVisible,
      dynamicPaddingY,
    };
  },
});
export default NewMainView;
</script>
<style lang="scss" scoped>
.card {
  width: 80%;
  text-align: center;
  border-bottom: 1px solid #f6f3f1;
  padding: v-bind("dynamicPaddingY") 0;
  margin: 0px auto;
  .title {
    font-weight: 600;
    font-variant: small-caps;
    font-size: 20px;
  }
}
.more {
  position: relative;
  margin: 10px auto;
  padding: 5% 0;
  width: 80%;
}
.more-icon {
  position: absolute;
  top: 18px;
  right: 60px;
  animation: twinkle 8s;
  animation-iteration-count: infinite;
}

.more-icon-animation {
  visibility: hidden;
  position: absolute;
  top: 18px;
  right: 60px;
  animation: twinkle 8s;
  animation-iteration-count: infinite;
}
.more-message-animation {
  animation-name: moveMsg;
  animation-duration: 1.5s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
}
.more-spirit-animation {
  position: absolute;
  top: 36px;
  animation-name: move;
  animation-duration: 1.5s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
}
.more-spirit {
  position: absolute;
  top: 36px;
  left: 30px;
}
@keyframes move {
  0% {
    transform: translateX(-100px);
  }
  80% {
    transform: translateX(45px);
  }
  100% {
    transform: translateX(30px);
  }
}
@keyframes moveMsg {
  0% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(0px);
  }
}
@keyframes movePointer {
  0% {
    transform: translateX(-100px);
  }
  80% {
    transform: translateX(15px);
  }
  100% {
    transform: translateX(0px);
  }
}

@keyframes twinkle {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0;
  }
}
</style>

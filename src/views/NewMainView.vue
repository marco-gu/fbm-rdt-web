<template>
  <div class="card" @click="goOnline">
    <div class="title">New Scan</div>
    <div>
      Start a new carton id (SSCC) scan job, validate against the factory file
      or SO received. Please select client profile firstly.
    </div>
  </div>
  <div class="card" @click="goOffline">
    <div class="title">Blind Scan</div>
    <div>
      Start a new carton id (SSCC) scan job, WITHOUT factory file or SO
      replaced, you should upload and validate the scan info afterwards.
    </div>
  </div>
  <div class="card" @click="goContinue">
    <div v-show="count == 0">
      <div style="margin-bottom: 5px">
        <q-img no-transition no-spinner :src="bellCompleteIcon" width="20px" />
      </div>
      <div>No outstanding scan job, well done!</div>
    </div>
    <div v-show="count != 0">
      <div style="margin-bottom: 5px">
        <q-img no-transition no-spinner :src="bellIcon" width="20px" />
      </div>
      <div>
        There is (are)
        <span style="color: #d62d23; font-weight: bold">{{ count }}</span>
        incomplete job(s), please click this card to continue.
      </div>
    </div>
  </div>
  <div class="more">
    <div
      :class="[isAnimation == true ? 'more-message-animation' : 'more-message']"
    >
      <div>Please get started</div>
      <div>Need help?</div>
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
</template>
<script lang="ts">
import { defineComponent, onBeforeMount, ref } from "vue";
import bellComplete from "../assets/icon/bell-complete.svg";
import bell from "../assets/icon/bell-solid.svg";
import point from "../assets/icon/arrow-pointer-solid.svg";
import spirit from "../assets/icon/lns_spirit.png";
import { useRouter } from "vue-router";
import bridge from "dsbridge";
import { ScanDataManagement } from "@/models/profile";
import store, { useStore } from "@/store";
const NewMainView = defineComponent({
  setup() {
    const router = useRouter();
    const bellIcon = bell;
    const bellCompleteIcon = bellComplete;
    const pointIcon = point;
    const spiritIcon = spirit;
    const count = ref(0);
    const isAnimation = ref();
    const store = useStore();
    setTimeout(() => {
      if (isAnimation.value) {
        const pointer = document.getElementById("pointer") as any;
        pointer.style.visibility = "visible";
      }
    }, 2000);
    onBeforeMount(() => {
      bridge.call("retrieveContinueJobCounts", null, (data: any) => {
        const apiResult = JSON.parse(data);
        if (apiResult) {
          count.value = apiResult;
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
    return {
      bellIcon,
      pointIcon,
      spiritIcon,
      count,
      goOnline,
      goOffline,
      goContinue,
      bellCompleteIcon,
      isAnimation,
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
  padding: 5% 0;
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

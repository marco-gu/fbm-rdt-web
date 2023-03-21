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
    <div style="margin-bottom: 5px">
      <q-img no-transition no-spinner :src="bellIcon" width="20px" />
    </div>
    <div>No outstanding scan job, well done!</div>
    <!-- <div>
      There is (are)
      <span style="color: #d62d23">{{ count }}</span>
      incomplete job(s), please click this card to continue.
    </div> -->
  </div>
  <div class="more">
    <div>Please get started</div>
    <div>Need help?</div>
    <div class="more-icon">
      <q-img no-transition no-spinner :src="pointIcon" width="14px" />
    </div>
    <div class="more-spirit">
      <q-img no-transition no-spinner :src="spiritIcon" width="60px" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import bell from "../assets/icon/bell-complete.svg";
// import bell from "../assets/icon/bell-solid.svg";
import point from "../assets/icon/arrow-pointer-solid.svg";
import spirit from "../assets/icon/lns_spirit.png";
import { useRouter } from "vue-router";
const NewMainView = defineComponent({
  setup() {
    const router = useRouter();
    const bellIcon = bell;
    const pointIcon = point;
    const spiritIcon = spirit;
    const count = ref(0);
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
  animation: twinkle 5s;
  animation-iteration-count: infinite;
}
.more-spirit {
  position: absolute;
  top: 36px;
  animation-name: move;
  animation-duration: 1.5s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
}
@keyframes move {
  0% {
    transform: translateX(-100px);
  }
  80% {
    transform: translateX(45px);
  }
  100% {
    transform: translateX(40px);
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

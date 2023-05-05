<template>
  <div class="common-header--container">
    <header class="title-container">
      <template v-for="(items, index) in titles" :key="index">
        <span v-show="titles.length - index <= 3" class="title-container--items"
          >{{ items }}
        </span>
        <span
          class="title-container--items separator"
          v-show="index + 1 !== titles.length && titles.length - index <= 3"
          >|</span
        >
      </template>
    </header>
    <div class="button-container">
      <a v-if="icons.indexOf('back') > -1" class="icon" @click="onBackEmit">
        <img :src="backIcon" />
        <!-- <i class="fa-solid fa-arrow-left"></i> -->
      </a>
      <a
        v-if="icons.indexOf('search') > -1"
        class="icon"
        @click="searchVisible = !searchVisible"
        ><i class="fa-solid fa-magnifying-glass"></i
      ></a>
      <a v-if="icons.indexOf('clear') > -1" class="icon" @click="onClearEmit"
        ><i class="fa-solid fa-rotate-left"></i>
      </a>
      <a v-if="icons.indexOf('empty') > -1" class="icon"> </a>
      <a v-if="icons.indexOf('empty-2') > -1" class="icon"> </a>
      <!-- <a v-if="icons.indexOf('expand') > -1" class="icon" @click="onExpandClick"
        ><i class="fa-solid fa-percent"></i
      ></a> -->
      <a v-if="icons.indexOf('sync') > -1" class="icon" @click="onSyncEmit"
        ><i class="fa-solid fa-rotate-right"></i>
      </a>
      <!-- <a v-if="icons.indexOf('clear') > -1" class="icon" @click="onClearEmit"
        ><i class="fa-solid fa-rotate-left"></i>
      </a> -->
      <a v-if="icons.indexOf('detail') > -1" class="icon" @click="onDetailEmit"
        ><i class="fa-solid fa-list"></i
      ></a>
      <a v-if="icons.indexOf('mixed') > -1" class="icon" @click="onMixedEmit"
        ><i class="fa-solid fa-list"></i
      ></a>
      <a v-if="icons.indexOf('home') > -1" class="icon" @click="onHomeClick"
        ><i class="fa-solid fa-house"></i
      ></a>
    </div>
  </div>
  <div v-if="searchVisible" class="common-header--search-container">
    <input
      :value="searchValue"
      type="search"
      @keyup.enter="onSearchEmit($event)"
      @input="onSearchEmit($event)"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import backIcon from "../assets/icon/icon_header_back.png";
const CommonHeaderComponent = defineComponent({
  props: {
    titles: {
      type: Array,
      default: () => ["Some Title"],
    },
    icons: {
      type: Array,
      default: () => ["home", "search", "expand"],
    },
    searchValue: {
      type: String,
      default: "",
    },
  },
  emits: [
    "onHome",
    "onSearch",
    "onExpand",
    "update:searchValue",
    "onSync",
    "onBack",
    "onClear",
    "onDetail",
    "onMixed",
  ],
  setup(props, context) {
    const searchVisible = ref(false);

    const onHomeClick = () => {
      context.emit("onHome");
    };
    const onExpandClick = () => {
      context.emit("onExpand");
    };
    const onSearchEmit = (e: any) => {
      context.emit("update:searchValue", e.target.value);
    };
    const onSyncEmit = () => {
      context.emit("onSync");
    };
    const onBackEmit = () => {
      context.emit("onBack");
    };
    const onClearEmit = () => {
      context.emit("onClear");
    };
    const onDetailEmit = () => {
      context.emit("onDetail");
    };
    const onMixedEmit = () => {
      context.emit("onMixed");
    };
    return {
      onHomeClick,
      onSearchEmit,
      onExpandClick,
      searchVisible,
      onSyncEmit,
      onBackEmit,
      onClearEmit,
      onDetailEmit,
      onMixedEmit,
      backIcon,
    };
  },
});
export default CommonHeaderComponent;
</script>
<style scoped lang="scss">
.common-header {
  background-color: #f2f2f2;
  &--container {
    color: #ffffff;
    width: 100%;
    padding: 30px 5px 5px 5px;
    font-size: 14px;
    font-weight: 500;
    font-variant: small-caps;
    text-align: center;
    background-color: #262626;

    .title-container {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      overflow-x: auto;

      &--items {
        animation: fade-in 0.5s ease-in-out;
      }
      .separator {
        margin: 0 5px;
        font-weight: 300;
        font-size: 8px;
      }
    }
    .button-container {
      margin-top: 10px;
      margin-bottom: 5px;
      display: flex;
      .icon {
        font-size: 21px;
        display: inline-block;
        flex: 1;
        text-align: center;
      }
      img {
        width: 15px;
      }
    }
  }
  &--search-container {
    margin: 14px auto 0;
    padding: 0 23px;
    input {
      width: 100%;
      height: 41px;
      padding: 0 10px;
      border: 1px solid #e5e2dc;
      border-radius: 5px;
      // font-size: 12px;
      &:focus {
        outline-color: #64b2d4;
      }
    }
    transform-origin: top;
    animation: search-anim 0.3s ease-out;
  }
  .transparent {
    opacity: 0;
  }
}
@keyframes fade-in {
  from {
    margin-right: -30px;
    opacity: 0;
  }
  to {
    margin-right: 0;
    opacity: 1;
  }
}
@keyframes search-anim {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
</style>

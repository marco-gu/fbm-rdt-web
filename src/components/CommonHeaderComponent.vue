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
      <a v-if="icons.indexOf('home') > -1" class="icon" @click="onHomeClick"
        ><i class="fa-solid fa-house"></i
      ></a>
      <a
        v-if="icons.indexOf('search') > -1"
        class="icon"
        @click="searchVisible = !searchVisible"
        ><i class="fa-solid fa-magnifying-glass"></i
      ></a>
      <a v-if="icons.indexOf('expand') > -1" class="icon" @click="onExpandClick"
        ><i class="fa-solid fa-percent"></i
      ></a>
    </div>
  </div>
  <div v-if="searchVisible" class="common-header--search-container">
    <input
      v-model="searchValue"
      type="search"
      @keyup.enter="onSearchEmit"
      @blur="onSearchEmit"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";
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
  },
  emits: ["onHome", "onSearch", "onExpand"],
  setup(props, context) {
    const searchValue = ref("");
    const searchVisible = ref(false);

    const onHomeClick = () => {
      context.emit("onHome");
    };
    const onExpandClick = () => {
      context.emit("onExpand");
    };
    const onSearchEmit = () => {
      context.emit("onSearch", searchValue.value);
    };
    return {
      onHomeClick,
      onSearchEmit,
      onExpandClick,
      searchVisible,
      searchValue,
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
    padding: 5px;
    font-size: 12px;
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
      .icon {
        font-size: 14px;
        display: inline-block;
        width: 30%;
        text-align: center;
      }
    }
  }
  &--search-container {
    margin: 10px auto;
    width: 90%;
    input {
      width: 100%;
      height: 30px;
      padding: 0 10px;
      border: 1px solid #e5e2dc;
      font-size: 12px;
    }
    transform-origin: top;
    animation: search-anim 0.3s ease-out;
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

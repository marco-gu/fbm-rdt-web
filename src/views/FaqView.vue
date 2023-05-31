<template>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('login.login_help')]"
      :icons="['back', 'home']"
      @onHome="goFirstPage"
      @onBack="() => router.push('/')"
    />
    <div class="page-content faq-container">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div class="need-login-help">Need Login Help?</div>
        <div class="faq-list">
          <ul class="faq-ul">
            <li v-for="(faq, index) in faqList" :key="index">
              <div class="question" @click="toggleAnswer(index)">
                <span class="arrow" :class="{ rotate: faq.showAnswer }"></span>
                {{ faq.question }}
                <hr v-show="faq.showAnswer" />
              </div>
              <div class="answer" :class="{ show: faq.showAnswer }">
                {{ faq.answer }}
              </div>
            </li>
          </ul>
        </div>
        <p class="footer-hint">
          For any additional issues, please contact local super user.
        </p>
      </q-scroll-area>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { faq } from "@/utils/faq.list";
import { setContentHeight } from "@/utils/screen.util";
import bridge from "dsbridge";

export default defineComponent({
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    const faqList = ref(faq);

    const goFirstPage = () => {
      bridge.call("goFirstPage");
    };

    const toggleAnswer = (index: number) => {
      faqList.value[index].showAnswer = !faqList.value[index].showAnswer;
    };

    onMounted(() => {
      const deviceHeight = store.state.screenModule.screenHeight;
      setContentHeight("scroll-area", deviceHeight);
    });

    return { router, faqList, toggleAnswer, goFirstPage };
  },
});
</script>

<style scoped>
.need-login-help {
  font-weight: bold;
  font-size: 18px;
  margin-left: 20px;
  padding-top: 22px;
}
.faq-container {
  text-align: left;
}

.faq-list {
  display: flex;
  justify-content: center;
}

.faq-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 15px 15px 0;
  margin: 15px 20px;
  background-color: white;
  border-radius: 10px;
  border: 2px solid #e4e2dd;
  text-transform: capitalize;
}

hr {
  background-color: #878787;
  height: 1px;
  border: none;
}

.question {
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
}

.answer {
  font-size: 16px;
  margin: 8px;
  margin-left: 18px;
  max-height: 0;
  overflow: hidden;
  transition: 200px 0.3s ease;
}

.answer.show {
  max-height: 200px;
}

.arrow {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border: 1px solid black;
  border-width: 0 2px 2px 0;
  transform: rotate(-45deg);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.rotate {
  transform: rotate(45deg);
}

.footer-hint {
  margin: 5px 20px;
  font-size: 16px;
  text-transform: capitalize;
}
</style>

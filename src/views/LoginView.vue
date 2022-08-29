<template>
  <div class="login-page">
    <div class="form">
      <div class="login-form">
        <input
          type="text"
          placeholder="username"
          v-model="this.userInfo.username"
        />
        <input
          type="password"
          placeholder="password"
          v-model="this.userInfo.password"
        />
        <button v-on:click="login">login</button>
        <!-- <p class="message">
          <a href="#">Forgot Password?</a>
        </p> -->
        <div style="margin-top: 20px; color: red">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRoute, useRouter } from "vue-router";
import bridge from "dsbridge";
import { defineComponent, onMounted, ref } from "vue";
import { User } from "../models/user";
const LoginView = defineComponent({
  data() {
    return {
      userInfo: new User("", ""),
    };
  },
  methods: {
    login() {
      const args = new User(this.userInfo.username, this.userInfo.password);
      bridge.call("login", args, (res: number) => {
        if (res == 200) {
          this.router.push("/home");
        } else {
          alert("failure");
        }
      });
    },
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const errorMessage = ref("");
    onMounted(() => {
      if (route.params.message != undefined) {
        errorMessage.value = route.params.message as string;
      }
    });
    return {
      router,
      errorMessage,
    };
  },
});
export default LoginView;
</script>
<style scoped>
.login-page {
  width: 360px;
  padding: 15% 0 0;
  margin: auto;
}
.form {
  position: relative;
  z-index: 1;
  background: #ffffff;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
}
.form input {
  font-family: "Roboto", sans-serif;
  outline: 0;
  background: #f2f2f2;
  width: 100%;
  border: 0;
  margin: 0 0 15px;
  padding: 15px;
  box-sizing: border-box;
  font-size: 14px;
}
.form button {
  font-family: "Roboto", sans-serif;
  text-transform: uppercase;
  outline: 0;
  background: #027be3;
  width: 100%;
  border: 0;
  padding: 15px;
  color: #ffffff;
  font-size: 14px;
  -webkit-transition: all 0.3 ease;
  transition: all 0.3 ease;
  cursor: pointer;
}
.form button:hover,
.form button:active,
.form button:focus {
  background: #027be3;
}
.form .message {
  margin: 15px 0 0;
  color: #b3b3b3;
  font-size: 12px;
}
.form .message a {
  color: #027be3;
  text-decoration: none;
}
.form .register-form {
  display: none;
}
</style>

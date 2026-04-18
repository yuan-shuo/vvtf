<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = () => {
  // 模拟登录
  localStorage.setItem('token', 'fake-token')
  router.push('/')
}
</script>

<template>
  <div>
    <h1>登录</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <input v-model="email" type="email" placeholder="邮箱" />
      </div>
      <div>
        <input v-model="password" type="password" placeholder="密码" />
      </div>
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "layout": "BlankLayout",
    "title": "登录"
  }
}
</route>

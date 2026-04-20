<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/user/user'
import type { LoginReq } from '@/api/user/userComponents'
import { noauthReq } from '@/api/core/noauthRequest'
import { isApiError } from '@/api/core/authRequest'
import { saveTokens } from '@/api/core/token'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert('请输入邮箱和密码')
    return
  }

  loading.value = true

  try {
    const req: LoginReq = {
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    }

    const resp = await noauthReq(login(req))

    saveTokens(resp)

    router.push('/')
  } catch (error: any) {
    if (isApiError(error)) {
      alert(error.msg)
    } else {
      alert('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
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
      <div>
        <label>
          <input v-model="rememberMe" type="checkbox" />
          记住我
        </label>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    <div>
      <router-link to="/user/register">注册账号</router-link>
      <span> | </span>
      <router-link to="/user/reset-password">忘记密码</router-link>
    </div>
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

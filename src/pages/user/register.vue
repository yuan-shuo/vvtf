<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, sendVerifyCode } from '@/api/user/user'
import type { RegisterReq, SendVerifyCodeReq } from '@/api/user/userComponents'
import { handleRequest, isApiError } from '@/api/request'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const nickname = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const handleSendCode = async () => {
  if (!email.value) {
    alert('请输入邮箱')
    return
  }

  sendingCode.value = true

  try {
    const req: SendVerifyCodeReq = {
      email: email.value,
      type: 'register'
    }

    const resp = await handleRequest(sendVerifyCode(req))

    alert('验证码已发送')

    countdown.value = resp.retryAfter || 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    if (isApiError(error)) {
      alert(error.msg)
    } else {
      alert('发送验证码失败')
    }
  } finally {
    sendingCode.value = false
  }
}

const handleRegister = async () => {
  if (!email.value || !password.value || !code.value || !nickname.value) {
    alert('请填写所有必填项')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  loading.value = true

  try {
    const req: RegisterReq = {
      email: email.value,
      password: password.value,
      code: code.value,
      nickname: nickname.value
    }

    await handleRequest(register(req))

    alert('注册成功，请登录')
    router.push('/user/login')
  } catch (error: any) {
    if (isApiError(error)) {
      alert(error.msg)
    } else {
      alert('注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1>注册</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <input v-model="nickname" type="text" placeholder="昵称" />
      </div>
      <div>
        <input v-model="email" type="email" placeholder="邮箱" />
      </div>
      <div>
        <input v-model="code" type="text" placeholder="验证码" />
        <button type="button" :disabled="sendingCode || countdown > 0" @click="handleSendCode">
          {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
        </button>
      </div>
      <div>
        <input v-model="password" type="password" placeholder="密码" />
      </div>
      <div>
        <input v-model="confirmPassword" type="password" placeholder="确认密码" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>
    <div>
      <router-link to="/user/login">已有账号？去登录</router-link>
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "layout": "BlankLayout",
    "title": "注册"
  }
}
</route>

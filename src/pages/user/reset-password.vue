<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword, sendVerifyCode } from '@/api/user/user'
import type { ResetPasswordReq, SendVerifyCodeReq } from '@/api/user/userComponents'
import { noauthReq } from '@/api/core/noauthRequest'
import { isApiError } from '@/api/core/authRequest'

const router = useRouter()
const email = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
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
      type: 'reset_password'
    }

    const resp = await noauthReq(sendVerifyCode(req))

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

const handleResetPassword = async () => {
  if (!email.value || !code.value || !password.value) {
    alert('请填写所有必填项')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  loading.value = true

  try {
    const req: ResetPasswordReq = {
      email: email.value,
      password: password.value,
      code: code.value
    }

    await noauthReq(resetPassword(req))

    alert('密码重置成功，请登录')
    router.push('/user/login')
  } catch (error: any) {
    if (isApiError(error)) {
      alert(error.msg)
    } else {
      alert('密码重置失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1>找回密码</h1>
    <form @submit.prevent="handleResetPassword">
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
        <input v-model="password" type="password" placeholder="新密码" />
      </div>
      <div>
        <input v-model="confirmPassword" type="password" placeholder="确认新密码" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '重置中...' : '重置密码' }}
      </button>
    </form>
    <div>
      <router-link to="/user/login">返回登录</router-link>
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "layout": "BlankLayout",
    "title": "找回密码"
  }
}
</route>

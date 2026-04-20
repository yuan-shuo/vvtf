<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword, sendVerifyCode } from '@/api/user/user'
import type { ChangePasswordReq, SendVerifyCodeReq } from '@/api/user/userComponents'
import { authReq } from '@/api/core/authRequest'
import { noauthReq } from '@/api/core/noauthRequest'
import { isApiError } from '@/api/core/authRequest'
import { getCurrentUser, clearTokens } from '@/api/core/token'

const router = useRouter()
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const code = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const user = getCurrentUser()

const handleSendCode = async () => {
  if (!user?.email) {
    alert('无法获取用户邮箱')
    return
  }

  sendingCode.value = true

  try {
    const req: SendVerifyCodeReq = {
      email: user.email,
      type: 'change_password'
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

const handleChangePassword = async () => {
  if (!oldPassword.value || !newPassword.value || !code.value) {
    alert('请填写所有必填项')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert('两次输入的新密码不一致')
    return
  }

  loading.value = true

  try {
    const req: ChangePasswordReq = {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
      code: code.value
    }

    await authReq(() => changePassword(req))

    clearTokens()
    alert('密码修改成功，请重新登录')
    
    router.push('/user/login')
  } catch (error: any) {
    if (isApiError(error)) {
      alert(error.msg)
    } else {
      alert('密码修改失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1>修改密码</h1>
    <div v-if="user">
      <p>邮箱: {{ user.email }}</p>
    </div>
    <form @submit.prevent="handleChangePassword">
      <div>
        <input v-model="oldPassword" type="password" placeholder="旧密码" />
      </div>
      <div>
        <input v-model="newPassword" type="password" placeholder="新密码" />
      </div>
      <div>
        <input v-model="confirmPassword" type="password" placeholder="确认新密码" />
      </div>
      <div>
        <input v-model="code" type="text" placeholder="验证码" />
        <button type="button" :disabled="sendingCode || countdown > 0" @click="handleSendCode">
          {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
        </button>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '修改中...' : '修改密码' }}
      </button>
    </form>
    <div>
      <router-link to="/user">返回个人中心</router-link>
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "layout": "BlankLayout",
    "title": "修改密码"
  }
}
</route>

<script setup lang="ts">
import { clearTokens, getCurrentUser } from '@/api/core/token'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = getCurrentUser()

const handleLogout = () => {
  clearTokens()
  router.push('/user/login')
}
</script>

<template>
  <div>
    <h1>用户中心</h1>
    <div v-if="user">
      <p>昵称: {{ user.nickname }}</p>
      <p>邮箱: {{ user.email }}</p>
    </div>
    <div>
      <router-link to="/user/change-password">修改密码</router-link>
    </div>
    <div>
      <button @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "requiresAuth": true,
    "title": "用户管理"
  }
}
</route>

<!-- (必要) 404 页面 -->
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div>
    <h1>404</h1>
    <p>页面不存在</p>
    <button @click="goHome">返回首页</button>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "layout": "BlankLayout",
    "title": "页面不存在"
  }
}
</route>

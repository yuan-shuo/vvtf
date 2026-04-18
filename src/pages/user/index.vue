<script setup lang="ts">
</script>

<template>
  <div>
    <h1>用户列表</h1>
    <ul>
      <li>用户1</li>
      <li>用户2</li>
      <li>用户3</li>
    </ul>
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

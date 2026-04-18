<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <header class="header">
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/user">用户</router-link>
        <router-link to="/about">关于</router-link>
      </nav>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

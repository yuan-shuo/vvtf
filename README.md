[![CI](https://github.com/yuan-shuo/vvtf/workflows/CI/badge.svg)](https://github.com/yuan-shuo/vvtf/actions)

# VVTF - Vue Vite TypeScript Framework

前端框架，兼容 gozero 生成的 TypeScript 代码，专注于简化开发流程。

## 核心特性

1. **兼容 gozero**: 允许 goctl 直接生成 TS 代码到 `src/api/<微服务名>` 目录
2. **技术栈**: Vue 3 + TypeScript + Vite + gozero
3. **无 CSS**: 拒绝使用任何 CSS 样式，专注于逻辑
4. **约定式路由**: 文件即路由，无需手动配置

---

## 当前功能页面介绍

项目已内置完整的用户认证体系：

| 页面 | 路径 | 功能 | 是否需要登录 |
|------|------|------|-------------|
| 首页 | `/` | 项目入口 | 否 |
| 登录 | `/user/login` | 用户登录 | 否 |
| 注册 | `/user/register` | 用户注册 | 否 |
| 重置密码 | `/user/reset-password` | 通过邮箱重置密码 | 否 |
| 用户中心 | `/user` | 展示用户信息、退出登录 | 是 |
| 修改密码 | `/user/change-password` | 修改登录密码（需验证码） | 是 |

### 技术实现

- **Token 管理**: JWT 存储于 localStorage，自动刷新
- **请求封装**: `authReq`（需登录）和 `noauthReq`（无需登录）
- **路由守卫**: 自动拦截未登录用户访问受保护页面
- **错误处理**: 统一处理后端错误码，自动提示

---

## 开发新功能页面的步骤

### 在 pages 目录创建 Vue 文件

```
src/pages/
├── index.vue              # 首页 /
├── user/
│   ├── index.vue          # 用户中心 /user
│   ├── login.vue          # 登录 /user/login
│   └── [你的新页面].vue    # 自动成为路由
```

**文件即路由规则：**

| 文件路径 | 路由路径 |
|---------|---------|
| `pages/about.vue` | `/about` |
| `pages/order/list.vue` | `/order/list` |
| `pages/admin/settings/index.vue` | `/admin/settings` |

### 编写页面代码

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<template>
  <div>
    <h1>我的页面</h1>
    <p>计数: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="router.push('/')">返回首页</button>
  </div>
</template>
```

### 配置路由元信息（可选）

```vue
<route lang="json">
{
  "meta": {
    "title": "我的页面",
    "layout": "BlankLayout",
    "requiresAuth": true
  }
}
</route>
```

| 配置项 | 说明 |
|-------|------|
| `title` | 页面标题 |
| `layout` | `DefaultLayout`（默认，带导航）或 `BlankLayout`（空白） |
| `requiresAuth` | `true` 表示需要登录 |

### 访问页面

直接访问对应 URL，无需其他配置：
```
http://localhost:5173/你的页面路径
```

---

## 使用 goctl 生成的 TypeScript 代码

### 生成代码

在后端项目执行 goctl 生成 TS 客户端代码：

```bash
goctl api ts -api *.api -dir ../vite-project/src/api/<微服务名>
```

例如生成用户服务代码到 `src/api/user/`：
```bash
goctl api ts -api user.api -dir ../vite-project/src/api/user
```

### 生成的文件结构

```
src/api/user/                    # goctl 生成，不可修改
├── gocliRequest.ts             # 基础请求方法
├── user.ts                     # API 方法（login, register 等）
└── userComponents.ts           # 类型定义（LoginReq, LoginResp 等）

src/api/core/                    # 核心封装，可修改
├── token.ts                    # Token 管理
├── authRequest.ts              # 认证请求包装器
├── noauthRequest.ts            # 非认证请求包装器
└── request.ts                  # 错误处理
```

### 在页面中使用

#### 不需要登录的请求

直接导入并使用 `noauthReq` 包裹请求函数即可

```vue
<script setup lang="ts">
import { noauthReq } from '@/api/core/noauthRequest'
import { login } from '@/api/user/user'
import type { LoginReq } from '@/api/user/userComponents'
import { saveTokens } from '@/api/core/token'

const handleLogin = async () => {
  const req: LoginReq = {
    email: 'user@example.com',
    password: '123456',
    rememberMe: true
  }
  
  try {
    const resp = await noauthReq(login(req)) // * 无认证请求
    saveTokens(resp)  // 保存 token
    alert('登录成功')
  } catch (error) {
    // 错误已自动处理，会弹出提示
  }
}
</script>
```

#### 需要登录的请求

不同于非认证函数，需要导入并使用 `authReq` 包裹请求函数的工厂函数

**注意：必须传入工厂函数 `() => apiFunction()`**

```vue
<script setup lang="ts">
import { authReq } from '@/api/core/authRequest'
import { changePassword } from '@/api/user/user'
import type { ChangePasswordReq } from '@/api/user/userComponents'

const handleChangePassword = async () => {
  const req: ChangePasswordReq = {
    oldPassword: 'old123',
    newPassword: 'new123',
    code: '123456'
  }
  
  try {
    // 传入工厂函数
    await authReq(() => changePassword(req)) // * 需要认证的请求
    alert('修改成功')
  } catch (error) {
    // 错误已自动处理
  }
}
</script>
```

### 常用 API

```typescript
// Token 管理
import { saveTokens, clearTokens, isLoggedIn, getCurrentUser } from '@/api/core/token'

saveTokens(loginResponse)      // 登录后保存 token
clearTokens()                  // 退出登录
isLoggedIn()                   // 检查是否已登录
getCurrentUser()               // 从 JWT 获取用户信息

// 错误判断
import { isApiError } from '@/api/core/authRequest'  // 或 noauthRequest

if (isApiError(error)) {
  console.log(error.code, error.msg)
}
```

---

## 完整示例：计数器页面

假设后端已生成一个计数器服务的 TS 代码到 `src/api/counter/`，我们来创建一个计数器页面。

### 后端 API 定义（counter.api）

```go
type (
    GetCountReq  {}
    GetCountResp {
        Count int64 `json:"count"`
    }
    
    IncrementReq {
        Delta int64 `json:"delta"`
    }
    IncrementResp {
        Count int64 `json:"count"`
    }
)

service counter-api {
    @handler getCount
    get /api/counter/v1/count (GetCountReq) returns (GetCountResp)
    
    @handler increment
    post /api/counter/v1/increment (IncrementReq) returns (IncrementResp)
}
```

### 生成 TS 代码

```bash
goctl api ts -api counter.api -dir ../vite-project/src/api/counter
```

生成后的文件：
```
src/api/counter/
├── gocliRequest.ts
├── counter.ts              // 包含 getCount, increment 方法
└── counterComponents.ts    // 包含类型定义
```

### 创建计数器页面

创建 `src/pages/counter.vue`：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authReq } from '@/api/core/authRequest'
import { getCount, increment } from '@/api/counter/counter'
import type { IncrementReq } from '@/api/counter/counterComponents'

const count = ref(0)
const loading = ref(false)

// 页面加载时获取当前计数
onMounted(async () => {
  try {
    const resp = await authReq(() => getCount({}))
    count.value = resp.count
  } catch (error) {
    // 错误已自动处理
  }
})

// 点击增加计数
const handleIncrement = async () => {
  loading.value = true
  
  try {
    const req: IncrementReq = {
      delta: 1
    }
    const resp = await authReq(() => increment(req))
    count.value = resp.count
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1>计数器</h1>
    <p>当前计数: {{ count }}</p>
    <button @click="handleIncrement" :disabled="loading">
      {{ loading ? '加载中...' : '点击 +1' }}
    </button>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "title": "计数器",
    "requiresAuth": true
  }
}
</route>
```

### 访问页面

```
http://localhost:5173/counter
```

---

## 架构设计

### 目录结构

```
src/
├── api/                        # API 接口
│   ├── core/                   # 核心请求模块（可修改）
│   │   ├── token.ts           # Token 存储、刷新管理
│   │   ├── authRequest.ts     # 认证请求包装器（自动携带token）
│   │   ├── noauthRequest.ts   # 非认证请求包装器
│   │   └── request.ts         # 基础错误处理
│   └── <微服务名>/             # goctl 生成（不可修改）
│       ├── gocliRequest.ts
│       ├── *.ts               # API 方法
│       └── *Components.ts     # 类型定义
├── components/                 # 公共组件
│   └── common/                 # 通用组件
├── layouts/                    # 布局组件
│   ├── DefaultLayout.vue      # 默认布局（带导航）
│   └── BlankLayout.vue        # 空白布局
├── pages/                      # 页面目录（核心）
│   ├── index.vue              # 首页 /
│   ├── 404.vue                # 404 页面 *
│   └── */                     # 子目录自动映射为子路由
├── router/                     # 路由配置
│   ├── index.ts               # 路由入口
│   └── guard.ts               # 路由守卫
├── stores/                     # Pinia 状态管理
├── utils/                      # 工具函数
├── types/                      # 类型定义
├── App.vue                     # 根组件
└── main.ts                     # 入口文件
```

### 核心设计原则

#### 文件即路由（约定式路由）

`pages/` 目录下的任意 `.vue` 文件会自动映射为路由，支持无限层级嵌套。

**路由映射规则：**

| 文件路径 | 路由路径 | 说明 |
|---------|---------|------|
| `pages/index.vue` | `/` | 首页 |
| `pages/login.vue` | `/login` | 一级路由 |
| `pages/user/index.vue` | `/user` | 二级目录的 index.vue |
| `pages/user/profile.vue` | `/user/profile` | 二级路由 |
| `pages/admin/settings/index.vue` | `/admin/settings` | 三级目录 |

**特殊规则：** 所有以 `index.vue` 结尾的文件，其路由路径会去掉 `/index` 部分。

#### 命名规范

- **目录名**: 小写字母，多单词用连字符 `-` 连接
  - ✅ `user-center/`, `order-management/`
  - ❌ ~~`userCenter/`~~, ~~`user_center/`~~
  
- **文件名**: 小写字母，多单词用连字符 `-` 连接
  - ✅ `user-profile.vue`, `order-list.vue`
  - ❌ ~~`userProfile.vue`~~, ~~`user_profile.vue`~~
  
### 页面开发流程

1. **创建页面文件**: 在 `pages/` 目录下创建 `.vue` 文件
2. **编写页面代码**: 直接使用 Vue 3 + TypeScript
3. **配置路由元信息**: 使用 `<route>` block 配置标题、布局、权限
4. **访问页面**: 路由已自动生成，直接访问 URL

### 路由元信息配置

```vue
<route lang="json">
{
  "meta": {
    "requiresAuth": true,        // 是否需要登录
    "title": "页面标题",          // 页面标题
    "layout": "BlankLayout"      // 使用布局
  }
}
</route>
```

### 页面传参与跳转

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 获取 URL 参数 /user/123
const id = route.params.id

// 获取查询参数 /user?id=123
const keyword = route.query.keyword

// 页面跳转
router.push('/user/profile')
router.push({ path: '/user/profile', query: { id: '123' } })
router.replace('/login')  // 替换当前页面
router.back()             // 返回上一页
</script>
```

---

## 注意事项

1. **不要修改 goctl 生成的文件**（`src/api/<微服务名>/` 目录下）
2. CI 会自动检查并阻止对生成文件的修改
3. 所有 API 调用都通过 `authReq` 或 `noauthReq` 包装
4. `authReq` 必须传入工厂函数：`authReq(() => apiFunction())`
5. Token 存储在 localStorage 中

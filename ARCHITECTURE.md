# 前端架构设计文档

## 架构目标

让开发者只需要关注 Vue 页面文件的编写，其他所有配置都已预先处理好。

## 目录结构

```
src/
├── api/                    # API 接口（已存在）
│   └── user/
├── components/             # 公共组件
│   └── common/             # 通用组件
├── layouts/                # 布局组件
│   ├── DefaultLayout.vue   # 默认布局（带导航）
│   └── BlankLayout.vue     # 空白布局
├── pages/                  # 页面目录（核心）
│   ├── index.vue           # 首页 /
│   ├── 404.vue             # 404 页面 *
│   └── user/               # 用户模块 /user/*
│       └── index.vue       # 用户首页 /user
├── router/                 # 路由配置
│   ├── index.ts            # 路由入口 + 守卫
│   └── routes.ts           # 自动生成的路由表
├── stores/                 # Pinia 状态管理
├── utils/                  # 工具函数
├── types/                  # 类型定义
├── App.vue                 # 根组件
└── main.ts                 # 入口文件
```

## 核心设计原则

### 1. 文件即路由（约定式路由）

**`pages/` 目录下的任意 `.vue` 文件会自动映射为路由，支持无限层级嵌套。**

#### 路由映射规则

| 文件路径 | 路由路径 | 说明 |
|---------|---------|------|
| `pages/index.vue` | `/` | 首页（根目录 index.vue 映射为根路径） |
| `pages/login.vue` | `/login` | 一级路由 |
| `pages/user/index.vue` | `/user` | 二级目录的 index.vue 映射为目录路径 |
| `pages/user/profile.vue` | `/user/profile` | 二级路由 |
| `pages/admin/settings/index.vue` | `/admin/settings` | 三级目录的 index.vue |
| `pages/admin/settings/security.vue` | `/admin/settings/security` | 三级路由 |

#### 路由生成原理

```
文件路径: pages/a/b/c/d.vue
           ↓ 去掉 ../pages 前缀
         /a/b/c/d.vue
           ↓ 去掉 .vue 后缀
         /a/b/c/d
           ↓ 如果以 /index 结尾则去掉
         /a/b/c/d  (最终路由)
```

**特殊规则：所有以 `index.vue` 结尾的文件，其路由路径会去掉 `/index` 部分。**

```
pages/user/index.vue      → /user      (不是 /user/index)
pages/a/b/index.vue       → /a/b       (不是 /a/b/index)
```

### 2. 命名规范

#### 目录名规范
- **使用小写字母**：`user/`、`order-management/`、`system-setting/`
- **多个单词用连字符 `-` 连接**：`user-center/`、`order-list/`
- **不要使用驼峰或下划线**：~~`userCenter/`~~、~~`user_center/`~~

#### 文件名规范
- **使用小写字母**：`index.vue`、`profile.vue`、`order-list.vue`
- **多个单词用连字符 `-` 连接**：`user-profile.vue`、`order-detail.vue`
- **入口文件统一命名为 `index.vue`**：每个目录的默认页面

#### 完整示例

```
pages/
├── index.vue                      # 首页 /
├── 404.vue                        # 404 页面 *
├── login.vue                      # 登录页 /login
├── about-us.vue                   # 关于我们 /about-us
├── user/                          # 用户模块 /user/*
│   ├── index.vue                  # 用户首页 /user
│   ├── profile.vue                # 个人资料 /user/profile
│   └── settings.vue               # 用户设置 /user/settings
├── order-management/              # 订单模块 /order-management/*
│   ├── index.vue                  # 订单首页 /order-management
│   ├── order-list.vue             # 订单列表 /order-management/order-list
│   └── order-detail.vue           # 订单详情 /order-management/order-detail
└── admin/                         # 后台管理 /admin/*
    ├── index.vue                  # 后台首页 /admin
    └── settings/                  # 系统设置 /admin/settings/*
        ├── index.vue              # 设置首页 /admin/settings
        ├── security.vue           # 安全设置 /admin/settings/security
        └── notification.vue       # 通知设置 /admin/settings/notification
```

对应的路由表：

| URL 路径 | 文件路径 |
|---------|---------|
| `/` | `pages/index.vue` |
| `/login` | `pages/login.vue` |
| `/about-us` | `pages/about-us.vue` |
| `/user` | `pages/user/index.vue` |
| `/user/profile` | `pages/user/profile.vue` |
| `/order-management/order-list` | `pages/order-management/order-list.vue` |
| `/admin/settings/security` | `pages/admin/settings/security.vue` |

### 3. 页面开发流程

#### 步骤1：创建页面文件

在 `pages/` 目录下按需求创建 `.vue` 文件：

```bash
# 创建一级页面
pages/dashboard.vue

# 创建二级页面
pages/order/list.vue

# 创建三级页面
pages/system/user/manage.vue
```

#### 步骤2：编写页面代码

```vue
<script setup lang="ts">
// 直接写页面逻辑，无需导入路由相关
</script>

<template>
  <div>页面内容</div>
</template>
```

#### 步骤3：访问页面

路由已自动生成，直接访问对应的 URL：

```
http://localhost:5173/dashboard
http://localhost:5173/order/list
http://localhost:5173/system/user/manage
```

### 4. 路由元信息配置

在页面文件中使用 `<route>` 自定义 block 配置路由：

```vue
<script setup lang="ts">
</script>

<template>
  <div>需要登录的页面</div>
</template>

<route lang="json">
{
  "meta": {
    "requiresAuth": true,
    "title": "个人中心",
    "layout": "BlankLayout"
  }
}
</route>
```

#### 支持的配置项

| 配置项 | 类型 | 说明 |
|-------|------|------|
| `meta.requiresAuth` | boolean | 是否需要登录，true 时未登录自动跳转登录页 |
| `meta.title` | string | 页面标题，自动设置 document.title |
| `meta.layout` | string | 使用指定布局，可选 `DefaultLayout` 或 `BlankLayout` |

#### 布局说明

- **DefaultLayout**：默认布局，带顶部导航栏
- **BlankLayout**：空白布局，无任何装饰，适合登录页、404页等

## 技术栈

- **框架**: Vue 3 + TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite

## 常用开发指南

### 页面传参

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取 URL 参数 /user/123 → route.params.id = '123'
const id = route.params.id

// 获取查询参数 /user?id=123 → route.query.id = '123'
const keyword = route.query.keyword
</script>
```

### 页面跳转

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 字符串路径
router.push('/user/profile')

// 对象路径
router.push({ path: '/user/profile' })

// 带查询参数 /user/profile?id=123
router.push({ path: '/user/profile', query: { id: '123' } })

// 替换当前页面（不留下历史记录）
router.replace('/login')

// 返回上一页
router.back()
</script>
```

### 权限控制

在需要登录的页面添加 `requiresAuth`：

```vue
<route lang="json">
{
  "meta": {
    "requiresAuth": true
  }
}
</route>
```

未登录时访问该页面，会自动跳转到登录页。

## 架构优势

1. **零配置路由** - 文件即路由，无需手动维护路由表
2. **层级无限制** - 支持任意深度的目录嵌套
3. **专注业务** - 开发者只需写 Vue 文件，其他自动处理
4. **约定优于配置** - 统一的命名规范，项目结构清晰
5. **类型安全** - TypeScript 全程支持

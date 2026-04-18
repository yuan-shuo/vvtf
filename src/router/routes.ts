import type { RouteRecordRaw, RouteComponent } from 'vue-router'

/**
 * 自动导入 pages 目录下的所有页面（排除 404.vue）
 * 文件路径即路由路径
 */
const pages = import.meta.glob(['../pages/**/*.vue', '!**/404.vue'], { eager: true })

const routes: RouteRecordRaw[] = []

for (const path in pages) {
  const module = pages[path] as { default: RouteComponent; route?: { meta?: Record<string, unknown> } }
  const component = module.default

  // 将文件路径转换为路由路径
  // ../pages/index.vue -> /
  // ../pages/login.vue -> /login
  // ../pages/user/index.vue -> /user
  // ../pages/user/profile.vue -> /user/profile
  // ../pages/user/aaa/b.vue -> /user/aaa/b
  let routePath = path
    .replace('../pages', '')
    .replace('.vue', '')
    .replace(/\/index$/, '') || '/'

  // 确保路径以 / 开头
  if (!routePath.startsWith('/')) {
    routePath = '/' + routePath
  }

  const route: RouteRecordRaw = {
    path: routePath,
    component: component,
    meta: module.route?.meta
  }

  routes.push(route)
}

// 404 页面 - 懒加载
routes.push({
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('../pages/404.vue')
})

export default routes

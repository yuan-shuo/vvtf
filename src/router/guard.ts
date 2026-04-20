/**
 * 路由守卫模块
 * 提供登录状态检查、跳转等功能
 */

import { isLoggedIn, isTokenExpiringSoon, doRefreshToken, clearTokens } from '../api/core/token'

export interface RouteGuardOptions {
    /** 登录页路径 */
    loginPath?: string
    /** 登录后的首页路径 */
    homePath?: string
    /** 是否需要刷新token */
    autoRefresh?: boolean
}

const defaultOptions: RouteGuardOptions = {
    loginPath: '/user/login',
    homePath: '/',
    autoRefresh: true
}

/**
 * 检查路由是否需要认证
 * 默认所有非/user/login、/register开头的路径都需要认证
 */
export function requiresAuth(path: string): boolean {
    const publicPaths = ['/user/login', '/user/register', '/user/reset-password']
    return !publicPaths.some(p => path.startsWith(p))
}

/**
 * 路由守卫检查
 * 在路由切换前调用
 * @param toPath 目标路径
 * @param options 配置选项
 * @returns 跳转路径（null表示不跳转）
 */
export async function routerGuard(
    toPath: string,
    options: RouteGuardOptions = {}
): Promise<string | null> {
    const opts = { ...defaultOptions, ...options }

    // 不需要认证的路径直接放行
    if (!requiresAuth(toPath)) {
        // 已登录用户访问登录页，跳转到首页
        if (isLoggedIn() && toPath === opts.loginPath) {
            return opts.homePath!
        }
        return null
    }

    // 需要认证的路径
    if (!isLoggedIn()) {
        return opts.loginPath!
    }

    // 自动刷新token
    if (opts.autoRefresh && isTokenExpiringSoon()) {
        try {
            await doRefreshToken()
        } catch {
            clearTokens()
            return opts.loginPath!
        }
    }

    return null
}

/**
 * Vue Router 导航守卫集成
 * 在router.beforeEach中使用
 * @param router Vue Router实例
 * @param options 配置选项
 */
export function setupRouterGuard(router: any, options: RouteGuardOptions = {}) {
    router.beforeEach(async (to: any, _from: any, next: any) => {
        const redirect = await routerGuard(to.path, options)
        if (redirect) {
            next(redirect)
        } else {
            next()
        }
    })
}

/**
 * 获取当前登录状态信息
 */
export function getAuthStatus() {
    return {
        isLoggedIn: isLoggedIn(),
        isTokenExpiringSoon: isTokenExpiringSoon()
    }
}

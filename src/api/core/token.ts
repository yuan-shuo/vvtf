/**
 * JWT Token 管理模块
 * 负责: Token存储、解析、刷新队列管理
 */

import { refreshToken } from '../user/user'
import type { LoginResp, RefreshTokenResp } from '../user/userComponents'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const EXPIRES_KEY = 'token_expires_at'

// 刷新队列管理（防止重复刷新）
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

/**
 * 订阅token刷新
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback)
}

/**
 * 通知所有订阅者新token
 */
function onTokenRefreshed(newToken: string) {
    refreshSubscribers.forEach(callback => callback(newToken))
    refreshSubscribers = []
}

/**
 * 保存登录响应的token信息
 */
export function saveTokens(resp: LoginResp | RefreshTokenResp) {
    localStorage.setItem(TOKEN_KEY, resp.accessToken)
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + resp.expiresIn * 1000))

    if ('refreshToken' in resp && resp.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, resp.refreshToken)
    }
}

/**
 * 清除所有token
 */
export function clearTokens() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(EXPIRES_KEY)
}

/**
 * 获取access token
 */
export function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

/**
 * 获取refresh token
 */
export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 检查token是否即将过期（5分钟内）
 */
export function isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem(EXPIRES_KEY)
    if (!expiresAt) return true

    // 5分钟缓冲期
    const bufferTime = 5 * 60 * 1000
    return Date.now() + bufferTime >= parseInt(expiresAt)
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
    return !!getAccessToken()
}

/**
 * 执行token刷新（带队列管理）
 */
export async function doRefreshToken(): Promise<string> {
    const currentRefreshToken = getRefreshToken()

    if (!currentRefreshToken) {
        clearTokens()
        throw new Error('No refresh token available')
    }

    // 如果已经在刷新中，等待结果
    if (isRefreshing) {
        return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
                resolve(newToken)
            })
        })
    }

    isRefreshing = true

    try {
        const resp = await refreshToken({ refreshToken: currentRefreshToken })
        saveTokens(resp)
        onTokenRefreshed(resp.accessToken)
        return resp.accessToken
    } catch (error) {
        clearTokens()
        throw error
    } finally {
        isRefreshing = false
    }
}

/**
 * 确保token有效（如果即将过期则刷新）
 */
export async function ensureValidToken(): Promise<string> {
    const token = getAccessToken()

    if (!token) {
        throw new Error('No access token')
    }

    if (isTokenExpiringSoon()) {
        return await doRefreshToken()
    }

    return token
}

/**
 * JWT Payload 类型
 */
export interface JWTPayload {
    nickname: string
    email: string
    uid: number
    type: string
    iat: number
    exp: number
}

/**
 * 解析 JWT Payload
 */
export function parseJWTPayload(token: string): JWTPayload | null {
    try {
        const base64 = token.split('.')[1]
        const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(json)
    } catch {
        return null
    }
}

/**
 * 获取当前用户信息（从 JWT 解析）
 */
export function getCurrentUser(): JWTPayload | null {
    const token = getAccessToken()
    if (!token) return null
    return parseJWTPayload(token)
}

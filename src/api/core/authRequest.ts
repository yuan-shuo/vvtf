/**
 * 认证请求包装器
 * 自动携带access token，自动处理token刷新
 * 用法: authReq(apiFunction(args))
 */

import { ensureValidToken, doRefreshToken, clearTokens } from './token'
import { handleRequest, isApiError as isReqApiError } from './request'
import type { ApiError } from './request'
export { isReqApiError as isApiError }
export type { ApiError }

// 错误码定义
const ERROR_CODES = {
    UNAUTHORIZED: 1002,  // token无效或过期
}

/**
 * 包装请求：自动携带token
 * @param requestFactory - 返回请求Promise的工厂函数（必须传入函数，不能传入Promise）
 * @returns Promise<T> 响应数据
 * @throws ApiError 当后端返回错误时
 */
export async function authReq<T>(requestFactory: () => Promise<T>): Promise<T> {
    // 确保token有效
    const token = await ensureValidToken()

    const originalFetch = window.fetch

    // 重写fetch以注入认证头
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const modifiedInit: RequestInit = {
            ...init,
            headers: {
                ...init?.headers,
                'Authorization': `Bearer ${token}`
            }
        }
        return originalFetch(input, modifiedInit)
    }

    try {
        const result = await requestFactory()
        return handleRequest(Promise.resolve(result))
    } finally {
        // 恢复原始fetch
        window.fetch = originalFetch
    }
}

/**
 * 包装请求：支持自动重试（token过期时自动刷新并重试）
 * 适用于需要最高可靠性的场景
 * @param requestFactory - 返回请求Promise的工厂函数
 * @returns Promise<T> 响应数据
 */
export async function authReqWithRetry<T>(
    requestFactory: () => Promise<T>
): Promise<T> {
    try {
        return await authReq(requestFactory)
    } catch (error) {
        // 如果是未授权错误，尝试刷新token后重试一次
        if (isReqApiError(error) && (error as ApiError).code === ERROR_CODES.UNAUTHORIZED) {
            try {
                await doRefreshToken()
                return await authReq(requestFactory)
            } catch (refreshError) {
                clearTokens()
                throw refreshError
            }
        }
        throw error
    }
}

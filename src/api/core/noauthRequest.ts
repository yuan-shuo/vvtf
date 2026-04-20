/**
 * 非认证请求包装器
 * 用于不需要token的接口（登录、注册、发送验证码等）
 * 用法: noauthReq(apiFunction(args))
 */

import { handleRequest, isApiError } from './request'
export { isApiError }
export type { ApiError } from './request'

/**
 * 包装非认证请求
 * 仅做统一的错误处理，不添加认证头
 * @param requestPromise - goctl生成的API请求Promise
 * @returns Promise<T> 响应数据
 * @throws ApiError 当后端返回错误时
 */
export async function noauthReq<T>(requestPromise: Promise<T>): Promise<T> {
    return handleRequest(requestPromise)
}

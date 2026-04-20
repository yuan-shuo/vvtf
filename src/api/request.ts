export interface ApiError extends Error {
    code: number
    msg: string
}

export async function handleRequest<T>(promise: Promise<T>): Promise<T> {
    const result = await promise as any

    // 处理业务错误（code 不为 0 或 undefined）
    // 注意：null 和 {} 没有 code 字段，应该视为成功
    if (result && typeof result === 'object' && 'code' in result && result.code !== 0) {
        const error = new Error(result.msg || '请求失败') as ApiError
        error.code = result.code
        error.msg = result.msg || '请求失败'
        throw error
    }

    return result
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof Error && 'code' in error && typeof (error as ApiError).code === 'number'
}

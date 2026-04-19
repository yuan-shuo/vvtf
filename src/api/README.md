# API 错误处理说明

## 后端响应格式

### 成功响应 (HTTP 200)
直接返回数据，无 `code` 和 `msg` 字段：

```json
{
  "accessToken": "xxx",
  "refreshToken": "xxx",
  "expiresIn": 3600
}
```

### 错误响应 (HTTP 4xx/5xx)
返回统一错误格式：

```json
{
  "code": 1001,
  "msg": "请求参数错误"
}
```

常见错误码：
- `1000` - 内部错误
- `1001` - 参数错误
- `1002` - 未授权
- `1003` - 禁止访问
- `1004` - 资源不存在

## 前端调用方法

### 基础用法
使用 `handleRequest` 包装 API 调用：

```typescript
import { handleRequest, isApiError } from '@/api/request'
import { login } from '@/api/user/user'

try {
  const resp = await handleRequest(login(req))
  // resp 直接是响应数据 { accessToken, refreshToken, expiresIn }
} catch (error) {
  if (isApiError(error)) {
    // error.code - 后端错误码 (number)
    // error.msg  - 后端错误信息 (string)
    alert(error.msg)
  }
}
```

### 完整示例

```typescript
import { ref } from 'vue'
import { handleRequest, isApiError } from '@/api/request'
import { login } from '@/api/user/user'
import type { LoginReq } from '@/api/user/userComponents'

const handleLogin = async () => {
  try {
    const req: LoginReq = {
      email: email.value,
      password: password.value
    }

    // 成功时 resp 直接是 LoginResp 类型
    const resp = await handleRequest(login(req))

    localStorage.setItem('token', resp.accessToken)
    // ...
  } catch (error: any) {
    if (isApiError(error)) {
      // 后端返回的错误，显示错误信息
      alert(error.msg)
      // 可根据 error.code 做特殊处理
      if (error.code === 1002) {
        router.push('/login')
      }
    } else {
      // 网络错误或其他异常
      alert('网络请求失败')
    }
  }
}
```

## 文件说明

| 文件 | 说明 | 是否可修改 |
|------|------|-----------|
| `request.ts` | 通用错误处理封装 | 可修改 |
| `user/gocliRequest.ts` | goctl 生成，基础请求方法 | **不可修改** |
| `user/user.ts` | goctl 生成，API 方法 | **不可修改** |
| `user/userComponents.ts` | goctl 生成，类型定义 | **不可修改** |

## 注意事项

1. **不要修改 goctl 生成的文件**（`gocliRequest.ts`, `user.ts`, `userComponents.ts`）
2. 所有 API 错误处理统一通过 `handleRequest` 进行
3. 使用 `isApiError` 类型守卫判断错误类型
4. `handleRequest` 会在 `code !== 0` 时抛出 `ApiError`

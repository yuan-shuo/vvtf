# API 请求使用说明

## 目录结构

```
src/api/
├── core/                    # 核心请求模块（可修改）
│   ├── token.ts            # Token 存储、刷新管理
│   ├── authRequest.ts      # 认证请求包装器（自动携带token）
│   ├── noauthRequest.ts    # 非认证请求包装器
│   └── request.ts          # 基础错误处理
└── user/                    # goctl 生成（不可修改）
    ├── gocliRequest.ts
    ├── user.ts             # API 方法
    └── userComponents.ts   # 类型定义
```

## 请求用法

### 不需要登录的请求（登录、注册等）

使用 `noauthReq` 包装 goctl 生成的请求方法：

```typescript
import { noauthReq } from '@/api/core/noauthRequest'
import { login, register, sendVerifyCode } from '@/api/user/user'
import { saveTokens } from '@/api/core/token'

// 登录
const resp = await noauthReq(login({ email, password, rememberMe }))
saveTokens(resp)  // 保存 token

// 注册
await noauthReq(register({ email, password, code, nickname }))

// 发送验证码
await noauthReq(sendVerifyCode({ email, type: 'register' }))
```

### 需要登录的请求（修改密码等）

使用 `authReq` 包装 goctl 生成的请求方法，**自动携带 token**。

**注意：`authReq` 需要传入工厂函数 `() => apiFunction()`，而不是直接的 Promise：**

```typescript
import { authReq } from '@/api/core/authRequest'
import { changePassword } from '@/api/user/user'

// 正确：传入工厂函数
await authReq(() => changePassword({ oldPassword, newPassword, code }))

// 错误：不要直接传入 Promise
// await authReq(changePassword({ ... }))  // ❌ 这样 token 不会生效
```

## 错误处理

统一使用 `isApiError` 判断错误类型：

```typescript
import { noauthReq, isApiError } from '@/api/core/noauthRequest'
import { login } from '@/api/user/user'

try {
    const resp = await noauthReq(login(req))
} catch (error) {
    if (isApiError(error)) {
        // 后端返回的错误：error.code, error.msg
        alert(error.msg)
    } else {
        // 网络错误
        alert('网络请求失败')
    }
}
```

## Token 管理

```typescript
import { saveTokens, clearTokens, isLoggedIn, getCurrentUser } from '@/api/core/token'

// 登录后保存 token
saveTokens(loginResponse)

// 退出登录
clearTokens()

// 检查登录状态
if (isLoggedIn()) { ... }

// 获取当前用户信息（从 JWT 解析）
const user = getCurrentUser()  // { nickname, email, uid, type, iat, exp }
```

## 后端响应格式

### 成功响应 (HTTP 200)
```json
{
  "accessToken": "xxx",
  "refreshToken": "xxx",
  "expiresIn": 3600
}
```

### 错误响应 (HTTP 4xx/5xx)
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

## 注意事项

1. **不要修改 goctl 生成的文件**（`user/` 目录下）
2. `noauthReq` 直接传入 Promise：`noauthReq(apiFunction())`
3. **`authReq` 必须传入工厂函数：`authReq(() => apiFunction())`**
4. `authReq` 会自动处理 token 刷新，无需手动处理
5. Token 存储在 localStorage 中

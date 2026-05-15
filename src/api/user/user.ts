import webapi from "./gocliRequest"
import * as components from "./userComponents"
export * from "./userComponents"

/**
 * @description 
 * @param req
 */
export function changePassword(req: components.ChangePasswordReq) {
	return webapi.post<components.ChangePasswordResp>(`/api/user/v1/changepassword`, req)
}

/**
 * @description 
 * @param req
 */
export function login(req: components.LoginReq) {
	return webapi.post<components.LoginResp>(`/api/user/v1/noauth/login`, req)
}

/**
 * @description 
 * @param req
 */
export function register(req: components.RegisterReq) {
	return webapi.post<components.RegisterResp>(`/api/user/v1/noauth/register`, req)
}

/**
 * @description 
 * @param req
 */
export function resetPassword(req: components.ResetPasswordReq) {
	return webapi.post<components.ResetPasswordResp>(`/api/user/v1/noauth/resetpassword`, req)
}

/**
 * @description 
 * @param req
 */
export function sendVerifyCode(req: components.SendVerifyCodeReq) {
	return webapi.post<components.SendVerifyCodeResp>(`/api/user/v1/noauth/verifycode`, req)
}

/**
 * @description 
 * @param req
 */
export function refreshToken(req: components.RefreshTokenReq) {
	return webapi.post<components.RefreshTokenResp>(`/api/user/v1/noauth/refreshtoken`, req)
}

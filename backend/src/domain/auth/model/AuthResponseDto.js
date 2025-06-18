import Joi from 'joi';
import BaseDto from '../../common/model/BaseDto.js';

/**
 * 인증 관련 응답 데이터 전송 객체
 * 인증 API 응답에 대한 유효성 검사와 데이터 구조를 정의합니다.
 */
export default class AuthResponseDto extends BaseDto {
    constructor(data = {}) {
        super(data);
    }

    /**
     * JWT 로그인 응답 스키마
     */
    static jwtLoginResponseSchema() {
        return Joi.object({
            accessToken: Joi.string().required(),
            refreshToken: Joi.string().required(),
            tokenType: Joi.string().default('Bearer'),
            expiresIn: Joi.number().required(),
            user: Joi.object({
                id: Joi.number().required(),
                email: Joi.string().email().required(),
                username: Joi.string().required(),
                name: Joi.string().required(),
                role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').required(),
                status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNVERIFIED').required(),
                emailVerified: Joi.boolean().required()
            }).required()
        });
    }

    /**
     * JWT 토큰 갱신 응답 스키마
     */
    static jwtRefreshResponseSchema() {
        return Joi.object({
            accessToken: Joi.string().required(),
            refreshToken: Joi.string().required(),
            tokenType: Joi.string().default('Bearer'),
            expiresIn: Joi.number().required()
        });
    }

    /**
     * JWT 토큰 검증 응답 스키마
     */
    static jwtVerifyResponseSchema() {
        return Joi.object({
            valid: Joi.boolean().required(),
            user: Joi.object({
                id: Joi.number().required(),
                email: Joi.string().email().required(),
                username: Joi.string().required(),
                role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').required(),
                status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNVERIFIED').required()
            }).when('valid', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        });
    }

    /**
     * 토큰 유효성 검사 응답 스키마
     */
    static tokenValidationResponseSchema() {
        return Joi.object({
            isValid: Joi.boolean().required(),
            tokenExpired: Joi.boolean().optional(),
            userId: Joi.number().when('tokenExpired', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        });
    }

    /**
     * 기본 성공 응답 스키마
     */
    static successResponseSchema() {
        return Joi.object({
            success: Joi.boolean().default(true),
            message: Joi.string().required()
        });
    }

    /**
     * 에러 응답 스키마
     */
    static errorResponseSchema() {
        return Joi.object({
            success: Joi.boolean().default(false),
            message: Joi.string().required(),
            error: Joi.object({
                code: Joi.string().optional(),
                details: Joi.any().optional(),
                tokenExpired: Joi.boolean().optional(),
                userId: Joi.number().optional()
            }).optional()
        });
    }

    /**
     * 비밀번호 재설정 토큰 생성 응답 스키마
     */
    static passwordResetTokenResponseSchema() {
        return Joi.object({
            tempPassword: Joi.string().optional() // 관리자 비밀번호 초기화 시에만 포함
        });
    }

    /**
     * JWT 로그인 응답 유효성 검사
     */
    validateJwtLoginResponse() {
        return this.validateWithSchema(AuthResponseDto.jwtLoginResponseSchema());
    }

    /**
     * JWT 토큰 갱신 응답 유효성 검사
     */
    validateJwtRefreshResponse() {
        return this.validateWithSchema(AuthResponseDto.jwtRefreshResponseSchema());
    }

    /**
     * JWT 토큰 검증 응답 유효성 검사
     */
    validateJwtVerifyResponse() {
        return this.validateWithSchema(AuthResponseDto.jwtVerifyResponseSchema());
    }

    /**
     * 토큰 유효성 검사 응답 유효성 검사
     */
    validateTokenValidationResponse() {
        return this.validateWithSchema(AuthResponseDto.tokenValidationResponseSchema());
    }

    /**
     * 성공 응답 유효성 검사
     */
    validateSuccessResponse() {
        return this.validateWithSchema(AuthResponseDto.successResponseSchema());
    }

    /**
     * 에러 응답 유효성 검사
     */
    validateErrorResponse() {
        return this.validateWithSchema(AuthResponseDto.errorResponseSchema());
    }

    /**
     * 비밀번호 재설정 토큰 응답 유효성 검사
     */
    validatePasswordResetTokenResponse() {
        return this.validateWithSchema(AuthResponseDto.passwordResetTokenResponseSchema());
    }

    /**
     * JWT 로그인 성공 응답 생성
     */
    static createJwtLoginResponse(tokenData, userData) {
        return new AuthResponseDto({
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            tokenType: 'Bearer',
            expiresIn: tokenData.expiresIn,
            user: {
                id: userData.id,
                email: userData.email,
                username: userData.username,
                name: userData.name,
                role: userData.role,
                status: userData.status,
                emailVerified: userData.emailVerified
            }
        });
    }

    /**
     * JWT 토큰 갱신 응답 생성
     */
    static createJwtRefreshResponse(tokenData) {
        return new AuthResponseDto({
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            tokenType: 'Bearer',
            expiresIn: tokenData.expiresIn
        });
    }

    /**
     * JWT 토큰 검증 응답 생성
     */
    static createJwtVerifyResponse(isValid, userData = null) {
        const response = { valid: isValid };
        if (isValid && userData) {
            response.user = {
                id: userData.id,
                email: userData.email,
                username: userData.username,
                role: userData.role,
                status: userData.status
            };
        }
        return new AuthResponseDto(response);
    }

    /**
     * 토큰 유효성 검사 응답 생성
     */
    static createTokenValidationResponse(isValid, options = {}) {
        return new AuthResponseDto({
            isValid,
            tokenExpired: options.tokenExpired || false,
            userId: options.userId || undefined
        });
    }

    /**
     * 성공 응답 생성
     */
    static createSuccessResponse(message) {
        return new AuthResponseDto({
            success: true,
            message
        });
    }

    /**
     * 에러 응답 생성
     */
    static createErrorResponse(message, errorDetails = {}) {
        return new AuthResponseDto({
            success: false,
            message,
            error: errorDetails
        });
    }
}

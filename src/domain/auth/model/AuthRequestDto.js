import Joi from 'joi';
import BaseDto from '../../common/model/BaseDto.js';

/**
 * 인증 관련 요청 데이터 전송 객체
 * 인증 API 요청에 대한 유효성 검사와 데이터 구조를 정의합니다.
 */
export default class AuthRequestDto extends BaseDto {
    constructor(data = {}) {
        super(data);
    }

    /**
     * 비밀번호 재설정 요청 스키마
     */
    static passwordResetRequestSchema() {
        return Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': '올바른 이메일 형식을 입력해주세요.',
                'any.required': '이메일은 필수 입력 항목입니다.'
            })
        });
    }

    /**
     * 비밀번호 재설정 스키마
     */
    static passwordResetSchema() {
        return Joi.object({
            token: Joi.string().required().messages({
                'any.required': '재설정 토큰이 필요합니다.'
            }),
            newPassword: Joi.string()
                .min(8)
                .max(128)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                .required()
                .messages({
                    'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
                    'string.max': '비밀번호는 최대 128자까지 가능합니다.',
                    'string.pattern.base': '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.',
                    'any.required': '새 비밀번호는 필수 입력 항목입니다.'
                })
        });
    }

    /**
     * 토큰 유효성 검사 스키마
     */
    static tokenValidationSchema() {
        return Joi.object({
            token: Joi.string().required().messages({
                'any.required': '토큰이 필요합니다.'
            }),
            type: Joi.string().valid('EMAIL_VERIFICATION', 'PASSWORD_RESET').required().messages({
                'any.only': '유효하지 않은 토큰 유형입니다.',
                'any.required': '토큰 유형이 필요합니다.'
            })
        });
    }

    /**
     * 토큰 재발급 스키마
     */
    static tokenResendSchema() {
        return Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': '올바른 이메일 형식을 입력해주세요.',
                'any.required': '이메일은 필수 입력 항목입니다.'
            }),
            type: Joi.string().valid('EMAIL_VERIFICATION', 'PASSWORD_RESET').required().messages({
                'any.only': '유효하지 않은 토큰 유형입니다.',
                'any.required': '토큰 유형이 필요합니다.'
            })
        });
    }

    /**
     * JWT 로그인 스키마
     */
    static jwtLoginSchema() {
        return Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': '올바른 이메일 형식을 입력해주세요.',
                'any.required': '이메일은 필수 입력 항목입니다.'
            }),
            password: Joi.string().required().messages({
                'any.required': '비밀번호는 필수 입력 항목입니다.'
            })
        });
    }

    /**
     * JWT 토큰 갱신 스키마
     */
    static jwtRefreshSchema() {
        return Joi.object({
            refreshToken: Joi.string().required().messages({
                'any.required': '리프레시 토큰이 필요합니다.'
            })
        });
    }

    /**
     * JWT 토큰 검증 스키마
     */
    static jwtVerifySchema() {
        return Joi.object({
            token: Joi.string().required().messages({
                'any.required': '액세스 토큰이 필요합니다.'
            })
        });
    }

    /**
     * 이메일 인증 스키마 (쿼리 파라미터용)
     */
    static emailVerificationSchema() {
        return Joi.object({
            token: Joi.string().required().messages({
                'any.required': '인증 토큰이 필요합니다.'
            })
        });
    }

    /**
     * 비밀번호 재설정 요청 유효성 검사
     */
    validatePasswordResetRequest() {
        return this.validateWithSchema(AuthRequestDto.passwordResetRequestSchema());
    }

    /**
     * 비밀번호 재설정 유효성 검사
     */
    validatePasswordReset() {
        return this.validateWithSchema(AuthRequestDto.passwordResetSchema());
    }

    /**
     * 토큰 유효성 검사 요청 유효성 검사
     */
    validateTokenValidation() {
        return this.validateWithSchema(AuthRequestDto.tokenValidationSchema());
    }

    /**
     * 토큰 재발급 요청 유효성 검사
     */
    validateTokenResend() {
        return this.validateWithSchema(AuthRequestDto.tokenResendSchema());
    }

    /**
     * JWT 로그인 유효성 검사
     */
    validateJwtLogin() {
        return this.validateWithSchema(AuthRequestDto.jwtLoginSchema());
    }

    /**
     * JWT 토큰 갱신 유효성 검사
     */
    validateJwtRefresh() {
        return this.validateWithSchema(AuthRequestDto.jwtRefreshSchema());
    }

    /**
     * JWT 토큰 검증 유효성 검사
     */
    validateJwtVerify() {
        return this.validateWithSchema(AuthRequestDto.jwtVerifySchema());
    }

    /**
     * 이메일 인증 유효성 검사
     */
    validateEmailVerification() {
        return this.validateWithSchema(AuthRequestDto.emailVerificationSchema());
    }
}

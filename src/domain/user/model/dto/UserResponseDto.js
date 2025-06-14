import Joi from 'joi';
import BaseDto from '#domain/common/model/BaseDto.js';

/**
 * 사용자 응답 DTO
 * 사용자 정보를 응답 형식에 맞게 변환합니다.
 */
export default class UserResponseDto extends BaseDto {
    constructor(data = {}) {
        super(data);

        // BaseDto가 자동으로 데이터를 할당하므로 추가 설정은 불필요
        // 필요한 경우에만 기본값이나 변환 로직 추가
    }

    /**
     * 응답용 검증 스키마를 반환합니다.
     * @returns {Object} Joi 검증 스키마
     */
    getValidationSchema() {
        return UserResponseDto.getResponseSchema();
    }

    /**
     * 사용자 응답용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getResponseSchema() {
        return Joi.object({
            id: Joi.number().integer().positive().required(),
            username: Joi.string().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').required(),
            department: Joi.string().allow(null).optional(),
            affiliation: Joi.string().allow(null).optional(),
            studentYear: Joi.string().allow(null).optional(),
            isClubMember: Joi.boolean().optional(),
            emailVerified: Joi.boolean().optional(),
            createdAt: Joi.date().optional(),
            updatedAt: Joi.date().optional()
        });
    }

    /**
     * 공개 프로필용 스키마 (민감한 정보 제외)
     * @returns {Object} Joi 검증 스키마
     */
    static getPublicProfileSchema() {
        return Joi.object({
            id: Joi.number().integer().positive().required(),
            username: Joi.string().required(),
            name: Joi.string().required(),
            role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').required(),
            department: Joi.string().allow(null).optional(),
            affiliation: Joi.string().allow(null).optional(),
            studentYear: Joi.string().allow(null).optional(),
            isClubMember: Joi.boolean().optional()
        });
    }

    /**
     * 관리자용 상세 정보 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getAdminDetailSchema() {
        return Joi.object({
            id: Joi.number().integer().positive().required(),
            username: Joi.string().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').required(),
            department: Joi.string().allow(null).optional(),
            affiliation: Joi.string().allow(null).optional(),
            studentYear: Joi.string().allow(null).optional(),
            isClubMember: Joi.boolean().optional(),
            emailVerified: Joi.boolean().required(),
            createdAt: Joi.date().required(),
            updatedAt: Joi.date().required()
        });
    }

    /**
     * 민감한 정보를 제외한 공개 프로필 반환
     * @returns {Object} 공개 프로필 객체
     */
    toPublicProfile() {
        return this.pick([
            'id',
            'username',
            'name',
            'role',
            'department',
            'affiliation',
            'studentYear',
            'isClubMember'
        ]);
    }

    /**
     * 관리자용 상세 정보 반환
     * @returns {Object} 관리자용 상세 정보 객체
     */
    toAdminDetail() {
        return this.omit(['password', 'emailVerificationToken', 'emailVerificationTokenExpiry']);
    }

    /**
     * 특정 스키마로 검증하는 메서드
     * @param {string} schemaType - 스키마 타입 ('response', 'publicProfile', 'adminDetail')
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과
     */
    validateWithSchema(schemaType, options = {}) {
        let schema;

        switch (schemaType) {
            case 'response':
                schema = UserResponseDto.getResponseSchema();
                break;
            case 'publicProfile':
                schema = UserResponseDto.getPublicProfileSchema();
                break;
            case 'adminDetail':
                schema = UserResponseDto.getAdminDetailSchema();
                break;
            default:
                schema = this.getValidationSchema();
        }

        const { error, value } = schema.validate(this.toPlainObject(), {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
            ...options
        });

        this._isValid = !error;
        this._validationErrors = error ? error.details : [];

        return {
            isValid: this._isValid,
            errors: this._validationErrors,
            value: value
        };
    }
}

import Joi from 'joi';
import BaseDto from '../../../common/model/BaseDto.js';

/**
 * 작품 응답 DTO
 * 작품 정보를 응답 형식에 맞게 변환합니다.
 */
export default class ArtworkResponseDto extends BaseDto {
    constructor(data = {}) {
        super(data);
    }

    /**
     * 응답용 검증 스키마를 반환합니다.
     * @returns {Object} Joi 검증 스키마
     */
    getValidationSchema() {
        return ArtworkResponseDto.getResponseSchema();
    }

    /**
     * 작품 응답용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getResponseSchema() {
        return Joi.object({
            id: Joi.number().integer().positive().required(),
            title: Joi.string().required(),
            description: Joi.string().allow('').optional(),
            userId: Joi.number().integer().positive().required(),
            exhibitionId: Joi.number().integer().positive().allow(null).optional(),
            year: Joi.number().integer().allow(null).optional(),
            medium: Joi.string().allow('').optional(),
            size: Joi.string().allow('').optional(),
            featured: Joi.boolean().optional(),
            imageUrl: Joi.string().uri().allow(null).optional(),
            imagePublicId: Joi.string().allow(null).optional(),
            createdAt: Joi.date().optional(),
            updatedAt: Joi.date().optional(),
            // 관계 데이터
            user: Joi.object().optional(),
            exhibition: Joi.object().optional()
        });
    }

    /**
     * 공개용 스키마 (민감한 정보 제외)
     * @returns {Object} Joi 검증 스키마
     */
    static getPublicSchema() {
        return Joi.object({
            id: Joi.number().integer().positive().required(),
            title: Joi.string().required(),
            description: Joi.string().allow('').optional(),
            year: Joi.number().integer().allow(null).optional(),
            medium: Joi.string().allow('').optional(),
            size: Joi.string().allow('').optional(),
            featured: Joi.boolean().optional(),
            imageUrl: Joi.string().uri().allow(null).optional(),
            // 관계 데이터 (공개 정보만)
            user: Joi.object({
                id: Joi.number().integer().positive(),
                username: Joi.string(),
                name: Joi.string()
            }).optional(),
            exhibition: Joi.object({
                id: Joi.number().integer().positive(),
                title: Joi.string(),
                startDate: Joi.date(),
                endDate: Joi.date()
            }).optional()
        });
    }

    /**
     * 관리자용 상세 정보 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getAdminDetailSchema() {
        return Joi.object({
            id: Joi.number().integer().positive().required(),
            title: Joi.string().required(),
            description: Joi.string().allow('').optional(),
            userId: Joi.number().integer().positive().required(),
            exhibitionId: Joi.number().integer().positive().allow(null).optional(),
            year: Joi.number().integer().allow(null).optional(),
            medium: Joi.string().allow('').optional(),
            size: Joi.string().allow('').optional(),
            featured: Joi.boolean().optional(),
            imageUrl: Joi.string().uri().allow(null).optional(),
            imagePublicId: Joi.string().allow(null).optional(),
            createdAt: Joi.date().required(),
            updatedAt: Joi.date().required(),
            // 관계 데이터 (상세 정보)
            user: Joi.object().optional(),
            exhibition: Joi.object().optional()
        });
    }

    /**
     * 공개용 정보 반환
     * @returns {Object} 공개용 작품 정보 객체
     */
    toPublic() {
        return this.pick([
            'id', 'title', 'description', 'year', 'medium', 'size',
            'featured', 'imageUrl', 'user', 'exhibition'
        ]);
    }

    /**
     * 관리자용 상세 정보 반환
     * @returns {Object} 관리자용 상세 정보 객체
     */
    toAdminDetail() {
        return this.toPlainObject();
    }

    /**
     * 특정 스키마로 검증하는 메서드
     * @param {string} schemaType - 스키마 타입 ('response', 'public', 'adminDetail')
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과
     */
    validateWithSchema(schemaType, options = {}) {
        let schema;

        switch (schemaType) {
            case 'response':
                schema = ArtworkResponseDto.getResponseSchema();
                break;
            case 'public':
                schema = ArtworkResponseDto.getPublicSchema();
                break;
            case 'adminDetail':
                schema = ArtworkResponseDto.getAdminDetailSchema();
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

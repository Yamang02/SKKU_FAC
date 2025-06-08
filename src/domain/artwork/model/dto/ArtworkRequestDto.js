import Joi from 'joi';
import BaseDto from '../../../common/model/BaseDto.js';

/**
 * 작품 요청 DTO
 * 작품 관련 요청 데이터를 검증하고 변환합니다.
 */
export default class ArtworkRequestDto extends BaseDto {
    constructor(data = {}) {
        super(data);

        // 기본값 설정
        this.id = this.id || null;
        this.title = this.title || null;
        this.description = this.description || '';
        this.userId = this.userId || null;
        this.exhibitionId = this.exhibitionId || null;
        this.year = this.year || null;
        this.medium = this.medium || '';
        this.size = this.size || '';
        this.featured = this.featured || false;
        this.imageUrl = this.imageUrl || null;
        this.imagePublicId = this.imagePublicId || null;
    }

    /**
     * 작품 생성용 검증 스키마를 반환합니다.
     * @returns {Object} Joi 검증 스키마
     */
    getValidationSchema() {
        return ArtworkRequestDto.getCreateSchema();
    }

    /**
     * 작품 생성용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getCreateSchema() {
        return Joi.object({
            title: Joi.string().min(1).max(200).required().messages({
                'string.min': '작품 제목을 입력해주세요',
                'string.max': '작품 제목은 최대 200자까지 가능합니다',
                'any.required': '작품 제목은 필수 입력 항목입니다'
            }),

            description: Joi.string().max(1000).allow('').optional().messages({
                'string.max': '작품 설명은 최대 1000자까지 가능합니다'
            }),

            userId: Joi.string().pattern(/^USER_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).required().messages({
                'string.pattern.base': '사용자 ID는 USER_uuid 형식이어야 합니다',
                'any.required': '사용자 ID는 필수 입력 항목입니다'
            }),

            exhibitionId: Joi.string().pattern(/^EXHIBITION_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).optional().allow(null).messages({
                'string.pattern.base': '전시회 ID는 EXHIBITION_uuid 형식이어야 합니다'
            }),

            year: Joi.number()
                .integer()
                .min(1900)
                .max(new Date().getFullYear() + 10)
                .optional()
                .allow(null)
                .messages({
                    'number.base': '제작 연도는 숫자여야 합니다',
                    'number.integer': '제작 연도는 정수여야 합니다',
                    'number.min': '제작 연도는 1900년 이후여야 합니다',
                    'number.max': `제작 연도는 ${new Date().getFullYear() + 10}년 이전이어야 합니다`
                }),

            medium: Joi.string().max(100).allow('').optional().messages({
                'string.max': '재료/기법은 최대 100자까지 가능합니다'
            }),

            size: Joi.string().max(100).allow('').optional().messages({
                'string.max': '작품 크기는 최대 100자까지 가능합니다'
            }),

            featured: Joi.boolean().default(false).optional(),

            // 선택적 필드들
            id: Joi.string().pattern(/^ARTWORK_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).optional().messages({
                'string.pattern.base': 'ID는 ARTWORK_uuid 형식이어야 합니다'
            }),
            imageUrl: Joi.string().uri().allow(null).optional(),
            imagePublicId: Joi.string().allow(null).optional()
        });
    }

    /**
     * 작품 수정용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getUpdateSchema() {
        return Joi.object({
            title: Joi.string().min(1).max(200).optional().messages({
                'string.min': '작품 제목을 입력해주세요',
                'string.max': '작품 제목은 최대 200자까지 가능합니다'
            }),

            description: Joi.string().max(1000).allow('').optional().messages({
                'string.max': '작품 설명은 최대 1000자까지 가능합니다'
            }),

            exhibitionId: Joi.string().pattern(/^EXHIBITION_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).optional().allow(null).messages({
                'string.pattern.base': '전시회 ID는 EXHIBITION_uuid 형식이어야 합니다'
            }),

            year: Joi.number()
                .integer()
                .min(1900)
                .max(new Date().getFullYear() + 10)
                .optional()
                .allow(null)
                .messages({
                    'number.base': '제작 연도는 숫자여야 합니다',
                    'number.integer': '제작 연도는 정수여야 합니다',
                    'number.min': '제작 연도는 1900년 이후여야 합니다',
                    'number.max': `제작 연도는 ${new Date().getFullYear() + 10}년 이전이어야 합니다`
                }),

            medium: Joi.string().max(100).allow('').optional().messages({
                'string.max': '재료/기법은 최대 100자까지 가능합니다'
            }),

            size: Joi.string().max(100).allow('').optional().messages({
                'string.max': '작품 크기는 최대 100자까지 가능합니다'
            }),

            featured: Joi.boolean().optional(),
            imageUrl: Joi.string().uri().allow(null).optional(),
            imagePublicId: Joi.string().allow(null).optional()
        });
    }

    /**
     * 특정 스키마로 검증하는 메서드
     * @param {string} schemaType - 스키마 타입 ('create', 'update')
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과
     */
    validateWithSchema(schemaType, options = {}) {
        let schema;

        switch (schemaType) {
            case 'create':
                schema = ArtworkRequestDto.getCreateSchema();
                break;
            case 'update':
                schema = ArtworkRequestDto.getUpdateSchema();
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

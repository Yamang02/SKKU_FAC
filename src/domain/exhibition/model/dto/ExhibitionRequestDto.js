import Joi from 'joi';
import BaseDto from '../../../common/model/BaseDto.js';

/**
 * 전시회 요청 DTO
 * 전시회 관련 요청 데이터를 검증하고 변환합니다.
 */
export default class ExhibitionRequestDto extends BaseDto {
    constructor(data = {}) {
        super(data);

        // 기본값 설정
        this.id = this.id || null;
        this.title = this.title || null;
        this.description = this.description || '';
        this.startDate = this.startDate || null;
        this.endDate = this.endDate || null;
        this.exhibitionType = this.exhibitionType || 'GROUP';
        this.location = this.location || '';
        this.isActive = this.isActive || false;
        this.isSubmissionOpen = this.isSubmissionOpen || false;
        this.isFeatured = this.isFeatured || false;
        this.imageUrl = this.imageUrl || null;
        this.imagePublicId = this.imagePublicId || null;
    }

    /**
     * 전시회 생성용 검증 스키마를 반환합니다.
     * @returns {Object} Joi 검증 스키마
     */
    getValidationSchema() {
        return ExhibitionRequestDto.getCreateSchema();
    }

    /**
     * 전시회 생성용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getCreateSchema() {
        return Joi.object({
            title: Joi.string().min(1).max(200).required().messages({
                'string.min': '전시회 제목을 입력해주세요',
                'string.max': '전시회 제목은 최대 200자까지 가능합니다',
                'any.required': '전시회 제목은 필수 입력 항목입니다'
            }),

            description: Joi.string().max(2000).allow('').optional().messages({
                'string.max': '전시회 설명은 최대 2000자까지 가능합니다'
            }),

            startDate: Joi.date().required().messages({
                'date.base': '시작일은 유효한 날짜여야 합니다',
                'any.required': '시작일은 필수 입력 항목입니다'
            }),

            endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
                'date.base': '종료일은 유효한 날짜여야 합니다',
                'date.min': '종료일은 시작일보다 늦어야 합니다',
                'any.required': '종료일은 필수 입력 항목입니다'
            }),

            exhibitionType: Joi.string().valid('SOLO', 'GROUP', 'SPECIAL').default('GROUP').messages({
                'any.only': '전시회 유형은 SOLO, GROUP, SPECIAL 중 하나여야 합니다'
            }),

            location: Joi.string().max(200).allow('').optional().messages({
                'string.max': '전시 장소는 최대 200자까지 가능합니다'
            }),

            isActive: Joi.boolean().default(false).optional(),

            isSubmissionOpen: Joi.boolean().default(false).optional(),

            isFeatured: Joi.boolean().default(false).optional(),

            // 선택적 필드들
            id: Joi.string().pattern(/^EXHIBITION_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).optional().messages({
                'string.pattern.base': 'ID는 EXHIBITION_uuid 형식이어야 합니다'
            }),
            imageUrl: Joi.string().uri().allow(null).optional(),
            imagePublicId: Joi.string().allow(null).optional()
        });
    }

    /**
     * 전시회 수정용 검증 스키마
     * @returns {Object} Joi 검증 스키마
     */
    static getUpdateSchema() {
        return Joi.object({
            title: Joi.string().min(1).max(200).optional().messages({
                'string.min': '전시회 제목을 입력해주세요',
                'string.max': '전시회 제목은 최대 200자까지 가능합니다'
            }),

            description: Joi.string().max(2000).allow('').optional().messages({
                'string.max': '전시회 설명은 최대 2000자까지 가능합니다'
            }),

            startDate: Joi.date().optional().messages({
                'date.base': '시작일은 유효한 날짜여야 합니다'
            }),

            endDate: Joi.date()
                .when('startDate', {
                    is: Joi.exist(),
                    then: Joi.date().min(Joi.ref('startDate')),
                    otherwise: Joi.date()
                })
                .optional()
                .messages({
                    'date.base': '종료일은 유효한 날짜여야 합니다',
                    'date.min': '종료일은 시작일보다 늦어야 합니다'
                }),

            exhibitionType: Joi.string().valid('SOLO', 'GROUP', 'SPECIAL').optional().messages({
                'any.only': '전시회 유형은 SOLO, GROUP, SPECIAL 중 하나여야 합니다'
            }),

            location: Joi.string().max(200).allow('').optional().messages({
                'string.max': '전시 장소는 최대 200자까지 가능합니다'
            }),

            isActive: Joi.boolean().optional(),
            isSubmissionOpen: Joi.boolean().optional(),
            isFeatured: Joi.boolean().optional(),
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
            schema = ExhibitionRequestDto.getCreateSchema();
            break;
        case 'update':
            schema = ExhibitionRequestDto.getUpdateSchema();
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

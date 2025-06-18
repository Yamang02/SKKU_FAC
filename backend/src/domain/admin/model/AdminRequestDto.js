import Joi from 'joi';
import BaseDto from '../../common/model/BaseDto.js';

/**
 * 관리자 관련 요청 데이터 전송 객체
 * 관리자 API 요청에 대한 유효성 검사와 데이터 구조를 정의합니다.
 */
export default class AdminRequestDto extends BaseDto {
    constructor(data = {}) {
        super(data);
    }

    /**
     * 사용자 관리 업데이트 스키마
     */
    static userManagementUpdateSchema() {
        return Joi.object({
            username: Joi.string().alphanum().min(3).max(30).optional().messages({
                'string.alphanum': '사용자명은 영문자와 숫자만 사용할 수 있습니다.',
                'string.min': '사용자명은 최소 3자 이상이어야 합니다.',
                'string.max': '사용자명은 최대 30자까지 가능합니다.'
            }),
            name: Joi.string().min(2).max(50).optional().messages({
                'string.min': '이름은 최소 2자 이상이어야 합니다.',
                'string.max': '이름은 최대 50자까지 가능합니다.'
            }),
            email: Joi.string().email().optional().messages({
                'string.email': '올바른 이메일 형식을 입력해주세요.'
            }),
            role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').optional().messages({
                'any.only': '유효하지 않은 역할입니다.'
            }),
            status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNVERIFIED').optional().messages({
                'any.only': '유효하지 않은 상태입니다.'
            }),
            emailVerified: Joi.boolean().optional()
        });
    }

    /**
     * 사용자 목록 조회 필터 스키마
     */
    static userListFilterSchema() {
        return Joi.object({
            page: Joi.number().integer().min(1).default(1).messages({
                'number.min': '페이지 번호는 1 이상이어야 합니다.'
            }),
            limit: Joi.number().integer().min(1).max(100).default(10).messages({
                'number.min': '페이지 크기는 1 이상이어야 합니다.',
                'number.max': '페이지 크기는 100 이하여야 합니다.'
            }),
            status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNVERIFIED').optional().messages({
                'any.only': '유효하지 않은 상태 필터입니다.'
            }),
            role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').optional().messages({
                'any.only': '유효하지 않은 역할 필터입니다.'
            }),
            keyword: Joi.string().max(100).optional().messages({
                'string.max': '검색어는 최대 100자까지 가능합니다.'
            })
        });
    }

    /**
     * 작품 관리 업데이트 스키마
     */
    static artworkManagementUpdateSchema() {
        return Joi.object({
            title: Joi.string().min(1).max(200).optional().messages({
                'string.min': '작품 제목은 필수입니다.',
                'string.max': '작품 제목은 최대 200자까지 가능합니다.'
            }),
            description: Joi.string().max(2000).optional().messages({
                'string.max': '작품 설명은 최대 2000자까지 가능합니다.'
            }),
            medium: Joi.string().max(100).optional().messages({
                'string.max': '재료/기법은 최대 100자까지 가능합니다.'
            }),
            dimensions: Joi.string().max(100).optional().messages({
                'string.max': '작품 크기는 최대 100자까지 가능합니다.'
            }),
            year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().messages({
                'number.min': '제작 연도는 1900년 이후여야 합니다.',
                'number.max': '제작 연도는 현재 연도를 초과할 수 없습니다.'
            }),
            status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED').optional().messages({
                'any.only': '유효하지 않은 작품 상태입니다.'
            }),
            featured: Joi.boolean().optional()
        });
    }

    /**
     * 전시회 관리 업데이트 스키마
     */
    static exhibitionManagementUpdateSchema() {
        return Joi.object({
            title: Joi.string().min(1).max(200).optional().messages({
                'string.min': '전시회 제목은 필수입니다.',
                'string.max': '전시회 제목은 최대 200자까지 가능합니다.'
            }),
            description: Joi.string().max(2000).optional().messages({
                'string.max': '전시회 설명은 최대 2000자까지 가능합니다.'
            }),
            startDate: Joi.date().optional().messages({
                'date.base': '올바른 시작 날짜를 입력해주세요.'
            }),
            endDate: Joi.date().optional().greater(Joi.ref('startDate')).messages({
                'date.base': '올바른 종료 날짜를 입력해주세요.',
                'date.greater': '종료 날짜는 시작 날짜보다 늦어야 합니다.'
            }),
            location: Joi.string().max(200).optional().messages({
                'string.max': '전시 장소는 최대 200자까지 가능합니다.'
            }),
            status: Joi.string().valid('UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED').optional().messages({
                'any.only': '유효하지 않은 전시회 상태입니다.'
            }),
            featured: Joi.boolean().optional()
        });
    }

    /**
     * 시스템 설정 업데이트 스키마
     */
    static systemSettingsUpdateSchema() {
        return Joi.object({
            siteName: Joi.string().max(100).optional().messages({
                'string.max': '사이트 이름은 최대 100자까지 가능합니다.'
            }),
            siteDescription: Joi.string().max(500).optional().messages({
                'string.max': '사이트 설명은 최대 500자까지 가능합니다.'
            }),
            maintenanceMode: Joi.boolean().optional(),
            registrationEnabled: Joi.boolean().optional(),
            maxFileSize: Joi.number().integer().min(1).max(100).optional().messages({
                'number.min': '최대 파일 크기는 1MB 이상이어야 합니다.',
                'number.max': '최대 파일 크기는 100MB 이하여야 합니다.'
            }),
            allowedFileTypes: Joi.array()
                .items(Joi.string().valid('jpg', 'jpeg', 'png', 'gif', 'webp'))
                .optional()
                .messages({
                    'array.includes': '허용되지 않는 파일 형식입니다.'
                })
        });
    }

    /**
     * 사용자 관리 업데이트 유효성 검사
     */
    validateUserManagementUpdate() {
        return this.validateWithSchema(AdminRequestDto.userManagementUpdateSchema());
    }

    /**
     * 사용자 목록 필터 유효성 검사
     */
    validateUserListFilter() {
        return this.validateWithSchema(AdminRequestDto.userListFilterSchema());
    }

    /**
     * 작품 관리 업데이트 유효성 검사
     */
    validateArtworkManagementUpdate() {
        return this.validateWithSchema(AdminRequestDto.artworkManagementUpdateSchema());
    }

    /**
     * 전시회 관리 업데이트 유효성 검사
     */
    validateExhibitionManagementUpdate() {
        return this.validateWithSchema(AdminRequestDto.exhibitionManagementUpdateSchema());
    }

    /**
     * 시스템 설정 업데이트 유효성 검사
     */
    validateSystemSettingsUpdate() {
        return this.validateWithSchema(AdminRequestDto.systemSettingsUpdateSchema());
    }
}

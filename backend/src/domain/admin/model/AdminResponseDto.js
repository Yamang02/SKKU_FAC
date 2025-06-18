import Joi from 'joi';
import BaseDto from '../../common/model/BaseDto.js';

/**
 * 관리자 관련 응답 데이터 전송 객체
 * 관리자 API 응답에 대한 유효성 검사와 데이터 구조를 정의합니다.
 */
export default class AdminResponseDto extends BaseDto {
    constructor(data = {}) {
        super(data);
    }

    /**
     * 사용자 관리 목록 응답 스키마
     */
    static userManagementListResponseSchema() {
        return Joi.object({
            items: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().required(),
                        username: Joi.string().required(),
                        name: Joi.string().required(),
                        email: Joi.string().email().required(),
                        role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').required(),
                        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNVERIFIED').required(),
                        emailVerified: Joi.boolean().required(),
                        lastLoginAt: Joi.date().allow(null),
                        createdAt: Joi.date().required(),
                        updatedAt: Joi.date().required(),
                        profileInfo: Joi.object().optional()
                    })
                )
                .required(),
            page: Joi.number().integer().min(1).required(),
            total: Joi.number().integer().min(0).required(),
            totalPages: Joi.number().integer().min(0).required(),
            hasNext: Joi.boolean().required(),
            hasPrev: Joi.boolean().required()
        });
    }

    /**
     * 사용자 관리 상세 응답 스키마
     */
    static userManagementDetailResponseSchema() {
        return Joi.object({
            id: Joi.number().required(),
            username: Joi.string().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            role: Joi.string().valid('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER').required(),
            status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNVERIFIED').required(),
            emailVerified: Joi.boolean().required(),
            lastLoginAt: Joi.date().allow(null),
            createdAt: Joi.date().required(),
            updatedAt: Joi.date().required(),
            profileInfo: Joi.object().optional(),
            artworkCount: Joi.number().integer().min(0).optional(),
            exhibitionCount: Joi.number().integer().min(0).optional()
        });
    }

    /**
     * 작품 관리 목록 응답 스키마
     */
    static artworkManagementListResponseSchema() {
        return Joi.object({
            items: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().required(),
                        title: Joi.string().required(),
                        description: Joi.string().allow(''),
                        medium: Joi.string().allow(''),
                        dimensions: Joi.string().allow(''),
                        year: Joi.number().integer().allow(null),
                        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED').required(),
                        featured: Joi.boolean().required(),
                        imageUrl: Joi.string().allow(null),
                        artist: Joi.object({
                            id: Joi.number().required(),
                            name: Joi.string().required(),
                            username: Joi.string().required()
                        }).required(),
                        createdAt: Joi.date().required(),
                        updatedAt: Joi.date().required()
                    })
                )
                .required(),
            page: Joi.number().integer().min(1).required(),
            total: Joi.number().integer().min(0).required(),
            totalPages: Joi.number().integer().min(0).required(),
            hasNext: Joi.boolean().required(),
            hasPrev: Joi.boolean().required()
        });
    }

    /**
     * 작품 관리 상세 응답 스키마
     */
    static artworkManagementDetailResponseSchema() {
        return Joi.object({
            id: Joi.number().required(),
            title: Joi.string().required(),
            description: Joi.string().allow(''),
            medium: Joi.string().allow(''),
            dimensions: Joi.string().allow(''),
            year: Joi.number().integer().allow(null),
            status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED').required(),
            featured: Joi.boolean().required(),
            imageUrl: Joi.string().allow(null),
            imageMetadata: Joi.object().optional(),
            artist: Joi.object({
                id: Joi.number().required(),
                name: Joi.string().required(),
                username: Joi.string().required(),
                email: Joi.string().email().required()
            }).required(),
            exhibitions: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().required(),
                        title: Joi.string().required(),
                        status: Joi.string().required()
                    })
                )
                .optional(),
            createdAt: Joi.date().required(),
            updatedAt: Joi.date().required()
        });
    }

    /**
     * 전시회 관리 목록 응답 스키마
     */
    static exhibitionManagementListResponseSchema() {
        return Joi.object({
            items: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().required(),
                        title: Joi.string().required(),
                        description: Joi.string().allow(''),
                        startDate: Joi.date().required(),
                        endDate: Joi.date().required(),
                        location: Joi.string().allow(''),
                        status: Joi.string().valid('UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED').required(),
                        featured: Joi.boolean().required(),
                        artworkCount: Joi.number().integer().min(0).required(),
                        createdAt: Joi.date().required(),
                        updatedAt: Joi.date().required()
                    })
                )
                .required(),
            page: Joi.number().integer().min(1).required(),
            total: Joi.number().integer().min(0).required(),
            totalPages: Joi.number().integer().min(0).required(),
            hasNext: Joi.boolean().required(),
            hasPrev: Joi.boolean().required()
        });
    }

    /**
     * 전시회 관리 상세 응답 스키마
     */
    static exhibitionManagementDetailResponseSchema() {
        return Joi.object({
            id: Joi.number().required(),
            title: Joi.string().required(),
            description: Joi.string().allow(''),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            location: Joi.string().allow(''),
            status: Joi.string().valid('UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED').required(),
            featured: Joi.boolean().required(),
            artworks: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().required(),
                        title: Joi.string().required(),
                        imageUrl: Joi.string().allow(null),
                        artist: Joi.object({
                            id: Joi.number().required(),
                            name: Joi.string().required()
                        }).required()
                    })
                )
                .required(),
            createdAt: Joi.date().required(),
            updatedAt: Joi.date().required()
        });
    }

    /**
     * 시스템 설정 응답 스키마
     */
    static systemSettingsResponseSchema() {
        return Joi.object({
            siteName: Joi.string().required(),
            siteDescription: Joi.string().allow(''),
            maintenanceMode: Joi.boolean().required(),
            registrationEnabled: Joi.boolean().required(),
            maxFileSize: Joi.number().integer().min(1).required(),
            allowedFileTypes: Joi.array().items(Joi.string()).required(),
            statistics: Joi.object({
                totalUsers: Joi.number().integer().min(0).required(),
                totalArtworks: Joi.number().integer().min(0).required(),
                totalExhibitions: Joi.number().integer().min(0).required(),
                activeUsers: Joi.number().integer().min(0).required()
            }).optional()
        });
    }

    /**
     * 비밀번호 초기화 응답 스키마
     */
    static passwordResetResponseSchema() {
        return Joi.object({
            tempPassword: Joi.string().required(),
            message: Joi.string().required()
        });
    }

    /**
     * 관리자 대시보드 통계 응답 스키마
     */
    static dashboardStatsResponseSchema() {
        return Joi.object({
            users: Joi.object({
                total: Joi.number().integer().min(0).required(),
                active: Joi.number().integer().min(0).required(),
                newThisMonth: Joi.number().integer().min(0).required()
            }).required(),
            artworks: Joi.object({
                total: Joi.number().integer().min(0).required(),
                active: Joi.number().integer().min(0).required(),
                pending: Joi.number().integer().min(0).required(),
                featured: Joi.number().integer().min(0).required()
            }).required(),
            exhibitions: Joi.object({
                total: Joi.number().integer().min(0).required(),
                ongoing: Joi.number().integer().min(0).required(),
                upcoming: Joi.number().integer().min(0).required(),
                featured: Joi.number().integer().min(0).required()
            }).required(),
            recentActivity: Joi.array()
                .items(
                    Joi.object({
                        type: Joi.string()
                            .valid('user_registration', 'artwork_upload', 'exhibition_created')
                            .required(),
                        description: Joi.string().required(),
                        timestamp: Joi.date().required(),
                        userId: Joi.number().integer().optional(),
                        userName: Joi.string().optional()
                    })
                )
                .required()
        });
    }

    /**
     * 사용자 관리 목록 응답 유효성 검사
     */
    validateUserManagementListResponse() {
        return this.validateWithSchema(AdminResponseDto.userManagementListResponseSchema());
    }

    /**
     * 사용자 관리 상세 응답 유효성 검사
     */
    validateUserManagementDetailResponse() {
        return this.validateWithSchema(AdminResponseDto.userManagementDetailResponseSchema());
    }

    /**
     * 작품 관리 목록 응답 유효성 검사
     */
    validateArtworkManagementListResponse() {
        return this.validateWithSchema(AdminResponseDto.artworkManagementListResponseSchema());
    }

    /**
     * 작품 관리 상세 응답 유효성 검사
     */
    validateArtworkManagementDetailResponse() {
        return this.validateWithSchema(AdminResponseDto.artworkManagementDetailResponseSchema());
    }

    /**
     * 전시회 관리 목록 응답 유효성 검사
     */
    validateExhibitionManagementListResponse() {
        return this.validateWithSchema(AdminResponseDto.exhibitionManagementListResponseSchema());
    }

    /**
     * 전시회 관리 상세 응답 유효성 검사
     */
    validateExhibitionManagementDetailResponse() {
        return this.validateWithSchema(AdminResponseDto.exhibitionManagementDetailResponseSchema());
    }

    /**
     * 시스템 설정 응답 유효성 검사
     */
    validateSystemSettingsResponse() {
        return this.validateWithSchema(AdminResponseDto.systemSettingsResponseSchema());
    }

    /**
     * 비밀번호 초기화 응답 유효성 검사
     */
    validatePasswordResetResponse() {
        return this.validateWithSchema(AdminResponseDto.passwordResetResponseSchema());
    }

    /**
     * 대시보드 통계 응답 유효성 검사
     */
    validateDashboardStatsResponse() {
        return this.validateWithSchema(AdminResponseDto.dashboardStatsResponseSchema());
    }

    /**
     * 사용자 관리 목록 응답 생성
     */
    static createUserManagementListResponse(users, pagination) {
        return new AdminResponseDto({
            items: users,
            page: pagination.page,
            total: pagination.total,
            totalPages: pagination.totalPages,
            hasNext: pagination.hasNext,
            hasPrev: pagination.hasPrev
        });
    }

    /**
     * 비밀번호 초기화 응답 생성
     */
    static createPasswordResetResponse(tempPassword) {
        return new AdminResponseDto({
            tempPassword,
            message: '비밀번호가 성공적으로 초기화되었습니다.'
        });
    }

    /**
     * 대시보드 통계 응답 생성
     */
    static createDashboardStatsResponse(stats) {
        return new AdminResponseDto(stats);
    }
}

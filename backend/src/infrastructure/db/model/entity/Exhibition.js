import { DataTypes } from 'sequelize';
import { db } from '../../adapter/MySQLDatabase.js';

const Exhibition = db.define(
    'Exhibition',
    {
        id: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^EXHIBITION_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            },
            comment: '전시회 고유 ID (EXHIBITION_uuid 형식)'
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '전시회 제목'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '전시회 설명'
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: '전시 시작일'
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: '전시 종료일'
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '전시 장소'
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '전시회 이미지 URL'
        },
        imagePublicId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '전시회 이미지 Public ID'
        },
        exhibitionType: {
            type: DataTypes.ENUM('regular', 'special'),
            allowNull: false,
            defaultValue: 'regular',
            comment: '전시회 유형 (정기/특별)'
        },
        status: {
            type: DataTypes.ENUM('planning', 'submission_open', 'review', 'active', 'completed'),
            allowNull: false,
            defaultValue: 'planning',
            comment: '전시회 상태 (기획중/작품제출중/심사중/진행중/완료)',
            validate: {
                isIn: [['planning', 'submission_open', 'review', 'active', 'completed']]
            }
        },
        isSubmissionOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '작품 제출 가능 여부'
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '주요 전시회 여부'
        }
    },
    {
        timestamps: true,
        tableName: 'exhibitions',
        underscored: true,
        indexes: [
            {
                name: 'idx_exhibition_dates',
                fields: ['startDate', 'endDate']
            },
            {
                name: 'idx_exhibition_type',
                fields: ['exhibitionType']
            },
            {
                name: 'idx_exhibition_submission',
                fields: ['isSubmissionOpen']
            },
            {
                name: 'idx_exhibition_status',
                fields: ['status']
            },
            {
                name: 'idx_exhibition_featured',
                fields: ['isFeatured']
            },
            {
                name: 'idx_exhibition_status_submission',
                fields: ['status', 'isSubmissionOpen']
            },
            {
                name: 'idx_exhibition_status_featured',
                fields: ['status', 'isFeatured']
            },
            {
                name: 'idx_exhibition_type_status',
                fields: ['exhibitionType', 'status']
            },
            {
                name: 'idx_exhibition_dates_status',
                fields: ['startDate', 'endDate', 'status']
            },
            {
                name: 'idx_exhibition_submission_featured',
                fields: ['isSubmissionOpen', 'isFeatured']
            },
            {
                name: 'idx_exhibition_title_search',
                fields: ['title']
            },
            {
                name: 'idx_exhibition_created_status',
                fields: ['createdAt', 'status']
            },
            {
                name: 'idx_exhibition_updated_status',
                fields: ['updatedAt', 'status']
            }
        ]
    }
);

// 상태 전환 검증을 위한 정적 메서드들
Exhibition.VALID_STATUS_TRANSITIONS = {
    planning: ['submission_open'],
    submission_open: ['planning', 'review'],
    review: ['active'],
    active: ['completed'],
    completed: [] // 완료된 전시회는 상태 변경 불가
};

Exhibition.STATUS_DESCRIPTIONS = {
    planning: '기획중',
    submission_open: '작품제출중',
    review: '심사중',
    active: '진행중',
    completed: '완료'
};

/**
 * 상태 전환이 유효한지 검증합니다.
 * @param {string} currentStatus - 현재 상태
 * @param {string} newStatus - 새로운 상태
 * @returns {boolean} 전환 가능 여부
 */
Exhibition.isValidStatusTransition = function (currentStatus, newStatus) {
    if (!currentStatus || !newStatus) {
        return false;
    }

    const validTransitions = Exhibition.VALID_STATUS_TRANSITIONS[currentStatus];
    return validTransitions ? validTransitions.includes(newStatus) : false;
};

/**
 * 상태에 따른 설명을 반환합니다.
 * @param {string} status - 상태
 * @returns {string} 상태 설명
 */
Exhibition.getStatusDescription = function (status) {
    return Exhibition.STATUS_DESCRIPTIONS[status] || '알 수 없음';
};

/**
 * 모든 가능한 상태 목록을 반환합니다.
 * @returns {Array<string>} 상태 목록
 */
Exhibition.getAllStatuses = function () {
    return Object.keys(Exhibition.VALID_STATUS_TRANSITIONS);
};

/**
 * 특정 상태에서 전환 가능한 상태들을 반환합니다.
 * @param {string} currentStatus - 현재 상태
 * @returns {Array<string>} 전환 가능한 상태 목록
 */
Exhibition.getValidTransitions = function (currentStatus) {
    return Exhibition.VALID_STATUS_TRANSITIONS[currentStatus] || [];
};

export default Exhibition;

import { DataTypes } from 'sequelize';
import { db } from '../../adapter/MySQLDatabase.js';

const Exhibition = db.define('Exhibition', {
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
}, {
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
        }
    ]
});

export default Exhibition;

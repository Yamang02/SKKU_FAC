import { DataTypes } from 'sequelize';
import { db } from '../../adapter/MySQLDatabase.js';

const Artwork = db.define('Artwork', {
    id: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: /^ARTWORK_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        },
        comment: '작품 고유 ID (ARTWORK_uuid 형식)'
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '작품명'
    },
    slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        comment: '작품 상세 페이지 URL용 slug'
    },
    medium: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '재료'
    },
    size: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '크기'
    },
    year: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '작품 연도'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '작품 설명'
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '이미지 URL'
    },
    imagePublicId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Cloudinary Public ID'
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '주요 작품 여부'
    },
    userId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
            model: 'user_accounts',
            key: 'id'
        },
        comment: '작품 작성자 ID (USER_uuid 형식)'
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'BLOCKED', 'DELETED'),
        allowNull: false,
        defaultValue: 'APPROVED',
        comment: '작품 상태'
    }
}, {
    timestamps: true,
    tableName: 'artworks',
    underscored: true,
    indexes: [
        {
            name: 'idx_artwork_user',
            fields: ['userId']
        }
    ],
    defaultScope: {
        where: {
            status: 'APPROVED'
        }
    },
    scopes: {
        admin: {
            where: {}
        }
    }
});

export default Artwork;

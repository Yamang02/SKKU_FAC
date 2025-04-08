import { DataTypes } from 'sequelize';
import { db } from '../../connection/MySQLDatabase.js';

const ExternalUserProfile = db.define('ExternalUserProfile', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: /^EXTERNAL_PROFILE_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        },
        comment: '외부 사용자 프로필 고유 ID (EXTERNAL_PROFILE_uuid 형식)'
    },
    userId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        references: {
            model: 'user_accounts',
            key: 'id'
        }
    },
    affiliation: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '소속 (예: 한국예술협회, 프리랜서 등)'
    }
}, {
    timestamps: true,
    tableName: 'external_user_profiles',
    underscored: true,
    indexes: [
        {
            name: 'idx_external_profile_user',
            fields: ['user_id'],
            unique: true
        }
    ]
});

export default ExternalUserProfile;

import { DataTypes } from 'sequelize';
import { db } from '../../adapter/MySQLDatabase.js';

const SkkuUserProfile = db.define('SkkuUserProfile', {
    id: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: /^SKKU_PROFILE_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        },
        comment: '성균관대 사용자 프로필 고유 ID (SKKU_PROFILE_uuid 형식)'
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
    department: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '학과'
    },
    studentYear: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: '학번 앞 2자리 (입학년도)'
    },
    isClubMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '동아리 회원 여부'
    }
}, {
    timestamps: true,
    tableName: 'skku_user_profiles',
    underscored: true,
    indexes: [
        {
            name: 'idx_skku_profile_user',
            fields: ['user_id'],
            unique: true
        },
        {
            name: 'idx_skku_profile_student_id',
            fields: ['student_id'],
            unique: true
        }
    ]
});

export default SkkuUserProfile;

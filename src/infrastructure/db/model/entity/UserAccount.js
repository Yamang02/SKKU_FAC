import { DataTypes } from 'sequelize';
import { db } from '../../connection/MySQLDatabase.js';

/**
 * 사용자 계정 모델
 *
 * 기본적인 사용자 정보만 포함하고, 추후 필요한 정보는 별도 테이블이나 메타데이터로 확장
 */
const UserAccount = db.define('UserAccount', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: /^USER_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        },
        comment: '사용자 고유 ID (USER_uuid 형식)'
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER'),
        allowNull: false,
        defaultValue: 'SKKU_MEMBER'
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
    },
    last_login_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'user_accounts',
    underscored: true,
    indexes: [
        {
            name: 'idx_user_account_email',
            fields: ['email'],
            unique: true
        },
        {
            name: 'idx_user_account_username',
            fields: ['username'],
            unique: true
        },
        {
            name: 'idx_user_account_role',
            fields: ['role']
        },
        {
            name: 'idx_user_account_status',
            fields: ['status']
        }
    ]
});

export default UserAccount;

import { Model, DataTypes } from 'sequelize';
import { db } from '../../adapter/MySQLDatabase.js';
import UserAccount from './UserAccount.js';

class Token extends Model {}

Token.init(
    {
        id: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^TOKEN_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            },
            comment: '토큰 고유 ID (TOKEN_uuid 형식)'
        },
        userId: {
            type: DataTypes.STRING(100),
            allowNull: false,
            references: {
                model: UserAccount,
                key: 'id'
            }
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET'),
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize: db,
        modelName: 'Token',
        tableName: 'tokens',
        timestamps: true,
        underscored: true,
        updatedAt: false
    }
);

export default Token;

import { DataTypes } from 'sequelize';
import { db } from '../../connection/MySQLDatabase.js';

const Notice = db.define('Notice', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: /^NOTICE_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        },
        comment: '공지사항 고유 ID (NOTICE_uuid 형식)'
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '제목'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '내용'
    },
    isImportant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '중요 공지 여부'
    },
    userId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'user_accounts',
            key: 'id'
        },
        comment: '작성자 ID (USER_uuid 형식)'
    }
}, {
    timestamps: true,
    tableName: 'notices',
    underscored: true,
    indexes: [
        {
            name: 'idx_notice_user',
            fields: ['userId']
        },
        {
            name: 'idx_notice_important',
            fields: ['isImportant']
        }
    ]
});

export default Notice;

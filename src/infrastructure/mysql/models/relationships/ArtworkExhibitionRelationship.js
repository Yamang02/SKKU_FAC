import { DataTypes } from 'sequelize';
import { sequelize } from '../../../MySQLDatabase.js';

const ArtworkExhibitionRelationship = sequelize.define('ArtworkExhibition', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: /^ARTWORK-EXHIBITION-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        },
        comment: '작품-전시회 관계 고유 ID (ARTWORK-EXHIBITION-uuid 형식)'
    },
    artworkId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'artworks',
            key: 'id'
        },
        comment: '작품 ID (ARTWORK_uuid 형식)'
    },
    exhibitionId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'exhibitions',
            key: 'id'
        },
        comment: '전시회 ID (EXHIBITION_uuid 형식)'
    }
}, {
    timestamps: true,
    tableName: 'artwork_exhibitions',
    underscored: true,
    indexes: [
        {
            name: 'idx_artwork_exhibition_artwork',
            fields: ['artworkId']
        },
        {
            name: 'idx_artwork_exhibition_exhibition',
            fields: ['exhibitionId']
        },
        {
            name: 'idx_artwork_exhibition_unique',
            fields: ['artworkId', 'exhibitionId'],
            unique: true
        }
    ]
});

export default ArtworkExhibitionRelationship;

import { DataTypes } from 'sequelize';
import { db } from '../../adapter/MySQLDatabase.js';

const ArtworkExhibitionRelationship = db.define('ArtworkExhibition', {
    artworkId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'artworks',
            key: 'id'
        },
        primaryKey: true,
        comment: '작품 ID (ARTWORK_uuid 형식)'
    },
    exhibitionId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'exhibitions',
            key: 'id'
        },
        primaryKey: true,
        comment: '전시회 ID (EXHIBITION_uuid 형식)'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '디스플레이 순서'
    }
}, {
    timestamps: true,
    tableName: 'artwork_exhibition_relationships',
    underscored: true,
    id: false,
    indexes: [
        {
            name: 'idx_artwork_exhibition_artwork',
            fields: ['artworkId']
        },
        {
            name: 'idx_artwork_exhibition_exhibition',
            fields: ['exhibitionId']
        }
    ]
});

export default ArtworkExhibitionRelationship;

import Artwork from './Artwork.js';
import Exhibition from './Exhibition.js';
import Notice from './Notice.js';
import UserAccount from './UserAccount.js';
import SkkuUserProfile from './SkkuUserProfile.js';
import ExternalUserProfile from './ExternalUserProfile.js';
import ArtworkExhibitionRelationship from '../relationship/ArtworkExhibitionRelationship.js';

// 모델 간의 관계 설정 (실제 DB는 FK 설정 없음)
UserAccount.hasOne(SkkuUserProfile, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
SkkuUserProfile.belongsTo(UserAccount, {
    foreignKey: 'userId'
});

UserAccount.hasOne(ExternalUserProfile, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
ExternalUserProfile.belongsTo(UserAccount, {
    foreignKey: 'userId'
});

UserAccount.hasMany(Artwork, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

Artwork.belongsTo(UserAccount, {
    foreignKey: 'userId'
});

Artwork.hasMany(ArtworkExhibitionRelationship, {
    foreignKey: 'artworkId',
    as: 'ArtworkExhibitions'
});
ArtworkExhibitionRelationship.belongsTo(Artwork, {
    foreignKey: 'artworkId'
});

export {
    Artwork,
    Exhibition,
    Notice,
    UserAccount,
    SkkuUserProfile,
    ExternalUserProfile
};

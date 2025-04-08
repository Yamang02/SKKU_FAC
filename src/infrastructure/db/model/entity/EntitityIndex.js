import Artwork from './Artwork.js';
import Exhibition from './Exhibition.js';
import Notice from './Notice.js';
import UserAccount from './UserAccount.js';
import SkkuUserProfile from './SkkuUserProfile.js';
import ExternalUserProfile from './ExternalUserProfile.js';

// 모델 간의 관계 설정
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

export {
    Artwork,
    Exhibition,
    Notice,
    UserAccount,
    SkkuUserProfile,
    ExternalUserProfile
};

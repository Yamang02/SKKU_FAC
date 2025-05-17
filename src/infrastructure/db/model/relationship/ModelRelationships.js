import { db } from '../../adapter/MySQLDatabase.js';
import { Artwork, Exhibition, Notice, UserAccount, SkkuUserProfile, ExternalUserProfile } from '../entity/EntitityIndex.js';
import ArtworkExhibitionRelationship from './ArtworkExhibitionRelationship.js';


/**
 * 모델 간의 관계를 정의하고 설정합니다.
 * 이 설정은 Sequelize ORM 레벨에서만 적용되며, 실제 DB에는 FK 제약조건이 생성되지 않습니다.
 *
 * 1. UserAccount - Artwork (1:N)
 *    - 한 사용자는 여러 작품을 가질 수 있음
 *    - 논리적 삭제 관계: 사용자 삭제 시 작품도 함께 삭제
 *
 * 2. Artwork - Exhibition (N:M)
 *    - 한 작품은 여러 전시회에 출품될 수 있음
 *    - 한 전시회는 여러 작품을 포함할 수 있음
 *    - ArtworkExhibitionRelationship을 통해 관계 관리
 *
 * 3. UserAccount - Notice (1:N)
 *    - 한 사용자는 여러 공지를 작성할 수 있음
 *    - 논리적 삭제 관계: 사용자 삭제 시 작성자 NULL 처리
 *
 * 4. UserAccount - SkkuUserProfile (1:1)
 *    - 성균관대학교 사용자 프로필 정보
 *    - SKKU_MEMBER 역할일 때만 사용
 *
 * 5. UserAccount - ExternalUserProfile (1:1)
 *    - 외부 사용자 프로필 정보
 *    - EXTERNAL_MEMBER 역할일 때만 사용
 */
const setupModelRelationships = () => {
    // UserAccount와 Artwork의 관계 설정 (1:N)
    UserAccount.hasMany(Artwork, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
    });
    Artwork.belongsTo(UserAccount, {
        foreignKey: 'userId'
    });

    // Artwork와 Exhibition의 관계 설정 (N:M)
    Artwork.belongsToMany(Exhibition, {
        through: ArtworkExhibitionRelationship,
        foreignKey: 'artworkId',
        otherKey: 'exhibitionId'
    });
    Exhibition.belongsToMany(Artwork, {
        through: ArtworkExhibitionRelationship,
        foreignKey: 'exhibitionId',
        otherKey: 'artworkId'
    });

    // ArtworkExhibitionRelationship과 Artwork의 직접적인 관계 설정
    Artwork.hasMany(ArtworkExhibitionRelationship, {
        foreignKey: 'artworkId',
        as: 'ArtworkExhibitions'
    });
    ArtworkExhibitionRelationship.belongsTo(Artwork, {
        foreignKey: 'artworkId'
    });

    // ArtworkExhibitionRelationship과 Exhibition의 직접적인 관계 설정
    Exhibition.hasMany(ArtworkExhibitionRelationship, {
        foreignKey: 'exhibitionId',
        as: 'ExhibitionArtworks'
    });
    ArtworkExhibitionRelationship.belongsTo(Exhibition, {
        foreignKey: 'exhibitionId'
    });

    // UserAccount와 Notice의 관계 설정 (1:N)
    UserAccount.hasMany(Notice, {
        foreignKey: 'userId',
        onDelete: 'SET NULL'
    });
    Notice.belongsTo(UserAccount, {
        foreignKey: 'userId'
    });


};

// 모델 관계 즉시 설정
setupModelRelationships();

/**
 * 모든 모델을 데이터베이스에 동기화합니다.
 * 주의: 실제 운영환경에서는 직접 작성한 스키마를 사용하므로 이 함수를 사용하지 않습니다.
 * @returns {Promise<void>}
 */
const syncModels = async () => {
    try {
        // 관계 설정은 이미 위에서 수행했으므로 여기서는 주석 처리합니다.
        // setupModelRelationships();

        // 모델 동기화 (테스트/개발 환경에서만 사용)
        await db.sync({ alter: true });
    } catch (error) {
        console.error('❌ 모델 동기화 중 오류 발생:', error);
        throw error;
    }
};

// 동기화 함수 실행
syncModels();

export {
    Artwork,
    Exhibition,
    Notice,
    UserAccount,
    SkkuUserProfile,
    ExternalUserProfile,
    ArtworkExhibitionRelationship,
    setupModelRelationships,
    syncModels
};

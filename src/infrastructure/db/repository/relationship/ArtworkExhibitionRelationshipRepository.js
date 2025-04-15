import ArtworkExhibitionRelationship from '../../model/relationship/ArtworkExhibitionRelationship.js';
import { ArtworkError } from '../../../../common/error/ArtworkError.js';
import { db } from '../../adapter/MySQLDatabase.js';
class ArtworkExhibitionRelationshipRepository {
    constructor() {
    }

    async createArtworkExhibitionRelationship(artworkId, exhibitionId, options = {}) {
        const transaction = options.transaction || await db.transaction();
        try {
            const relationship = await ArtworkExhibitionRelationship.create({
                artworkId,
                exhibitionId
            }, { transaction });
            return relationship;
        } catch (error) {
            // PK 에러 처리
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ArtworkError('이미 존재하는 작품-전시회 관계입니다.'); // 사용자에게 보여줄 메시지
            }
            // 다른 에러 처리
            throw new ArtworkError('작품-전시회 관계 생성 중 오류가 발생했습니다.', error);
        }
    }

    async findArtworkExhibitionRelationshipsByArtworkId(artworkId) {
        return await ArtworkExhibitionRelationship.findAll({
            where: {
                artworkId
            }
        });
    }

    async countArtworksInExhibition(exhibitionId) {
        return await ArtworkExhibitionRelationship.count({
            where: {
                exhibitionId
            }
        });
    }

    async deleteArtworkExhibitionRelationship(artworkId, exhibitionId) {
        await ArtworkExhibitionRelationship.destroy({
            where: {
                artworkId,
                exhibitionId
            }
        });
    }

    async deleteArtworkExhibitionRelationshipByArtworkId(artworkId) {
        await ArtworkExhibitionRelationship.destroy({
            where: {
                artworkId
            }
        });
    }
}

export default ArtworkExhibitionRelationshipRepository;

import ArtworkExhibitionRelationship from '../../model/relationship/ArtworkExhibitionRelationship.js';
import { ArtworkError } from '../../../../common/error/ArtworkError.js';
import { db } from '../../adapter/MySQLDatabase.js';
class ArtworkExhibitionRelationshipRepository {
    constructor() {
    }

    async createArtworkExhibitionRelationship(artworkId, exhibitionId, options = {}) {
        // 외부에서 트랜잭션이 제공되었는지 확인
        const externalTransaction = options.transaction;
        const transaction = externalTransaction || await db.transaction();

        try {
            const result = await ArtworkExhibitionRelationship.create({
                artworkId,
                exhibitionId
            }, { transaction });

            // 내부에서 트랜잭션을 시작했다면 커밋
            if (!externalTransaction) {
                await transaction.commit();
            }

            return result;
        } catch (error) {
            // 내부에서 트랜잭션을 시작했다면 롤백
            if (!externalTransaction) {
                await transaction.rollback();
            }

            // PK 에러 처리
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ArtworkError('이미 존재하는 작품-전시회 관계입니다.');
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
        const result = await ArtworkExhibitionRelationship.destroy({
            where: {
                artworkId,
                exhibitionId
            }
        });
        return result > 0; // 삭제된 행이 있으면 true 반환
    }

    async deleteArtworkExhibitionRelationshipByArtworkId(artworkId) {
        await ArtworkExhibitionRelationship.destroy({
            where: {
                artworkId
            }
        });
    }

    async deleteArtworkExhibitionRelationshipByExhibitionId(exhibitionId) {
        await ArtworkExhibitionRelationship.destroy({
            where: {
                exhibitionId
            }
        });
    }
}

export default ArtworkExhibitionRelationshipRepository;

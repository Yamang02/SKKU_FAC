import { ArtworkExhibitionRelationship } from '../../model/entity/EntitityIndex.js';
import TransactionManager from '../../transaction/TransactionManager.js';

export default class ArtworkExhibitionRelationshipRepository {
    constructor() {
    }

    /**
     * 작품-전시회 관계를 생성합니다.
     */
    async createArtworkExhibitionRelationship(artworkId, exhibitionId, options = {}) {
        const externalTransaction = options.transaction;

        if (externalTransaction) {
            // 외부에서 트랜잭션이 제공된 경우 그대로 사용
            return await ArtworkExhibitionRelationship.create({
                artworkId,
                exhibitionId
            }, { transaction: externalTransaction });
        } else {
            // 트랜잭션이 제공되지 않은 경우 새로 생성
            return await TransactionManager.executeInTransaction(async (transaction) => {
                return await ArtworkExhibitionRelationship.create({
                    artworkId,
                    exhibitionId
                }, { transaction });
            });
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

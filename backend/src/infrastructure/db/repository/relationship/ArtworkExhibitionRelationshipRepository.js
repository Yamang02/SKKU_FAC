import { ArtworkExhibitionRelationship, Artwork } from '../../model/entity/EntitityIndex.js';
import TransactionManager from '../../transaction/TransactionManager.js';

export default class ArtworkExhibitionRelationshipRepository {
    constructor() {}

    /**
     * 작품-전시회 관계를 생성합니다.
     */
    async createArtworkExhibitionRelationship(artworkId, exhibitionId, options = {}) {
        const externalTransaction = options.transaction;

        if (externalTransaction) {
            // 외부에서 트랜잭션이 제공된 경우 그대로 사용
            return await ArtworkExhibitionRelationship.create(
                {
                    artworkId,
                    exhibitionId
                },
                { transaction: externalTransaction }
            );
        } else {
            // 트랜잭션이 제공되지 않은 경우 새로 생성
            return await TransactionManager.executeInTransaction(async transaction => {
                return await ArtworkExhibitionRelationship.create(
                    {
                        artworkId,
                        exhibitionId
                    },
                    { transaction }
                );
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

    /**
     * 전시회에 속한 작품들을 페이지네이션과 함께 조회합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 작품 목록과 페이지네이션 정보
     */
    async findArtworksByExhibitionId(exhibitionId, options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const { count, rows } = await ArtworkExhibitionRelationship.findAndCountAll({
            where: {
                exhibitionId
            },
            include: [
                {
                    model: Artwork,
                    required: true
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return {
            items: rows.map(relationship => relationship.Artwork),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        };
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

import { UserAccount, Exhibition, Artwork } from '../model/entity/EntitityIndex.js';
import { ArtworkError } from '../../../common/error/ArtworkError.js';
import { Op } from 'sequelize';
import ArtworkExhibitionRelationship from '../model/relationship/ArtworkExhibitionRelationship.js';

class ArtworkRepository {
    constructor() {
    }

    async createArtwork(artworkData) {

        try {
            const artwork = await Artwork.create({
                ...artworkData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return artwork;
        } catch (error) {
            throw new ArtworkError('작품 생성 중 오류가 발생했습니다.', error);
        }
    }

    async updateArtwork(id, artworkData) {
        try {
            const artwork = await Artwork.findByPk(id);
            if (!artwork) {
                throw new ArtworkError('작품을 찾을 수 없습니다.');
            }

            await artwork.update({
                ...artworkData,
                updatedAt: new Date()
            });
            return artwork;
        } catch (error) {
            throw new ArtworkError('작품 수정 중 오류가 발생했습니다.', error);
        }
    }

    async deleteArtwork(id) {
        try {
            const artwork = await Artwork.findByPk(id);
            if (!artwork) {
                throw new ArtworkError('작품을 찾을 수 없습니다.');
            }

            await artwork.destroy();
            return true;
        } catch (error) {
            throw new ArtworkError('작품 삭제 중 오류가 발생했습니다.', error);
        }
    }

    async findArtworks(options = {}) {
        const page = options.page || 1; // 기본값: 1
        const limit = options.limit || 12; // 기본값: 12
        const offset = (page - 1) * limit; // 시작 위치 계산

        try {
            const { count, rows } = await Artwork.findAndCountAll({
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']] // 정렬 기준
            });

            return {
                items: rows,
                total: count
            };
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            throw error;
        }
    }

    async findArtists() {
        try {
            const artworks = await Artwork.findAll({
                attributes: ['artistName'],
                group: ['artistName']
            });
            return artworks.map(artwork => ({
                id: artwork.artistName,
                name: artwork.artistName
            }));
        } catch (error) {
            throw new ArtworkError('작가 목록 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findRelatedArtworks(artworkId) {
        try {
            const relatedIds = this.getRelatedArtworks ? this.getRelatedArtworks(artworkId) : [];
            if (!relatedIds || !Array.isArray(relatedIds) || relatedIds.length === 0) {
                return { items: [], total: 0 };
            }

            const relatedArtworks = await Artwork.findAll({
                where: {
                    id: { [Op.in]: relatedIds }
                }
            });

            return {
                items: relatedArtworks,
                total: relatedArtworks.length
            };
        } catch (error) {
            return { items: [], total: 0 };
        }
    }

    async findFeaturedArtworks(limit) {
        try {
            const featuredArtworks = await Artwork.findAll({
                where: { isFeatured: true },
                order: [['createdAt', 'DESC']],
                limit: limit
            });
            return featuredArtworks;
        } catch (error) {
            throw new ArtworkError('추천 작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findByTitleAndArtist(title, artistName) {
        try {
            const artwork = await Artwork.findOne({
                where: {
                    title: title,
                    artistName: artistName
                }
            });
            return artwork ? artwork : null;
        } catch (error) {
            throw new ArtworkError('작품 제목과 작가 이름으로 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findByArtistId(artistId, limit, excludeId) {
        try {
            const artworks = await Artwork.findAll({
                where: {
                    artistId: artistId,
                    id: { [Op.ne]: excludeId } // 제외할 작품 ID
                },
                limit: limit,
                order: [['createdAt', 'DESC']]
            });
            return artworks;
        } catch (error) {
            throw new ArtworkError('작가의 작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findByExhibitionId(exhibitionId, limit, excludeId) {
        try {
            const artworks = await ArtworkExhibitionRelationship.findAll({
                where: {
                    exhibitionId: exhibitionId,
                    id: { [Op.ne]: excludeId }
                },
                include: [{
                    model: Artwork,
                    required: true
                }],
                limit: limit,
                order: [['createdAt', 'DESC']]
            });

            return artworks.map(rel => rel.artwork); // 관계에서 작품 정보 반환
        } catch (error) {
            throw new ArtworkError('전시회의 작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    /**
 * 작품과 관련된 사용자 및 전시회 정보를 조회합니다.
 * @param {string} artworkId - 작품 ID
 * @returns {Promise<Artwork|null>} 작품 정보와 관련된 데이터
 */
    async findArtworkWithRelations(artworkId) {
        const artwork = await Artwork.findOne({
            where: { id: artworkId },
            include: [
                {
                    model: UserAccount,
                    required: false // UserAccount가 없어도 결과에 포함
                },
                {
                    model: Exhibition,
                    required: false // Exhibition이 없어도 결과에 포함
                }
            ]
        });

        return artwork;
    }
}


export default ArtworkRepository;

import { Artwork, UserAccount } from '../model/entity/EntitityIndex.js';
import { ArtworkError } from '../../../common/error/ArtworkError.js';
import ArtworkExhibitionRelationship from '../model/relationship/ArtworkExhibitionRelationship.js';
import { Op } from 'sequelize';
import { db } from '../adapter/MySQLDatabase.js';

class ArtworkRepository {
    constructor() {
    }

    async createArtwork(artworkData, options = {}) {
        const transaction = options.transaction || await db.transaction();
        try {
            const artwork = await Artwork.create({
                ...artworkData,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction });
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

            ('작품 수정 중:', artworkData);
            await artwork.update({
                ...artworkData,
                updatedAt: new Date()
            });
            return artwork;
        } catch (error) {
            throw new ArtworkError('작품 수정 중 오류가 발생했습니다.', error);
        }
    }

    async updateArtworkDeleted(id) {
        await Artwork.update({ status: 'DELETED' }, { where: { id } });
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


    async findArtworkById(id) {
        try {
            const artwork = await Artwork.findByPk(id);
            return artwork;
        } catch (error) {
            throw new ArtworkError('작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findArtworks(options = {}) {
        const where = {};

        // 키워드 검색 조건 추가
        if (options.keyword) {
            where[Op.or] = [
                { title: { [Op.like]: `%${options.keyword}%` } },
                { '$UserAccount.name$': { [Op.like]: `%${options.keyword}%` } }
            ];
        }

        // 일반 사용자는 defaultScope 사용 (승인된 작품만)
        return await this.findArtworksWithOptions(where, options, false);
    }

    async findArtworksForAdmin(options = {}) {
        const where = {};

        // 키워드 검색 조건 추가
        if (options.keyword) {
            where[Op.or] = [
                { title: { [Op.like]: `%${options.keyword}%` } },
                { '$UserAccount.name$': { [Op.like]: `%${options.keyword}%` } }
            ];
        }

        // 관리자는 admin scope 사용 (모든 작품)
        return await this.findArtworksWithOptions(where, options, true);
    }

    async findArtworksWithOptions(where = {}, options = {}, isAdmin = false) {
        const page = options.page || 1;
        const limit = options.limit || 12;
        const offset = (page - 1) * limit;
        const sortField = options.sortField || 'createdAt';
        const sortOrder = options.sortOrder || 'DESC';
        const include = [{
            model: UserAccount,
            attributes: ['name']
        }];

        try {
            const queryOptions = {
                where,
                include,
                limit,
                offset,
                order: [[sortField, sortOrder.toUpperCase()]]
            };

            let result;
            if (isAdmin) {
                // 관리자는 admin scope 사용하여 모든 작품 조회
                result = await Artwork.scope('admin').findAndCountAll(queryOptions);
            } else {
                // 일반 사용자는 defaultScope 사용하여 승인된 작품만 조회
                result = await Artwork.findAndCountAll(queryOptions);
            }

            return {
                items: result.rows,
                total: result.count,
                page,
                limit
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
                    userId: artistId,
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

    async findArtworkBySlug(slug) {
        try {
            const artwork = await Artwork.findOne({
                where: { slug: slug }
            });

            if (!artwork) {
                return null;
            }

            return artwork;
        } catch (error) {
            console.error('작품 조회 오류:', error);
            throw error;
        }
    }
}

export default ArtworkRepository;

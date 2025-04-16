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

    async updateArtwork(id, artworkData, isAdmin = false) {
        try {
            const artwork = isAdmin ? await Artwork.scope('admin').findByPk(id) : await Artwork.findByPk(id);
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


    async findArtworkById(id, isAdmin = false) {
        try {
            if (isAdmin) {
                const artwork = await Artwork.scope('admin').findByPk(id);
                return artwork;
            } else {
                const artwork = await Artwork.findByPk(id);
                return artwork;
            }
        } catch (error) {
            throw new ArtworkError('작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findArtworks(options = {}, isAdmin = false) {
        const where = {};
        const include = [{
            model: UserAccount,
            attributes: ['name']
        }];

        // 키워드 검색 조건이 있는 경우
        if (options.keyword) {
            // 작품명 검색
            where.title = { [Op.like]: `%${options.keyword}%` };
        }

        // 제작 연도 필터링 추가
        if (options.year) {
            where.year = options.year;
        }

        // 전시회 ID 필터링 추가 (전시회 ID가 있을 때만 적용)
        if (options.exhibition) {
            // ArtworkExhibitionRelationship 테이블을 통한 전시회 필터링
            include.push({
                model: ArtworkExhibitionRelationship,
                as: 'ArtworkExhibitions',
                where: { exhibitionId: options.exhibition },
                required: true
            });
        }

        // 일반 사용자는 defaultScope 사용 (승인된 작품만)
        const result = await this.findArtworksWithOptions(where, { ...options, include }, isAdmin);

        // 키워드 검색이 있고 작가명으로 검색해야 하는 경우
        if (options.keyword) {
            // 작가명 검색을 위한 조건 생성
            const artistWhere = {};
            const artistInclude = [{
                model: UserAccount,
                where: { name: { [Op.like]: `%${options.keyword}%` } },
                attributes: ['name'],
                required: true
            }];

            // 전시회 필터링 조건이 있으면 추가
            if (options.exhibition) {
                artistInclude.push({
                    model: ArtworkExhibitionRelationship,
                    as: 'ArtworkExhibitions',
                    where: { exhibitionId: options.exhibition },
                    required: true
                });
            }

            // 제작 연도 필터링 추가
            if (options.year) {
                artistWhere.year = options.year;
            }

            // 작가명 검색 결과 가져오기
            const artistResult = await this.findArtworksWithOptions(artistWhere, { ...options, include: artistInclude }, isAdmin);

            // 중복 제거하여 두 결과 병합
            const combinedItems = [...result.items];
            const existingIds = new Set(result.items.map(item => item.id));

            for (const item of artistResult.items) {
                if (!existingIds.has(item.id)) {
                    combinedItems.push(item);
                    existingIds.add(item.id);
                }
            }

            // 정렬 (options.sortField, options.sortOrder 기준)
            const sortField = options.sortField || 'createdAt';
            const sortOrder = (options.sortOrder || 'DESC').toLowerCase();

            combinedItems.sort((a, b) => {
                const valueA = a[sortField];
                const valueB = b[sortField];

                if (sortOrder === 'desc') {
                    return valueA < valueB ? 1 : -1;
                } else {
                    return valueA > valueB ? 1 : -1;
                }
            });

            // 페이지네이션 적용
            const page = options.page || 1;
            const limit = options.limit || 12;
            const offset = (page - 1) * limit;

            const total = combinedItems.length;
            const paginatedItems = combinedItems.slice(offset, offset + limit);

            return {
                items: paginatedItems,
                total,
                page,
                limit
            };
        }

        return result;
    }

    async findArtworksWithOptions(where = {}, options = {}, isAdmin = false) {
        const page = options.page || 1;
        const limit = options.limit || 12;
        const offset = (page - 1) * limit;
        const sortField = options.sortField || 'createdAt';
        const sortOrder = options.sortOrder || 'DESC';
        const include = options.include || [{
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
            const artworkExhibitionRelationships = await ArtworkExhibitionRelationship.findAll({
                where: {
                    exhibitionId: exhibitionId,
                    artworkId: { [Op.ne]: excludeId }
                },
                include: [{
                    model: Artwork,
                    required: true
                }],
                limit: limit,
                order: [['createdAt', 'DESC']]
            });

            return artworkExhibitionRelationships; // 관계에서 작품 정보 반환
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

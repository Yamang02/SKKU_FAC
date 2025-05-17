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
            // 작품명 검색만 먼저 설정
            where[Op.or] = [
                { title: { [Op.like]: `%${options.keyword}%` } }
            ];
        }

        // 상태 필터링
        if (options.status) {
            where.status = options.status;
        }

        // 주요 작품 필터링
        if (options.isFeatured === true) {
            where.isFeatured = true;
        } else if (options.isFeatured === false) {
            where.isFeatured = false;
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

        // 정렬 필드와 방향 설정
        const sortField = options.sortField || 'createdAt';
        const sortOrder = options.sortOrder || 'DESC';

        // 일반 사용자는 defaultScope 사용 (승인된 작품만)
        const queryOptions = this.buildQueryOptions(where, {
            ...options,
            include,
            sortField,
            sortOrder
        });

        // 먼저 제목으로 검색한 결과 가져오기
        const result = await this.executeQuery(queryOptions, isAdmin);

        // 키워드 검색이 있는 경우 작가명으로도 검색 (작가 이름으로 검색)
        if (options.keyword) {
            const artistQueryOptions = this.buildArtistSearchQueryOptions(options);
            const artistResult = await this.executeQuery(artistQueryOptions, isAdmin);

            // 중복 제거하여 두 결과 병합
            return this.mergeAndPaginateResults(result, artistResult, options, sortField, sortOrder);
        }

        return result;
    }

    buildQueryOptions(where, options) {
        const page = options.page || 1;
        const limit = options.limit || 12;
        const offset = (page - 1) * limit;
        const sortField = options.sortField || 'createdAt';
        const sortOrder = options.sortOrder || 'DESC';
        const include = options.include || [{
            model: UserAccount,
            attributes: ['name']
        }];

        return {
            where,
            include,
            limit,
            offset,
            order: [[sortField, sortOrder.toUpperCase()]]
        };
    }

    buildArtistSearchQueryOptions(options) {
        const artistWhere = {};
        const artistInclude = [{
            model: UserAccount,
            where: { name: { [Op.like]: `%${options.keyword}%` } },
            attributes: ['name'],
            required: true
        }];

        // 상태 필터링
        if (options.status) {
            artistWhere.status = options.status;
        }

        // 주요 작품 필터링
        if (options.isFeatured === true) {
            artistWhere.isFeatured = true;
        } else if (options.isFeatured === false) {
            artistWhere.isFeatured = false;
        }

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

        return this.buildQueryOptions(artistWhere, { ...options, include: artistInclude });
    }

    async executeQuery(queryOptions, isAdmin) {
        try {
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
                page: queryOptions.page || 1,
                limit: queryOptions.limit || 12
            };
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            throw error;
        }
    }

    mergeAndPaginateResults(titleResult, artistResult, options, sortField, sortOrder) {
        // 중복 제거하여 두 결과 병합
        const combinedItems = [...titleResult.items];
        const existingIds = new Set(titleResult.items.map(item => item.id));

        for (const item of artistResult.items) {
            if (!existingIds.has(item.id)) {
                combinedItems.push(item);
                existingIds.add(item.id);
            }
        }

        // 정렬
        combinedItems.sort((a, b) => {
            const valueA = a[sortField];
            const valueB = b[sortField];

            if (sortOrder.toLowerCase() === 'desc') {
                if (valueA instanceof Date && valueB instanceof Date) {
                    return valueB.getTime() - valueA.getTime();
                }
                return valueA < valueB ? 1 : -1;
            } else {
                if (valueA instanceof Date && valueB instanceof Date) {
                    return valueA.getTime() - valueB.getTime();
                }
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

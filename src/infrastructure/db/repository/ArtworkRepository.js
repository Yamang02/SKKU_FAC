import { Artwork, UserAccount } from '../model/entity/EntitityIndex.js';
import { ArtworkError } from '../../../common/error/ArtworkError.js';
import ArtworkExhibitionRelationship from '../model/relationship/ArtworkExhibitionRelationship.js';
import { Op } from 'sequelize';
import BaseRepository from './BaseRepository.js';

class ArtworkRepository extends BaseRepository {
    constructor() {
        super(Artwork);
    }

    /**
     * 기본 include 옵션 (작가 정보 포함)
     */
    getDefaultInclude() {
        return [{
            model: UserAccount,
            attributes: ['name']
        }];
    }

    async createArtwork(artworkData, options = {}) {
        try {
            return await this.create(artworkData, options);
        } catch (error) {
            throw new ArtworkError('작품 생성 중 오류가 발생했습니다.', error);
        }
    }

    async updateArtwork(id, artworkData, isAdmin = false) {
        try {
            const scope = isAdmin ? 'admin' : undefined;
            const artwork = await this.findById(id, { scope });

            if (!artwork) {
                throw new ArtworkError('작품을 찾을 수 없습니다.');
            }

            return await this.updateById(id, artworkData);
        } catch (error) {
            throw new ArtworkError('작품 수정 중 오류가 발생했습니다.', error);
        }
    }

    async updateArtworkDeleted(id) {
        return await this.updateById(id, { status: 'DELETED' }, { returning: false });
    }

    async deleteArtwork(id) {
        try {
            const result = await this.deleteById(id);
            if (!result) {
                throw new ArtworkError('작품을 찾을 수 없습니다.');
            }
            return true;
        } catch (error) {
            throw new ArtworkError('작품 삭제 중 오류가 발생했습니다.', error);
        }
    }

    async findArtworkById(id, isAdmin = false) {
        try {
            const scope = isAdmin ? 'admin' : undefined;
            return await this.findById(id, { scope });
        } catch (error) {
            throw new ArtworkError('작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findArtworks(options = {}, isAdmin = false) {
        const where = {};
        const include = [...this.getDefaultInclude()];

        // 키워드 검색 조건이 있는 경우
        if (options.keyword) {
            // 작품명 검색만 먼저 설정
            Object.assign(where, this.buildSearchCondition(options.keyword, ['title']));
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
        const scope = isAdmin ? 'admin' : undefined;

        const queryOptions = {
            where,
            include,
            page: options.page || 1,
            limit: options.limit || 12,
            order: [[sortField, sortOrder.toUpperCase()]],
            scope
        };

        // 먼저 제목으로 검색한 결과 가져오기
        const result = await this.findAll(queryOptions);

        // 키워드 검색이 있는 경우 작가명으로도 검색 (작가 이름으로 검색)
        if (options.keyword) {
            const artistQueryOptions = this.buildArtistSearchQueryOptions(options, isAdmin);
            const artistResult = await this.findAll(artistQueryOptions);

            // 중복 제거하여 두 결과 병합
            return this.mergeAndPaginateResults(result, artistResult, options, sortField, sortOrder);
        }

        return result;
    }

    buildArtistSearchQueryOptions(options, isAdmin = false) {
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

        const scope = isAdmin ? 'admin' : undefined;

        return {
            where: artistWhere,
            include: artistInclude,
            page: options.page || 1,
            limit: options.limit || 12,
            order: [[options.sortField || 'createdAt', (options.sortOrder || 'DESC').toUpperCase()]],
            scope
        };
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
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        };
    }

    async findArtists() {
        try {
            const artworks = await this.getModel().findAll({
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
            return await this.findAll({
                where: { isFeatured: true },
                order: [['createdAt', 'DESC']],
                limit: limit,
                pagination: false
            });
        } catch (error) {
            throw new ArtworkError('추천 작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findByArtistId(artistId, limit, excludeId) {
        try {
            const where = { userId: artistId };
            if (excludeId) {
                where.id = { [Op.ne]: excludeId };
            }

            return await this.findAll({
                where,
                limit: limit,
                order: [['createdAt', 'DESC']],
                pagination: false
            });
        } catch (error) {
            throw new ArtworkError('작가의 작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async findByExhibitionId(exhibitionId, limit, excludeId) {
        try {
            const where = { exhibitionId: exhibitionId };
            if (excludeId) {
                where.artworkId = { [Op.ne]: excludeId };
            }

            const artworkExhibitionRelationships = await ArtworkExhibitionRelationship.findAll({
                where,
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
            return await this.findOne({ slug: slug });
        } catch (error) {
            console.error('작품 조회 오류:', error);
            throw error;
        }
    }
}

export default ArtworkRepository;

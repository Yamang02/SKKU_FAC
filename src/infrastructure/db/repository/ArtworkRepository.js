import { Artwork, UserAccount } from '../model/entity/EntitityIndex.js';
import { ArtworkError } from '../../../common/error/ArtworkError.js';
import ArtworkExhibitionRelationship from '../model/relationship/ArtworkExhibitionRelationship.js';
import { Op } from 'sequelize';
import CachedRepository from '../../../common/cache/CachedRepository.js';
import logger from '../../../common/utils/Logger.js';

class ArtworkRepository extends CachedRepository {
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

    /**
     * 최적화된 키워드 검색 (UNION 쿼리 사용)
     * @param {object} options - 검색 옵션
     * @param {boolean} isAdmin - 관리자 여부
     * @returns {Promise<object>} 검색 결과
     */
    async findArtworksOptimized(options = {}, isAdmin = false) {
        if (!options.keyword) {
            // 키워드가 없으면 기본 메서드 사용
            return await this.findArtworks(options, isAdmin);
        }

        // UNION을 사용한 최적화된 검색 쿼리
        const baseWhere = this.buildBaseWhereCondition(options);

        const sql = `
            SELECT DISTINCT a.*, u.name as user_name
            FROM artworks a
            LEFT JOIN user_accounts u ON a.user_id = u.id
            WHERE (
                (a.title LIKE :keyword OR u.name LIKE :keyword)
                ${baseWhere.sql}
            )
            ${options.exhibition ? 'AND EXISTS (SELECT 1 FROM artwork_exhibition_relationships aer WHERE aer.artwork_id = a.id AND aer.exhibition_id = :exhibition)' : ''}
            ORDER BY ${options.sortField || 'a.created_at'} ${(options.sortOrder || 'DESC').toUpperCase()}
            LIMIT :limit OFFSET :offset
        `;

        const countSql = `
            SELECT COUNT(DISTINCT a.id) as total
            FROM artworks a
            LEFT JOIN user_accounts u ON a.user_id = u.id
            WHERE (
                (a.title LIKE :keyword OR u.name LIKE :keyword)
                ${baseWhere.sql}
            )
            ${options.exhibition ? 'AND EXISTS (SELECT 1 FROM artwork_exhibition_relationships aer WHERE aer.artwork_id = a.id AND aer.exhibition_id = :exhibition)' : ''}
        `;

        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 12;
        const offset = (page - 1) * limit;

        const replacements = {
            keyword: `%${options.keyword}%`,
            limit,
            offset,
            ...baseWhere.replacements
        };

        if (options.exhibition) {
            replacements.exhibition = options.exhibition;
        }

        try {
            const [items, countResult] = await Promise.all([
                this.executeRawQuery(sql, { replacements }),
                this.executeRawQuery(countSql, { replacements })
            ]);

            const total = countResult[0]?.total || 0;
            const totalPages = Math.ceil(total / limit);

            return {
                items,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        } catch (error) {
            logger.error('최적화된 작품 검색 실패:', error);
            // 실패 시 기본 메서드로 폴백
            return await this.findArtworks(options, isAdmin);
        }
    }

    /**
     * 기본 WHERE 조건 생성
     * @param {object} options - 검색 옵션
     * @returns {object} SQL 조건과 바인딩 파라미터
     */
    buildBaseWhereCondition(options) {
        const conditions = [];
        const replacements = {};

        if (options.status) {
            conditions.push('a.status = :status');
            replacements.status = options.status;
        }

        if (options.isFeatured === true) {
            conditions.push('a.is_featured = true');
        } else if (options.isFeatured === false) {
            conditions.push('a.is_featured = false');
        }

        if (options.year) {
            conditions.push('a.year = :year');
            replacements.year = options.year;
        }

        const sql = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';

        return { sql, replacements };
    }

    /**
     * 전시회별 작품 조회 최적화 (배치 로딩)
     * @param {string} exhibitionId - 전시회 ID
     * @param {object} options - 조회 옵션
     * @returns {Promise<Array>} 작품 목록
     */
    async findArtworksByExhibitionOptimized(exhibitionId, options = {}) {
        const { limit = 20, excludeId = null } = options;

        // 1단계: 전시회-작품 관계 조회
        const relationshipSql = `
            SELECT artwork_id, display_order
            FROM artwork_exhibition_relationships
            WHERE exhibition_id = :exhibitionId
            ${excludeId ? 'AND artwork_id != :excludeId' : ''}
            ORDER BY display_order ASC, created_at DESC
            LIMIT :limit
        `;

        const relationships = await this.executeRawQuery(relationshipSql, {
            replacements: {
                exhibitionId,
                excludeId,
                limit
            }
        });

        if (relationships.length === 0) {
            return [];
        }

        // 2단계: 작품 정보 배치 조회
        const artworkIds = relationships.map(rel => rel.artwork_id);
        const artworks = await this.findByIds(artworkIds, {
            include: this.getDefaultInclude()
        });

        // 3단계: display_order에 따라 정렬
        const orderMap = new Map(relationships.map(rel => [rel.artwork_id, rel.display_order]));

        return artworks.sort((a, b) => {
            const orderA = orderMap.get(a.id) || 999;
            const orderB = orderMap.get(b.id) || 999;
            return orderA - orderB;
        });
    }

    /**
     * 주요 작품 조회 최적화
     * @param {number} limit - 조회 제한 수
     * @returns {Promise<Array>} 주요 작품 목록
     */
    async findFeaturedArtworksOptimized(limit = 6) {
        // 최적화된 쿼리로 주요 작품 조회
        return await this.findAllOptimized({
            where: { isFeatured: true, status: 'ACTIVE' },
            includes: ['UserAccount'],
            limit,
            order: [['createdAt', 'DESC']],
            pagination: false
        });
    }

    /**
     * 작가별 작품 통계 조회
     * @param {string} artistId - 작가 ID (선택적)
     * @returns {Promise<Array>} 작가별 작품 통계
     */
    async getArtworkStatsByArtist(artistId = null) {
        const whereClause = artistId ? 'WHERE a.user_id = :artistId' : '';

        const sql = `
            SELECT
                u.id as artist_id,
                u.name as artist_name,
                COUNT(a.id) as total_artworks,
                COUNT(CASE WHEN a.is_featured = true THEN 1 END) as featured_count,
                COUNT(CASE WHEN a.status = 'ACTIVE' THEN 1 END) as active_count,
                MAX(a.created_at) as latest_artwork_date
            FROM user_accounts u
            LEFT JOIN artworks a ON u.id = a.user_id
            ${whereClause}
            GROUP BY u.id, u.name
            HAVING total_artworks > 0
            ORDER BY total_artworks DESC
        `;

        const replacements = artistId ? { artistId } : {};

        return await this.executeRawQuery(sql, { replacements });
    }

    /**
     * 연도별 작품 통계 조회
     * @returns {Promise<Array>} 연도별 작품 통계
     */
    async getArtworkStatsByYear() {
        return await this.aggregate({
            field: 'id',
            fn: 'COUNT',
            where: { status: 'ACTIVE' },
            group: ['year']
        });
    }

    /**
     * 관련 작품 추천 (같은 작가 또는 같은 전시회)
     * @param {string} artworkId - 기준 작품 ID
     * @param {number} limit - 추천 작품 수
     * @returns {Promise<Array>} 추천 작품 목록
     */
    async findRelatedArtworks(artworkId, limit = 4) {
        const sql = `
            SELECT DISTINCT a.*, u.name as user_name,
                   CASE
                       WHEN a.user_id = (SELECT user_id FROM artworks WHERE id = :artworkId) THEN 1
                       ELSE 2
                   END as relevance_score
            FROM artworks a
            LEFT JOIN user_accounts u ON a.user_id = u.id
            WHERE a.id != :artworkId
              AND a.status = 'ACTIVE'
              AND (
                  a.user_id = (SELECT user_id FROM artworks WHERE id = :artworkId)
                  OR EXISTS (
                      SELECT 1 FROM artwork_exhibition_relationships aer1
                      JOIN artwork_exhibition_relationships aer2 ON aer1.exhibition_id = aer2.exhibition_id
                      WHERE aer1.artwork_id = a.id AND aer2.artwork_id = :artworkId
                  )
              )
            ORDER BY relevance_score ASC, a.created_at DESC
            LIMIT :limit
        `;

        return await this.executeRawQuery(sql, {
            replacements: { artworkId, limit }
        });
    }
}

export default ArtworkRepository;

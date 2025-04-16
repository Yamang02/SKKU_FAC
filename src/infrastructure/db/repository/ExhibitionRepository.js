import { Exhibition } from '../model/entity/EntitityIndex.js';
import { Op } from 'sequelize';
import { ArtworkExhibitionRelationship } from '../model/entity/EntitityIndex.js';
import { Sequelize } from 'sequelize';

export default class ExhibitionRepository {
    constructor() {
    }

    /**
     * 모든 전시회를 조회합니다.
     * @param {Object} options - 조회 옵션
     * @param {number} options.page - 페이지 번호
     * @param {number} options.limit - 페이지당 항목 수
     * @param {string} options.type - 전시회 유형 필터
     * @param {string} options.year - 전시회 연도 필터
     * @param {string} options.category - 전시회 카테고리 필터
     * @param {boolean} options.isSubmissionOpen - 출품 가능 여부 필터
     * @param {string} options.keyword - 검색 키워드
     * @param {string} options.searchType - 검색 타입 (title, all 등)
     * @param {string} options.sortField - 정렬 필드
     * @param {string} options.sortOrder - 정렬 순서 (ASC, DESC)
     * @returns {Promise<Object>} 전시회 목록 및 페이지네이션 정보
     */
    async findExhibitions(options = {}) {
        const {
            page = 1,
            limit = 10,
            type,
            exhibitionType,
            year,
            category,
            isSubmissionOpen,
            isFeatured,
            keyword,
            search,
            searchType = 'title',
            sortField = 'createdAt',
            sortOrder = 'DESC'
        } = options;

        const offset = (page - 1) * limit; // 페이지네이션을 위한 오프셋 계산
        const where = {};

        // 전시회 유형 필터링 (type 또는 exhibitionType 사용)
        if (exhibitionType || type) {
            where.exhibition_type = exhibitionType || type;
        }

        // 연도 필터링 (start_date의 연도 부분)
        if (year) {
            // MySQL에서 YEAR 함수 사용, 컬럼명을 start_date로 변경
            where.start_date = Sequelize.where(
                Sequelize.fn('YEAR', Sequelize.col('start_date')),
                year
            );
        }

        // 카테고리 필터링
        if (category) {
            where.category = category;
        }

        // 출품 가능 여부 필터링
        if (isSubmissionOpen !== undefined) {
            // MySQL에서 is_submission_open은 tinyint(1)로 저장됨
            // true는 1, false는 0에 매핑
            // 반드시 is_submission_open 컬럼명 사용
            where.is_submission_open = isSubmissionOpen;
        }

        // 주요 전시 여부 필터링
        if (isFeatured !== undefined) {
            where.is_featured = isFeatured;
        }

        // 키워드 검색 - MySQL에서는 ILIKE 대신 LIKE 사용 (keyword 또는 search 사용)
        const searchKeyword = search || keyword;
        if (searchKeyword) {
            const likePattern = `%${searchKeyword}%`;
            if (searchType === 'title') {
                // MySQL에서는 대소문자 구분 없이 검색하려면 LOWER 함수 사용
                where.title = Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('title')),
                    'LIKE',
                    likePattern.toLowerCase()
                );
            } else if (searchType === 'all') {
                where[Op.or] = [
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('title')),
                        'LIKE',
                        likePattern.toLowerCase()
                    ),
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('description')),
                        'LIKE',
                        likePattern.toLowerCase()
                    ),
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('location')),
                        'LIKE',
                        likePattern.toLowerCase()
                    )
                ];
            }
        }

        // 정렬 옵션 설정 - 컬럼명을 snake_case로 변환
        const orderField = this.convertToSnakeCase(sortField);
        const order = [[orderField, sortOrder]];

        try {
            const { count, rows } = await Exhibition.findAndCountAll({
                where,
                limit,
                offset,
                order
            });

            return {
                items: rows,
                total: count,
                page: Number(page),
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('전시회 목록 조회 중 오류:', error);
            throw error;
        }
    }

    /**
     * camelCase를 snake_case로 변환하는 유틸리티 함수
     * @param {string} camelCase - 변환할 camelCase 문자열
     * @returns {string} 변환된 snake_case 문자열
     */
    convertToSnakeCase(camelCase) {
        // 정렬을 위한 특수 케이스 처리
        const specialCases = {
            'startDate': 'start_date',
            'endDate': 'end_date',
            'createdAt': 'created_at',
            'updatedAt': 'updated_at',
            'exhibitionType': 'exhibition_type',
            'isSubmissionOpen': 'is_submission_open',
            'isFeatured': 'is_featured'
        };

        if (specialCases[camelCase]) {
            return specialCases[camelCase];
        }

        // 일반적인 camelCase -> snake_case 변환
        return camelCase.replace(/([A-Z])/g, '_$1').toLowerCase();
    }

    /**
     * ID로 전시회를 조회합니다.
     */
    async findExhibitionById(id) {
        return await Exhibition.findByPk(id) || null;
    }

    async findExhibitionsByIds(ids) {
        return await Exhibition.findAll({
            where: { id: { [Op.in]: ids } }
        });
    }

    /**
     * 새로운 전시회를 생성합니다.
     */
    async createExhibition(exhibitionData) {
        const newExhibition = await Exhibition.create({
            ...exhibitionData,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return newExhibition;
    }

    /**
     * 전시회 정보를 수정합니다.
     */
    async updateExhibition(id, exhibitionData) {
        const exhibition = await Exhibition.findByPk(id);
        if (!exhibition) return null;

        // 제공된 데이터의 속성만 업데이트하고 나머지는 유지
        const updatedData = { ...exhibitionData };

        // isSubmissionOpen 필드가 있으면 형변환 처리
        if ('isSubmissionOpen' in updatedData) {
            updatedData.isSubmissionOpen = updatedData.isSubmissionOpen === 'true' || updatedData.isSubmissionOpen === true;
        }

        // isFeatured 필드가 있으면 형변환 처리
        if ('isFeatured' in updatedData) {
            updatedData.isFeatured = updatedData.isFeatured === 'true' || updatedData.isFeatured === true;
        }

        // 항상 업데이트 시간은 갱신
        updatedData.updatedAt = new Date();

        await exhibition.update(updatedData);
        return exhibition;
    }

    /**
     * 전시회를 삭제합니다.
     */
    async deleteExhibition(id) {
        const exhibition = await Exhibition.findByPk(id);
        if (!exhibition) return false;

        await exhibition.destroy();
        return true;
    }

    /**
     * 현재 진행 중인 전시회를 조회합니다.
     */
    async findActiveExhibitions() {
        const now = new Date();
        return await Exhibition.findAll({
            where: {
                startDate: { [Op.lte]: now },
                endDate: { [Op.gte]: now }
            }
        });
    }

    /**
     * 출품 가능한 전시회 목록을 조회합니다.
     */
    async findSubmittableExhibitions(artworkId = null) {
        const exhibitions = await Exhibition.findAll({
            where: { is_submission_open: true }
        });
        if (artworkId) {
            // 이미 출품된 전시회 조회
            const submittedExhibitions = await ArtworkExhibitionRelationship.findAll({
                where: { artwork_id: artworkId }
            });

            const submittedExhibitionIds = submittedExhibitions.map(exhibition => exhibition.exhibitionId);


            // 출품 가능한 전시회에서 이미 출품된 전시회 제외
            return exhibitions.filter(exhibition => !submittedExhibitionIds.includes(exhibition.id));
        }

        return exhibitions;
    }

    async findFeaturedExhibitions(limit = 10) {
        return await Exhibition.findAll({
            where: { is_featured: true },
            limit: parseInt(limit, 10)
        });
    }
}

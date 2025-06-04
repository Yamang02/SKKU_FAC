import { Exhibition } from '../model/entity/EntitityIndex.js';
import { Op } from 'sequelize';
import { ArtworkExhibitionRelationship } from '../model/entity/EntitityIndex.js';
import { Sequelize } from 'sequelize';
import { ExhibitionError, ExhibitionNotFoundError } from '../../../common/error/ExhibitionError.js';
import CachedRepository from '../../../common/cache/CachedRepository.js';
import logger from '../../../common/utils/Logger.js';

export default class ExhibitionRepository extends CachedRepository {
    constructor() {
        super(Exhibition);
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
     * @param {string} options.status - 전시회 상태 필터
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
            sortOrder = 'DESC',
            status
        } = options;

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

        // 상태 필터링 (새로 추가)
        if (status) {
            where.status = status;
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

        return await this.findAll({
            where,
            page,
            limit,
            order
        });
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
            'isFeatured': 'is_featured',
            'status': 'status'
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
        return await this.findById(id);
    }

    async findExhibitionsByIds(ids) {
        return await this.findAll({
            where: { id: { [Op.in]: ids } },
            pagination: false
        });
    }

    /**
     * 새로운 전시회를 생성합니다.
     */
    async createExhibition(exhibitionData) {
        // 데이터 일관성 검증 및 자동 조정
        const validatedData = this.validateAndAdjustData(exhibitionData);
        return await this.create(validatedData);
    }

    /**
     * 전시회 정보를 수정합니다.
     */
    async updateExhibition(id, exhibitionData) {
        const exhibition = await this.findById(id);
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

        // 데이터 일관성 검증 및 자동 조정
        const validatedData = this.validateAndAdjustData(updatedData, exhibition);

        return await this.updateById(id, validatedData);
    }

    /**
     * 데이터 일관성을 검증하고 자동으로 조정합니다.
     * @param {Object} data - 검증할 데이터
     * @param {Object} existingData - 기존 데이터 (업데이트 시)
     * @returns {Object} 검증 및 조정된 데이터
     */
    validateAndAdjustData(data, existingData = null) {
        const adjustedData = { ...data };
        const currentData = existingData ? { ...existingData.dataValues || existingData } : {};
        const finalData = { ...currentData, ...adjustedData };

        // status 필드가 있는 경우 관련 boolean 필드들을 자동 조정
        if ('status' in adjustedData) {
            const status = adjustedData.status;

            switch (status) {
                case 'planning':
                    adjustedData.isSubmissionOpen = false;
                    break;
                case 'submission_open':
                    adjustedData.isSubmissionOpen = true;
                    break;
                case 'review':
                case 'active':
                case 'completed':
                    adjustedData.isSubmissionOpen = false;
                    break;
            }

            logger.info(`전시회 데이터 일관성 조정: status=${status}, isSubmissionOpen=${adjustedData.isSubmissionOpen}`);
        }

        // isSubmissionOpen 필드가 변경되는 경우 status와의 일관성 검증
        if ('isSubmissionOpen' in adjustedData && !('status' in adjustedData)) {
            const isSubmissionOpen = adjustedData.isSubmissionOpen;
            const currentStatus = finalData.status || 'planning';

            // 일관성 검증 및 경고
            if (isSubmissionOpen && !['planning', 'submission_open'].includes(currentStatus)) {
                logger.warn(`데이터 일관성 경고: isSubmissionOpen=true이지만 status=${currentStatus}입니다. 상태를 확인해주세요.`);
            } else if (!isSubmissionOpen && currentStatus === 'submission_open') {
                logger.warn('데이터 일관성 경고: isSubmissionOpen=false이지만 status=submission_open입니다. 상태를 확인해주세요.');
            }
        }

        return adjustedData;
    }

    /**
     * 데이터 일관성을 검증합니다.
     * @param {string} exhibitionId - 전시회 ID (선택적)
     * @returns {Promise<Array>} 일관성 문제 목록
     */
    async validateDataConsistency(exhibitionId = null) {
        const issues = [];

        try {
            const where = exhibitionId ? { id: exhibitionId } : {};
            const exhibitions = await this.findAll({ where, pagination: false });

            for (const exhibition of exhibitions.items || [exhibition]) {
                const exhibitionIssues = this.checkExhibitionConsistency(exhibition);
                if (exhibitionIssues.length > 0) {
                    issues.push({
                        exhibitionId: exhibition.id,
                        title: exhibition.title,
                        issues: exhibitionIssues
                    });
                }
            }
        } catch (error) {
            logger.error('데이터 일관성 검증 중 오류:', error);
            throw new ExhibitionError('데이터 일관성 검증 중 오류가 발생했습니다.', error);
        }

        return issues;
    }

    /**
     * 개별 전시회의 일관성을 검증합니다.
     * @param {Object} exhibition - 전시회 객체
     * @returns {Array} 일관성 문제 목록
     */
    checkExhibitionConsistency(exhibition) {
        const issues = [];
        const { status, isSubmissionOpen } = exhibition;

        // status와 isSubmissionOpen 간의 일관성 검증
        if (status === 'submission_open' && !isSubmissionOpen) {
            issues.push({
                type: 'status_submission_mismatch',
                message: 'status가 submission_open이지만 isSubmissionOpen이 false입니다.',
                expected: { isSubmissionOpen: true },
                actual: { status, isSubmissionOpen }
            });
        }

        if (isSubmissionOpen && !['planning', 'submission_open'].includes(status)) {
            issues.push({
                type: 'submission_status_mismatch',
                message: 'isSubmissionOpen이 true이지만 status가 작품 제출을 허용하지 않는 상태입니다.',
                expected: { status: 'submission_open' },
                actual: { status, isSubmissionOpen }
            });
        }

        if (!isSubmissionOpen && status === 'submission_open') {
            issues.push({
                type: 'submission_closed_but_status_open',
                message: 'status가 submission_open이지만 isSubmissionOpen이 false입니다.',
                expected: { isSubmissionOpen: true },
                actual: { status, isSubmissionOpen }
            });
        }

        return issues;
    }

    /**
     * 데이터 일관성 문제를 자동으로 수정합니다.
     * @param {string} exhibitionId - 전시회 ID (선택적)
     * @param {Object} options - 수정 옵션
     * @returns {Promise<Object>} 수정 결과
     */
    async fixDataConsistency(exhibitionId = null, options = {}) {
        const { dryRun = false, prioritizeStatus = true } = options;
        const fixes = [];

        try {
            const issues = await this.validateDataConsistency(exhibitionId);

            for (const exhibitionIssue of issues) {
                const { exhibitionId: id, issues: problemList } = exhibitionIssue;
                const exhibition = await this.findById(id);

                if (!exhibition) continue;

                const fixData = {};

                for (const issue of problemList) {
                    if (issue.type === 'status_submission_mismatch') {
                        if (prioritizeStatus) {
                            // status를 우선시하여 isSubmissionOpen 조정
                            fixData.isSubmissionOpen = true;
                        } else {
                            // isSubmissionOpen을 우선시하여 status 조정
                            fixData.status = 'planning';
                        }
                    } else if (issue.type === 'submission_status_mismatch') {
                        if (prioritizeStatus) {
                            fixData.isSubmissionOpen = false;
                        } else {
                            fixData.status = 'submission_open';
                        }
                    } else if (issue.type === 'submission_closed_but_status_open') {
                        if (prioritizeStatus) {
                            fixData.isSubmissionOpen = true;
                        } else {
                            fixData.status = 'planning';
                        }
                    }
                }

                if (Object.keys(fixData).length > 0) {
                    fixes.push({
                        exhibitionId: id,
                        title: exhibition.title,
                        changes: fixData,
                        applied: false
                    });

                    if (!dryRun) {
                        await this.updateById(id, fixData);
                        fixes[fixes.length - 1].applied = true;
                        logger.info(`전시회 데이터 일관성 수정 완료: ${id}`, fixData);
                    }
                }
            }
        } catch (error) {
            logger.error('데이터 일관성 수정 중 오류:', error);
            throw new ExhibitionError('데이터 일관성 수정 중 오류가 발생했습니다.', error);
        }

        return {
            totalIssues: fixes.length,
            fixes,
            dryRun
        };
    }

    /**
     * 전시회를 삭제합니다.(hard delete)
     */
    async deleteExhibition(id) {
        try {
            const result = await this.deleteById(id);
            if (!result) {
                throw new ExhibitionNotFoundError('전시회를 찾을 수 없습니다.');
            }
            return true;
        } catch (error) {
            throw new ExhibitionError('전시회 삭제 중 오류가 발생했습니다.', error);
        }
    }

    /**
     * 현재 진행 중인 전시회를 조회합니다.
     */
    async findActiveExhibitions() {
        return await this.findAll({
            where: { status: 'active' },
            pagination: false
        });
    }

    /**
     * 출품 가능한 전시회 목록을 조회합니다.
     */
    async findSubmittableExhibitions(artworkId = null) {
        const exhibitions = await this.findAll({
            where: {
                status: 'submission_open',
                is_submission_open: true
            },
            pagination: false
        });

        if (artworkId) {
            // 이미 출품된 전시회 조회
            const submittedExhibitions = await ArtworkExhibitionRelationship.findAll({
                where: { artwork_id: artworkId }
            });

            const submittedExhibitionIds = submittedExhibitions.map(exhibition => exhibition.exhibitionId);

            // 출품 가능한 전시회에서 이미 출품된 전시회 제외
            return exhibitions.items.filter(exhibition => !submittedExhibitionIds.includes(exhibition.id));
        }

        return exhibitions.items;
    }

    async findFeaturedExhibitions(limit = 10) {
        return await this.findAll({
            where: { is_featured: true },
            limit: parseInt(limit, 10),
            pagination: false
        });
    }
}

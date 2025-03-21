export default class ExhibitionUseCase {
    constructor(exhibitionService, artworkService) {
        this.exhibitionService = exhibitionService;
        this.artworkService = artworkService;
    }

    async findByCategory(category) {
        return await this.exhibitionService.findByCategory(category);
    }

    async findAll() {
        return await this.exhibitionService.findAll();
    }

    async findById(id) {
        return await this.exhibitionService.findById(id);
    }

    async create(exhibitionData) {
        return await this.exhibitionService.create(exhibitionData);
    }

    async update(id, exhibitionData) {
        return await this.exhibitionService.update(id, exhibitionData);
    }

    async delete(id) {
        return await this.exhibitionService.delete(id);
    }

    /**
     * 전시회 목록을 조회합니다.
     * @param {Object} params - 조회 파라미터
     * @param {number} params.page - 페이지 번호
     * @param {number} params.limit - 페이지당 항목 수
     * @param {string} params.category - 카테고리
     */
    async getExhibitionList({ page = 1, limit = 10, category = null } = {}) {
        const offset = (page - 1) * limit;
        let exhibitions;

        if (category) {
            exhibitions = await this.exhibitionService.findByCategory(category);
        } else {
            exhibitions = await this.exhibitionService.findAll();
        }

        const totalCount = exhibitions.length;
        const totalPages = Math.ceil(totalCount / limit);

        // 페이지네이션 처리
        const startIndex = offset;
        const endIndex = startIndex + limit;
        const paginatedExhibitions = exhibitions.slice(startIndex, endIndex);

        return {
            exhibitions: paginatedExhibitions,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    /**
     * 전시회 상세 정보를 조회합니다.
     * @param {number} exhibitionId - 전시회 ID
     */
    async getExhibitionDetail(exhibitionId) {
        const exhibition = await this.exhibitionService.findById(exhibitionId);
        if (!exhibition) {
            throw new Error('전시회를 찾을 수 없습니다.');
        }

        return {
            exhibition
        };
    }

    /**
     * 전시회를 삭제합니다.
     * @param {number} exhibitionId - 전시회 ID
     */
    async deleteExhibition(exhibitionId) {
        const exhibition = await this.exhibitionService.findById(exhibitionId);
        if (!exhibition) {
            throw new Error('전시회를 찾을 수 없습니다.');
        }

        return this.exhibitionService.delete(exhibitionId);
    }
}

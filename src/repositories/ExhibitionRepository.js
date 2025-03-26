import exhibition from '../config/data/exhibition.js';

export default class ExhibitionRepository {
    constructor() {
        this.exhibitions = exhibition;
    }

    /**
     * 모든 전시회를 조회합니다.
     */
    async findExhibitions({ page = 1, limit = 10, search } = {}) {
        let filteredExhibitions = [...this.exhibitions];

        if (search) {
            filteredExhibitions = filteredExhibitions.filter(exhibition =>
                exhibition.title.includes(search) ||
                exhibition.description.includes(search)
            );
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const total = filteredExhibitions.length;

        return {
            items: filteredExhibitions.slice(start, end),
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * ID로 전시회를 조회합니다.
     */
    async findExhibitionById(id) {
        return this.exhibitions.find(exhibition => exhibition.id === id);
    }

    /**
     * 새로운 전시회를 생성합니다.
     */
    async createExhibition(exhibitionData) {
        const newExhibition = {
            id: (Math.max(...this.exhibitions.map(e => e.id)) + 1).toString(),
            ...exhibitionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.exhibitions.push(newExhibition);
        return newExhibition;
    }

    /**
     * 전시회 정보를 수정합니다.
     */
    async updateExhibition(id, exhibitionData) {
        const index = this.exhibitions.findIndex(exhibition => exhibition.id === id);
        if (index === -1) return null;

        this.exhibitions[index] = {
            ...this.exhibitions[index],
            ...exhibitionData,
            updated_at: new Date().toISOString()
        };
        return this.exhibitions[index];
    }

    /**
     * 전시회를 삭제합니다.
     */
    async deleteExhibition(id) {
        const index = this.exhibitions.findIndex(exhibition => exhibition.id === id);
        if (index === -1) return false;

        this.exhibitions.splice(index, 1);
        return true;
    }

    /**
     * 현재 진행 중인 전시회를 조회합니다.
     */
    async findActiveExhibitions() {
        const now = new Date();
        return this.exhibitions.filter(exhibition => {
            const startDate = new Date(exhibition.start_date);
            const endDate = new Date(exhibition.end_date);
            return startDate <= now && now <= endDate;
        });
    }
}

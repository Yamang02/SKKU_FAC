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
        // id가 null, undefined 또는 빈 문자열인 경우
        if (id === null || id === undefined || id === '') {
            return null;
        }

        const numId = parseInt(id, 10);

        if (isNaN(numId)) {
            return null;
        }

        const found = this.exhibitions.find(exhibition => exhibition.id === numId);
        return found;
    }

    /**
     * 새로운 전시회를 생성합니다.
     */
    async createExhibition(exhibitionData) {
        // 현재 가장 큰 ID 찾기
        const maxId = this.exhibitions.reduce((max, exhibition) => {
            const currentId = parseInt(exhibition.id, 10);
            return isNaN(currentId) ? max : Math.max(max, currentId);
        }, 0);

        // 새로운 ID 생성 (현재 최대 ID + 1)
        const newId = maxId + 1;  // number 타입으로 유지

        const newExhibition = {
            id: newId,  // number 타입으로 저장
            ...exhibitionData,
            isSubmissionOpen: exhibitionData.isSubmissionOpen === 'true' || exhibitionData.isSubmissionOpen === true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('생성할 전시회:', newExhibition);
        this.exhibitions.push(newExhibition);
        return newExhibition;
    }

    /**
     * 전시회 정보를 수정합니다.
     */
    async updateExhibition(id, exhibitionData) {
        const numId = parseInt(id, 10);
        if (isNaN(numId)) return null;

        const index = this.exhibitions.findIndex(exhibition => exhibition.id === numId);
        if (index === -1) return null;

        this.exhibitions[index] = {
            ...this.exhibitions[index],
            ...exhibitionData,
            id: numId,  // ID는 변경하지 않음
            isSubmissionOpen: exhibitionData.isSubmissionOpen === 'true' || exhibitionData.isSubmissionOpen === true,
            updatedAt: new Date().toISOString()
        };
        return this.exhibitions[index];
    }

    /**
     * 전시회를 삭제합니다.
     */
    async deleteExhibition(id) {
        const numId = parseInt(id, 10);
        if (isNaN(numId)) return false;

        const index = this.exhibitions.findIndex(exhibition => exhibition.id === numId);
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
            const startDate = new Date(exhibition.startDate);
            const endDate = new Date(exhibition.endDate);
            return startDate <= now && now <= endDate;
        });
    }
}

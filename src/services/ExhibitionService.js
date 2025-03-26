import ExhibitionRepository from '../repositories/ExhibitionRepository.js';

export default class ExhibitionService {
    constructor() {
        this.exhibitionRepository = new ExhibitionRepository();
    }

    async getExhibitionList(page, limit, searchType, keyword) {
        return await this.exhibitionRepository.findAll({
            page,
            limit,
            searchType,
            keyword
        });
    }

    async getExhibitionDetail(exhibitionId) {
        const exhibition = await this.exhibitionRepository.findById(exhibitionId);
        if (!exhibition) {
            throw new Error('전시를 찾을 수 없습니다.');
        }
        return exhibition;
    }

    async createExhibition(exhibitionData) {
        return await this.exhibitionRepository.create(exhibitionData);
    }

    async updateExhibition(exhibitionId, exhibitionData) {
        const exhibition = await this.exhibitionRepository.findById(exhibitionId);
        if (!exhibition) {
            throw new Error('전시를 찾을 수 없습니다.');
        }
        await this.exhibitionRepository.update(exhibitionId, exhibitionData);
    }

    async deleteExhibition(exhibitionId) {
        const exhibition = await this.exhibitionRepository.findById(exhibitionId);
        if (!exhibition) {
            throw new Error('전시를 찾을 수 없습니다.');
        }
        await this.exhibitionRepository.delete(exhibitionId);
    }

    async getCurrentExhibitions() {
        return await this.exhibitionRepository.getCurrentExhibitions();
    }
}

import { Exhibition } from '../model/entity/EntitityIndex.js';
import { Op } from 'sequelize';

export default class ExhibitionRepository {
    constructor() {
    }

    /**
     * 모든 전시회를 조회합니다.
     */
    async findExhibitions({ page = 1, limit = 10, search } = {}) {
        const offset = (page - 1) * limit; // 페이지네이션을 위한 오프셋 계산

        const where = {};
        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Exhibition.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']] // 정렬 기준
        });

        return {
            items: rows,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit)
        };
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

        await exhibition.update({
            ...exhibitionData,
            isSubmissionOpen: exhibitionData.isSubmissionOpen === 'true' || exhibitionData.isSubmissionOpen === true,
            updatedAt: new Date()
        });

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
    async findSubmittableExhibitions() {
        return await Exhibition.findAll({
            where: { isSubmissionOpen: true }
        });
    }
}

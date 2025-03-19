import Exhibition from '../../domain/exhibition/entity/Exhibition.js';
import ExhibitionRepository from '../../domain/exhibition/repository/ExhibitionRepository.js';
import exhibitionsData from '../data/exhibition.js';

/**
 * 전시회 리포지토리 구현체
 * @implements {ExhibitionRepository}
 */
class ExhibitionRepositoryImpl extends ExhibitionRepository {
    /**
     * 모든 전시회 목록을 조회합니다.
     * @returns {Promise<Array>} 전시회 목록
     */
    async findAll() {
        return exhibitionsData;
    }

    /**
     * ID로 전시회를 조회합니다.
     * @param {number} id - 전시회 ID
     * @returns {Promise<Object|null>} 전시회 또는 null
     */
    async findById(id) {
        return exhibitionsData.find(exhibition => exhibition.id === parseInt(id)) || null;
    }

    /**
     * @inheritdoc
     */
    async findByCode(code) {
        const data = exhibitionsData.find(ex => ex.code === code);
        return data ? new Exhibition(data) : null;
    }

    /**
     * @inheritdoc
     */
    async findByCategory(category) {
        const filteredData = exhibitionsData.filter(ex => ex.category === category);
        return filteredData.map(data => new Exhibition(data));
    }

    /**
     * @inheritdoc
     */
    async create(exhibition) {
        // TODO: 실제 데이터베이스 연동 시 구현
        const newId = Math.max(...exhibitionsData.map(ex => ex.id)) + 1;
        const newExhibition = { ...exhibition, id: newId };
        exhibitionsData.push(newExhibition);
        return new Exhibition(newExhibition);
    }

    /**
     * @inheritdoc
     */
    async update(id, exhibition) {
        // TODO: 실제 데이터베이스 연동 시 구현
        const index = exhibitionsData.findIndex(ex => ex.id === parseInt(id));
        if (index === -1) return null;

        exhibitionsData[index] = { ...exhibitionsData[index], ...exhibition };
        return new Exhibition(exhibitionsData[index]);
    }

    /**
     * @inheritdoc
     */
    async delete(id) {
        // TODO: 실제 데이터베이스 연동 시 구현
        const index = exhibitionsData.findIndex(ex => ex.id === parseInt(id));
        if (index === -1) return false;

        exhibitionsData.splice(index, 1);
        return true;
    }
}

export default ExhibitionRepositoryImpl;

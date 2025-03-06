const Exhibition = require('../entity/Exhibition');
const ExhibitionDTO = require('../dto/ExhibitionDTO');
const exhibitionsData = require('../../../infrastructure/data/exhibitions');

/**
 * 전시회 관련 도메인 서비스
 */
class ExhibitionService {
    /**
     * 모든 전시회 목록을 가져옵니다.
     * @returns {Array<ExhibitionDTO>} 전시회 DTO 목록
     */
    getAllExhibitions() {
        const exhibitions = exhibitionsData.map(exhibition => new Exhibition(exhibition));
        return exhibitions.map(exhibition => new ExhibitionDTO(exhibition));
    }

    /**
     * ID로 전시회를 찾습니다.
     * @param {number} id 전시회 ID
     * @returns {Exhibition|null} 찾은 전시회 엔티티 또는 null
     */
    getExhibitionById(id) {
        const exhibition = exhibitionsData.find(ex => ex.id === parseInt(id));
        return exhibition ? new Exhibition(exhibition) : null;
    }

    /**
     * 코드로 전시회를 찾습니다.
     * @param {string} code 전시회 코드
     * @returns {Exhibition|null} 찾은 전시회 엔티티 또는 null
     */
    getExhibitionByCode(code) {
        const exhibition = exhibitionsData.find(ex => ex.code === code);
        return exhibition ? new Exhibition(exhibition) : null;
    }

    /**
     * ID로 전시회 DTO를 찾습니다.
     * @param {number} id 전시회 ID
     * @returns {ExhibitionDTO|null} 찾은 전시회 DTO 또는 null
     */
    getExhibitionDTOById(id) {
        const exhibition = this.getExhibitionById(id);
        return exhibition ? new ExhibitionDTO(exhibition) : null;
    }

    /**
     * 코드로 전시회 DTO를 찾습니다.
     * @param {string} code 전시회 코드
     * @returns {ExhibitionDTO|null} 찾은 전시회 DTO 또는 null
     */
    getExhibitionDTOByCode(code) {
        const exhibition = this.getExhibitionByCode(code);
        return exhibition ? new ExhibitionDTO(exhibition) : null;
    }
}

module.exports = new ExhibitionService(); 
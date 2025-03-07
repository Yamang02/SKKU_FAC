import Exhibition from '../entity/Exhibition.js';
import ExhibitionDTO from '../dto/ExhibitionDTO.js';
import exhibitionsData from '../../../infrastructure/data/exhibitions.js';

/**
 * 모든 전시회 목록을 가져옵니다.
 * @returns {Array<ExhibitionDTO>} 전시회 DTO 목록
 */
export function getAllExhibitions() {
    const exhibitions = exhibitionsData.map(exhibition => new Exhibition(exhibition));
    return exhibitions.map(exhibition => new ExhibitionDTO(exhibition));
}

/**
 * ID로 전시회를 찾습니다.
 * @param {number} id 전시회 ID
 * @returns {Exhibition|null} 찾은 전시회 엔티티 또는 null
 */
export function getExhibitionById(id) {
    const exhibition = exhibitionsData.find(ex => ex.id === parseInt(id));
    return exhibition ? new Exhibition(exhibition) : null;
}

/**
 * 코드로 전시회를 찾습니다.
 * @param {string} code 전시회 코드
 * @returns {Exhibition|null} 찾은 전시회 엔티티 또는 null
 */
export function getExhibitionByCode(code) {
    const exhibition = exhibitionsData.find(ex => ex.code === code);
    return exhibition ? new Exhibition(exhibition) : null;
}

/**
 * ID로 전시회 DTO를 찾습니다.
 * @param {number} id 전시회 ID
 * @returns {ExhibitionDTO|null} 찾은 전시회 DTO 또는 null
 */
export function getExhibitionDTOById(id) {
    const exhibition = getExhibitionById(id);
    return exhibition ? new ExhibitionDTO(exhibition) : null;
}

/**
 * 코드로 전시회 DTO를 찾습니다.
 * @param {string} code 전시회 코드
 * @returns {ExhibitionDTO|null} 찾은 전시회 DTO 또는 null
 */
export function getExhibitionDTOByCode(code) {
    const exhibition = getExhibitionByCode(code);
    return exhibition ? new ExhibitionDTO(exhibition) : null;
}

/**
 * 카테고리별 전시회 목록을 가져옵니다.
 * @param {string} category 카테고리
 * @returns {Array<ExhibitionDTO>} 전시회 DTO 목록
 */
export function getExhibitionsByCategory(category) {
    const exhibitions = exhibitionsData
        .filter(ex => ex.category === category)
        .map(ex => new Exhibition(ex));
    
    return exhibitions.map(exhibition => new ExhibitionDTO(exhibition));
}
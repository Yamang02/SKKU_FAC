import ExhibitionSimpleDTO from './ExhibitionSimpleDTO.js';

/**
 * 단순 전시회 목록을 위한 DTO
 * 페이지네이션 정보 없이 단순 목록만 포함합니다.
 */
export default class ExhibitionSimpleListDTO {
    constructor(exhibitions = []) {
        this.items = exhibitions.map(exhibition => {
            // 이미 ExhibitionSimpleDTO인 경우 그대로 사용
            if (exhibition instanceof ExhibitionSimpleDTO) {
                return exhibition;
            }
            // 아닌 경우 새로운 DTO 생성
            return new ExhibitionSimpleDTO(exhibition);
        });
    }

    toJSON() {
        return this.items.map(item => item.toJSON());
    }
}

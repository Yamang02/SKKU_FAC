import ExhibitionSimpleDTO from './ExhibitionSimpleDto.js';

/**
 * 전시회 목록을 위한 DTO
 */
export default class ExhibitionListDTO {
    constructor(data = {}) {
        this.items = (data.items || []).map(exhibition => {
            // 이미 ExhibitionSimpleDTO인 경우 그대로 사용
            if (exhibition instanceof ExhibitionSimpleDTO) {
                return exhibition;
            }
            // 아닌 경우 새로운 DTO 생성
            return new ExhibitionSimpleDTO(exhibition);
        });
        this.total = data.total || 0;
        this.page = data.page;
    }

    toJSON() {
        return {
            items: this.items.map(item => item.toJSON()),
            total: this.total,
            page: this.page
        };
    }
}

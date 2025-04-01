import ArtworkSimpleDTO from './ArtworkSimpleDTO.js';

/**
 * 작품 목록을 위한 DTO
 * 페이지네이션 정보를 포함합니다.
 */
export default class ArtworkListDTO {
    constructor(data = {}) {
        this.items = (data.items || []).map(artwork => new ArtworkSimpleDTO(artwork));
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

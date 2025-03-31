import ArtworkBaseDto from './ArtworkBaseDto.js';

/**
 * 작품 목록을 위한 DTO
 * 페이지네이션 정보를 포함합니다.
 */
export default class ArtworkListDto extends ArtworkBaseDto {
    constructor(data = {}) {
        super(data);
        this.total = data.total || 0;
        this.items = data.items || [];
        this.page = data.page || 1;
        this.limit = data.limit || 12;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            total: this.total,
            items: this.items,
            page: this.page,
            limit: this.limit
        };
    }
}

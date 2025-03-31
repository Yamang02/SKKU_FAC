import ArtworkBaseDto from './ArtworkBaseDto.js';

/**
 * 작품 목록 응답을 위한 DTO
 */
export default class ArtworkListResponseDto extends ArtworkBaseDto {
    constructor(data = {}) {
        super(data);
        this.total = data.total || 0;
        this.items = data.items || [];
        this.page = data.page || 1;
        this.limit = data.limit || 12;
        this.totalPages = Math.ceil(this.total / this.limit);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            total: this.total,
            items: this.items,
            page: this.page,
            limit: this.limit,
            totalPages: this.totalPages
        };
    }
}

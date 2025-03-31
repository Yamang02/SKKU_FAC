import ArtworkBaseDto from './ArtworkBaseDto.js';

/**
 * 작품의 간단한 정보를 위한 DTO
 * 카드나 모달에서 사용됩니다.
 */
export default class ArtworkSimpleDto extends ArtworkBaseDto {
    constructor(data = {}) {
        super(data);
        this.type = data.type || 'default';
    }

    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            type: this.type
        };
    }
}

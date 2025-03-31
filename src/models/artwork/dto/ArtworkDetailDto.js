import ArtworkBaseDto from './ArtworkBaseDto.js';

/**
 * 작품 상세 정보를 위한 DTO
 * 연관 작품 정보를 포함합니다.
 */
export default class ArtworkDetailDto extends ArtworkBaseDto {
    constructor(data = {}) {
        super(data);
        this.relatedArtworks = data.relatedArtworks || [];
        this.exhibition = data.exhibition || null;
        this.artist = data.artist || null;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            relatedArtworks: this.relatedArtworks,
            exhibition: this.exhibition,
            artist: this.artist
        };
    }
}

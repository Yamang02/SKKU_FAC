import ArtworkBaseDto from './ArtworkBaseDto.js';

/**
 * 작품 상세 정보 응답을 위한 DTO
 */
export default class ArtworkDetailResponseDto extends ArtworkBaseDto {
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

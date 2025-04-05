/**
 * 작품과 관련된 엔티티들의 관계를 나타내는 클래스
 */
export class ArtworkRelations {
    constructor() {
        this.image = null;
        this.artist = null;
        this.exhibition = null;
    }

    /**
     * 이미지 정보를 설정합니다.
     */
    setImage(image) {
        this.image = image;
        return this;
    }

    /**
     * 작가 정보를 설정합니다.
     */
    setArtist(artist) {
        this.artist = artist;
        return this;
    }

    /**
     * 전시회 정보를 설정합니다.
     */
    setExhibition(exhibition) {
        this.exhibition = exhibition;
        return this;
    }
}

export default ArtworkRelations;

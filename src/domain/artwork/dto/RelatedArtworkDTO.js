/**
 * 관련 작품 데이터 전송 객체 (DTO)
 * 프레젠테이션 레이어로 전달되는 데이터 구조
 */
class RelatedArtworkDTO {
    constructor(artwork) {
        this.id = artwork.id;
        this.title = artwork.title;
        this.artist = artwork.artist;
        this.image = artwork.image;
    }
}

export default RelatedArtworkDTO; 
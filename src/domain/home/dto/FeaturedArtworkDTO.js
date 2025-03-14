/**
 * 메인 페이지 추천 작품 데이터 전송 객체 (DTO)
 * 프레젠테이션 레이어로 전달되는 데이터 구조
 */
class FeaturedArtworkDto {
    constructor(artwork) {
        this.id = artwork.id;
        this.title = artwork.title;
        this.artist = artwork.artist;
        this.department = artwork.department;
        this.image = artwork.image;
    }
}

export default FeaturedArtworkDto;

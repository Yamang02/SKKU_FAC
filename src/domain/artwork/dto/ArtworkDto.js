/**
 * 작품 DTO 클래스
 * 작품 데이터를 전송하기 위한 객체입니다.
 */
class ArtworkDto {
    constructor(artwork) {
        this.id = artwork.id;
        this.title = artwork.title;
        this.description = artwork.description;
        this.artist = artwork.artist;
        this.department = artwork.department;
        this.year = artwork.year;
        this.featured = artwork.featured;
        this.exhibition_id = artwork.exhibition_id;
        this.images = artwork.images;
        this.created_at = artwork.created_at;
        this.updated_at = artwork.updated_at;
    }
}

export default ArtworkDto;

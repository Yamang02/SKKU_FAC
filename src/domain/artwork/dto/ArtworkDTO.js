/**
 * 작품 데이터 전송 객체 (DTO)
 * 프레젠테이션 레이어로 전달되는 데이터 구조
 */
class ArtworkDTO {
    constructor(artwork, exhibition) {
        this.id = artwork.id;
        this.title = artwork.title;
        this.artist = artwork.artist;
        this.department = artwork.department;
        this.year = artwork.year;
        this.medium = artwork.medium;
        this.size = artwork.size;
        this.description = artwork.description;
        this.exhibition = exhibition ? exhibition.title + (exhibition.subtitle ? ': ' + exhibition.subtitle : '') : '';
        this.exhibitionId = artwork.exhibitionId;
        this.image = artwork.image;
    }
}

module.exports = ArtworkDTO; 
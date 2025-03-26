/**
 * 작품 DTO 클래스
 * 작품 데이터를 전송하기 위한 객체입니다.
 */
class ArtworkDto {
    constructor(artwork, exhibition = null) {
        this.id = artwork.id;
        this.title = artwork.title;
        this.artist = artwork.artist;
        this.description = artwork.description;
        this.imageUrl = artwork.imageUrl;
        this.year = artwork.year;
        this.department = artwork.department;
        this.isFeatured = artwork.isFeatured;
        this.createdAt = artwork.createdAt;
        this.updatedAt = artwork.updatedAt;
        this.exhibitionId = artwork.exhibitionId;

        // 전시회 정보가 있는 경우에만 exhibition 속성 설정
        if (exhibition) {
            this.exhibition = {
                id: exhibition.id,
                title: exhibition.title,
                exhibitionType: exhibition.exhibitionType,
                startDate: exhibition.startDate,
                endDate: exhibition.endDate,
                description: exhibition.description,
                imageUrl: exhibition.imageUrl
            };
        } else {
            // 전시회 정보가 없는 경우 기본값 설정
            this.exhibition = {
                id: null,
                title: '전시회 없음',
                exhibitionType: 'none',
                startDate: null,
                endDate: null,
                description: '',
                imageUrl: ''
            };
        }
    }
}

export default ArtworkDto;

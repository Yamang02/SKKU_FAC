
/**
 * 간단한 작품 정보를 위한 DTO
 */
export default class ArtworkSimpleDTO {
    constructor(artworkWithRelations, type = 'card') {
        this.id = artworkWithRelations.id; // 작품 ID
        this.title = artworkWithRelations.title; // 작품명
        this.slug = artworkWithRelations.slug; // 작품 슬러그
        this.imageUrl = artworkWithRelations.imageUrl ? artworkWithRelations.imageUrl : null; // 이미지 URL
        this.userId = artworkWithRelations.userId; // 작가 ID
        this.artistName = artworkWithRelations.userAccount?.name || ''; // 작가 이름 (UserAccount에서 가져옴)
        this.exhibitionId = artworkWithRelations.exhibitionId; // 전시회 ID
        this.exhibitionTitle = artworkWithRelations.exhibition?.title || ''; // 전시회 제목 (Exhibition에서 가져옴)
        this.createdAt = artworkWithRelations.createdAt; // 생성일
        this.type = type; // DTO 타입 (예: 'card')
    }
}

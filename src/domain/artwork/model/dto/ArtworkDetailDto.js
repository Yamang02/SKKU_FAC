/**
 * 작품 상세 정보를 위한 DTO
 */
export default class ArtworkDetailDto {
    constructor(data = {}) {
        this.id = data.id || null; // 작품 고유 ID
        this.title = data.title || ''; // 작품명
        this.medium = data.medium || ''; // 재료
        this.size = data.size || ''; // 크기
        this.description = data.description || ''; // 작품 설명
        this.imageUrl = data.imageUrl || ''; // 이미지 URL
        this.isFeatured = data.isFeatured || false; // 주요 작품 여부
        this.userId = data.userId || null; // 작품 작성자 ID
    }
}

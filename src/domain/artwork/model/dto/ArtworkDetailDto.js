import CloudinaryUrlOptimizer from '#common/utils/CloudinaryUrlOptimizer.js';

/**
 * 작품 상세 정보를 위한 DTO
 */
export default class ArtworkDetailDto {
    constructor(data = {}) {
        this.id = data.id || null; // 작품 고유 ID
        this.title = data.title || ''; // 작품명
        this.slug = data.slug || ''; // 작품 슬러그
        this.medium = data.medium || ''; // 재료
        this.size = data.size || ''; // 크기
        this.year = data.year || ''; // 작품 연도
        this.description = data.description || ''; // 작품 설명
        this.imageUrl = CloudinaryUrlOptimizer.optimizeImageUrl(data.imageUrl) || ''; // 이미지 URL
        this.isFeatured = data.isFeatured || false; // 주요 작품 여부
        this.userId = data.userId || null; // 작품 작성자 ID
        this.artistName = data.artistName || ''; // 작가 이름
        this.artistAffiliation = data.artistAffiliation || ''; // 작가 소속
        this.RepresentativeExhibitionexhibitionId = data.RepresentativeExhibitionexhibitionId || null;
        this.exhibitions = data.exhibitions || []; // 전시회 정보
        this.relatedArtworks = data.relatedArtworks || []; // 관련 작품 정보
        this.submittableExhibitions = data.submittableExhibitions || []; // 출품 가능 전시회 정보
    }
}

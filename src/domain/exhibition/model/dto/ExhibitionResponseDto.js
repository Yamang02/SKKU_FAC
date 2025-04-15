import ExhibitionSimpleDto from './ExhibitionSimpleDto.js';

/**
 * 전시회 응답 DTO
 * 전시회 상세 정보 조회 시 사용되는 데이터 전송 객체
 */
export default class ExhibitionResponseDto {
    constructor(data = {}) {
        // 단일 전시회 정보
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.startDate = data.startDate || '';
        this.endDate = data.endDate || '';
        this.exhibitionType = data.exhibitionType || '';
        this.imageUrl = data.imageUrl || null;
        this.imagePublicId = data.imagePublicId || null;
        this.location = data.location || '';
        this.artists = data.artists || [];
        this.artworkCount = data.artworkCount || 0;
        this.isActive = data.isActive || false;
        this.isSubmissionOpen = data.isSubmissionOpen || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();

        // 목록 정보 (선택적)
        this.items = data.items ? data.items.map(item => new ExhibitionSimpleDto(item)) : null;
        this.total = data.total || null;
        this.page = data.page || null;
    }

    /**
     * DTO를 JSON 형태로 변환
     * @returns {Object} JSON 형태의 DTO 데이터
     */
    toJSON() {
        const result = {
            id: this.id,
            title: this.title,
            description: this.description,
            startDate: this.startDate,
            endDate: this.endDate,
            exhibitionType: this.exhibitionType,
            image: this.image,
            location: this.location,
            artists: this.artists,
            artworkCount: this.artworkCount,
            isActive: this.isActive,
            isSubmissionOpen: this.isSubmissionOpen,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };

        // 목록 정보가 있는 경우 추가
        if (this.items) {
            result.items = this.items.map(item => item.toJSON());
            result.total = this.total;
            result.page = this.page;
        }

        return result;
    }
}

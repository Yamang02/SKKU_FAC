/**
 * 전시회 목록 DTO
 * 전시회 목록 페이지에 필요한 정보를 포함합니다.
 */
export default class ExhibitionListDto {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.subtitle = data.subtitle || '';
        this.description = data.description || '';
        this.startDate = data.startDate || '';
        this.endDate = data.endDate || '';
        this.location = data.location || '';
        this.imageUrl = data.imageUrl || null;
        this.imagePublicId = data.imagePublicId || null;
        this.exhibitionType = data.exhibitionType || 'regular';
        this.artworkCount = data.artworkCount || 0;
        this.isActive = data.isActive || false;
        this.isSubmissionOpen = data.isSubmissionOpen || false;
        this.isFeatured = data.isFeatured || false;
    }

}

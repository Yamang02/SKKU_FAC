import CloudinaryUrlOptimizer from '../../../../../common/utils/CloudinaryUrlOptimizer.js';

/**
 * 관리자 페이지 전시회 상세 정보를 위한 DTO
 */
export default class ExhibitionManagementDto {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.startDate = data.startDate || '';
        this.endDate = data.endDate || '';
        this.location = data.location || '';
        this.imageUrl = CloudinaryUrlOptimizer.optimizeImageUrl(data.imageUrl) || '';
        this.imagePublicId = data.imagePublicId || '';
        this.exhibitionType = data.exhibitionType || 'regular';
        this.isSubmissionOpen = data.isSubmissionOpen === true;
        this.isFeatured = data.isFeatured === true;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    /**
     * 전시 유형에 따른 표시 이름을 반환합니다.
     */
    get exhibitionTypeDisplayName() {
        const typeMap = {
            'regular': '정기',
            'special': '특별'
        };
        return typeMap[this.exhibitionType] || '기타';
    }

    /**
     * 출품 가능 여부에 따른 표시 이름을 반환합니다.
     */
    get submissionStatusDisplayName() {
        return this.isSubmissionOpen ? '출품 가능' : '출품 불가능';
    }

    /**
     * 주요 전시회 여부에 따른 표시 이름을 반환합니다.
     */
    get featuredDisplayName() {
        return this.isFeatured ? '주요 전시' : '일반 전시';
    }

    /**
     * 생성일을 포맷팅하여 반환합니다.
     */
    get createdAtFormatted() {
        return this.createdAt ? new Date(this.createdAt).toLocaleDateString() : '정보 없음';
    }

    /**
     * 수정일을 포맷팅하여 반환합니다.
     */
    get updatedAtFormatted() {
        return this.updatedAt ? new Date(this.updatedAt).toLocaleDateString() : '정보 없음';
    }
}

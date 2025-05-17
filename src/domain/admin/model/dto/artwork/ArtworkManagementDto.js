import CloudinaryUrlOptimizer from '../../../../../common/utils/CloudinaryUrlOptimizer.js';

/**
 * 관리자 페이지 작품 상세 정보를 위한 DTO
 */
export default class ArtworkManagementDto {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.slug = data.slug || '';
        this.medium = data.medium || '';
        this.size = data.size || '';
        this.year = data.year || '';
        this.description = data.description || '';
        this.imageUrl = CloudinaryUrlOptimizer.optimizeImageUrl(data.imageUrl) || '';
        this.imagePublicId = data.imagePublicId || '';
        this.isFeatured = data.isFeatured || false;
        this.userId = data.userId || null;
        this.status = data.status || 'APPROVED';
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;

        // 관계 데이터
        this.artistName = data.artistName || data.userAccount?.name || '';
        this.exhibitions = data.exhibitions || data.exhibitions || [];
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

    /**
     * 작품 상태에 따른 표시 이름을 반환합니다.
     */
    get statusDisplayName() {
        const statusMap = {
            'PENDING': '대기 중',
            'APPROVED': '승인됨',
            'BLOCKED': '차단됨',
            'DELETED': '삭제됨'
        };
        return statusMap[this.status] || '알 수 없음';
    }

    /**
     * 작품 상태에 따른 CSS 클래스를 반환합니다.
     */
    get statusClass() {
        const classMap = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'BLOCKED': 'status-blocked',
            'DELETED': 'status-deleted'
        };
        return classMap[this.status] || '';
    }
}

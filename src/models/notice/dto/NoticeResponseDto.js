/**
 * 공지사항 응답 데이터를 위한 DTO
 */
export default class NoticeResponseDTO {
    constructor(data = {}) {
        this.id = data.id;
        this.title = data.title;
        this.content = data.content;
        this.author = data.author;
        this.authorName = data.authorName;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.isImportant = data.isImportant || false;
        this.views = data.views || 0;
        this.status = data.status || 'active';
        this.images = data.images || [];
        this.prevId = data.prevId;
        this.nextId = data.nextId;
        this.prevTitle = data.prevTitle;
        this.nextTitle = data.nextTitle;
    }

    /**
     * 날짜를 포맷팅합니다.
     * @private
     */
    _formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * DTO를 일반 객체로 변환합니다.
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            author: this.authorName,
            authorId: this.author,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            formattedCreatedAt: this._formatDate(this.createdAt),
            formattedUpdatedAt: this._formatDate(this.updatedAt),
            isImportant: this.isImportant,
            views: this.views,
            status: this.status,
            images: this.images,
            prevId: this.prevId,
            nextId: this.nextId,
            prevTitle: this.prevTitle,
            nextTitle: this.nextTitle
        };
    }

    /**
     * 목록 표시용 간단한 정보만 반환합니다.
     */
    toListItem() {
        return {
            id: this.id,
            title: this.title,
            author: this.authorName,
            createdAt: this.createdAt,
            formattedCreatedAt: this._formatDate(this.createdAt),
            isImportant: this.isImportant,
            views: this.views,
            images: this.images
        };
    }
}

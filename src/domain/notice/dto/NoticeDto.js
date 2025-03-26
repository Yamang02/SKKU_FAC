/**
 * 공지사항 DTO 클래스
 * 공지사항 데이터를 전송하기 위한 객체입니다.
 */
class NoticeDto {
    constructor(notice) {
        this.id = notice.id;
        this.title = notice.title;
        this.content = notice.content;
        this.detailContent = notice.detailContent;
        this.author = notice.author;
        this.createdAt = this.formatDate(notice.created_at);
        this.updatedAt = notice.updated_at ? this.formatDate(notice.updated_at) : null;
        this.views = notice.views;
        this.isImportant = notice.is_important;
        this.images = notice.images || [];
        this.status = notice.status;
    }

    formatDate(date) {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;

        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return d.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static fromEntity(entity) {
        return new NoticeDto(entity);
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            detailContent: this.detailContent,
            author: this.author,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            views: this.views,
            isImportant: this.isImportant,
            images: this.images
        };
    }

    /**
     * 공지사항 목록을 위한 간단한 DTO로 변환합니다.
     */
    toListDTO() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            createdAt: this.createdAt,
            isImportant: this.isImportant,
            views: this.views,
            status: this.status
        };
    }
}

export default NoticeDto;

/**
 * 공지사항 엔티티 클래스
 */
class Notice {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.content = data.content;
        this.author = data.author;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.isImportant = data.isImportant || false;
        this.views = data.views || 0;
        this.status = data.status || 'active'; // active, inactive
    }

    /**
     * 공지사항을 수정합니다.
     * @param {Object} updateData - 수정할 데이터
     */
    update(updateData) {
        Object.assign(this, updateData);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * 조회수를 증가시킵니다.
     */
    incrementViews() {
        this.views += 1;
    }

    toDTO() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            author: this.author,
            createdAt: this.createdAt,
            views: this.views,
            isImportant: this.isImportant
        };
    }
}

export default Notice;

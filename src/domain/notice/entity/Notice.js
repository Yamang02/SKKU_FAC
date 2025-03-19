/**
 * Notice 엔티티 클래스
 * 공지사항의 핵심 비즈니스 규칙과 속성을 포함합니다.
 */
class Notice {
    constructor(id, title, content, author, createdAt, views = 0, isImportant = false) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.author = author;
        this.createdAt = createdAt;
        this.views = views;
        this.isImportant = isImportant;
    }

    incrementViews() {
        this.views += 1;
    }

    update(title, content, isImportant) {
        this.title = title;
        this.content = content;
        this.isImportant = isImportant;
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

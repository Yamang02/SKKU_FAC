/**
 * 공지사항 요청 데이터를 위한 DTO
 */
export default class NoticeRequestDTO {
    constructor(data = {}) {
        this.id = data.id;
        this.title = data.title;
        this.content = data.content;
        this.author = data.author;
        this.authorName = data.authorName;
        this.isImportant = data.isImportant || false;
        this.status = data.status || 'active';
    }

    /**
     * 데이터 유효성을 검증합니다.
     * @throws {Error} 유효성 검증 실패시 에러를 던집니다.
     */
    validate() {
        if (!this.title || this.title.trim().length === 0) {
            throw new Error('제목은 필수입니다.');
        }
        if (!this.content || this.content.trim().length === 0) {
            throw new Error('내용은 필수입니다.');
        }
        if (!this.author) {
            throw new Error('작성자 ID는 필수입니다.');
        }
        if (!this.authorName) {
            throw new Error('작성자 이름은 필수입니다.');
        }
        if (!['active', 'inactive'].includes(this.status)) {
            throw new Error('유효하지 않은 상태값입니다.');
        }
    }

    /**
     * DTO를 일반 객체로 변환합니다.
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            author: this.author,
            authorName: this.authorName,
            isImportant: this.isImportant,
            status: this.status
        };
    }
}

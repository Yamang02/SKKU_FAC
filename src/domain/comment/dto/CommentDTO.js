/**
 * 댓글 데이터 전송 객체 (DTO)
 * 프레젠테이션 레이어로 전달되는 데이터 구조
 */
class CommentDTO {
    constructor(comment) {
        this.id = comment.id;
        this.artworkId = comment.artworkId;
        this.author = comment.author;
        this.content = comment.content;
        this.date = comment.date;
        this.isEditable = comment.isEditable;
        this.formattedDate = this._formatDate(comment.date);
    }

    /**
     * 날짜를 포맷팅합니다.
     * @param {string} dateString - 날짜 문자열
     * @returns {string} 포맷팅된 날짜 문자열
     * @private
     */
    _formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '.').replace(/\.$/, '');
    }
}

export default CommentDTO; 
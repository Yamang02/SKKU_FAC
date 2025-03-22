/**
 * 공지사항 상세 페이지 ViewDTO
 */
class NoticeDetailViewDto {
    constructor({
        title,
        notice,
        comments = [],
        commentPagination = null
    }) {
        this.title = title;
        this.notice = notice;
        this.comments = comments;
        this.commentPagination = commentPagination;
    }

    toView() {
        return {
            title: this.title,
            notice: this.notice,
            comments: this.comments,
            commentPagination: this.commentPagination
        };
    }
}

export default NoticeDetailViewDto;

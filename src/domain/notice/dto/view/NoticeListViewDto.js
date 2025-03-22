/**
 * 공지사항 목록 페이지 ViewDTO
 */
class NoticeListViewDto {
    constructor({
        title = '공지사항',
        notices = [],
        pagination = null
    }) {
        this.title = title;
        this.notices = notices;
        this.pagination = pagination;
    }

    toView() {
        return {
            title: this.title,
            notices: this.notices,
            pagination: this.pagination
        };
    }
}

export default NoticeListViewDto;

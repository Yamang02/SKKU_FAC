class NoticeUseCase {
    constructor(noticeDomainService, commentDomainService) {
        this.noticeDomainService = noticeDomainService;
        this.commentDomainService = commentDomainService;
    }

    async getNoticeList({ searchType, keyword, page, limit }) {
        const searchOptions = {
            type: searchType,
            keyword: keyword
        };
        return await this.noticeDomainService.getNoticeList(page, limit, searchOptions);
    }

    async getNoticeDetail(noticeId, commentPage = 1) {
        const notice = await this.noticeDomainService.getNoticeDetail(noticeId);
        const commentData = await this.commentDomainService.getCommentsByTarget('notice', noticeId, commentPage);

        return {
            notice,
            comments: commentData.comments,
            commentPagination: commentData.pagination
        };
    }

    async createNotice(noticeData, authorId) {
        this.noticeDomainService.validateNoticeData(noticeData);
        const notice = {
            ...noticeData,
            author_id: authorId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return await this.noticeDomainService.noticeRepository.create(notice);
    }

    async updateNotice(noticeId, noticeData) {
        const notice = await this.noticeDomainService.checkNoticeExists(noticeId);
        this.noticeDomainService.validateNoticeData(noticeData);

        const updatedNotice = {
            ...notice,
            ...noticeData,
            updated_at: new Date()
        };
        return await this.noticeDomainService.noticeRepository.update(noticeId, updatedNotice);
    }

    async deleteNotice(noticeId) {
        await this.noticeDomainService.checkNoticeExists(noticeId);
        await this.noticeDomainService.noticeRepository.delete(noticeId);
    }
}

export default NoticeUseCase;

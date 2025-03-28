import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import NoticeRepository from '../repositories/NoticeRepository.js';
import Page from '../models/common/page/Page.js';

export default class NoticeController {
    constructor() {
        this.noticeRepository = new NoticeRepository();
    }

    /**
     * 공지사항 목록 페이지를 렌더링합니다.
     */
    async getNoticeList(req, res) {
        try {
            const { page = 1, limit = 12, searchType, keyword } = req.query;
            const notices = await this.noticeRepository.findNotices({ page, limit, searchType, keyword });

            const pageOptions = {
                page,
                limit,
                baseUrl: '/notice',
                filters: { searchType, keyword },
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(notices.total, pageOptions);

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.LIST, {
                title: '공지사항',
                notices: notices.items,
                page: pageData,
                searchType,
                keyword
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항 상세 페이지를 렌더링합니다.
     */
    async getNoticeDetail(req, res) {
        try {
            const { id } = req.params;
            const { page: commentPage = 1 } = req.query;
            const notice = await this.noticeRepository.findNoticeById(id);
            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            const comments = await this.noticeRepository.findComments(id, { page: commentPage });
            const commentPageOptions = {
                page: commentPage,
                limit: 10,
                baseUrl: `/notice/${id}`,
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const commentPageData = new Page(comments.total, commentPageOptions);

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.DETAIL, {
                title: notice.title,
                notice,
                comments: comments.items,
                page: commentPageData
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항 작성 페이지를 렌더링합니다.
     */
    async getNoticeRegisterPage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 작성',
                notice: null,
                isCreate: true,
                user: req.session.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항 수정 페이지를 렌더링합니다.
     */
    async getNoticeEditPage(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeRepository.findNoticeById(id);
            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 수정',
                notice,
                isEdit: true
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항 목록 페이지를 렌더링합니다.
     */
    async getManagementNoticeList(req, res) {
        try {
            const { page = 1, limit = 10, keyword, status, isImportant } = req.query;

            // isImportant 값 변환 (string -> boolean)
            let parsedIsImportant = undefined;
            if (isImportant === 'true') parsedIsImportant = true;
            if (isImportant === 'false') parsedIsImportant = false;

            const filters = {
                keyword,
                status,
                isImportant: parsedIsImportant
            };

            const notices = await this.noticeRepository.findNotices({
                page: parseInt(page),
                limit: parseInt(limit),
                ...filters
            });

            const pageOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                baseUrl: '/admin/management/notice',
                filters,
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(notices.total, pageOptions);

            const result = {
                notices: notices.items || [],
                total: notices.total,
                totalPages: Math.ceil(notices.total / limit)
            };

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.LIST, {
                title: '공지사항 관리',
                result,
                page: pageData,
                filters
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항 상세 페이지를 렌더링합니다.
     */
    async getManagementNoticeDetail(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeRepository.findNoticeById(id);
            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 상세',
                notice,
                isCreate: false,
                isEdit: false
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항을 생성합니다.
     */
    async createNotice(req, res) {
        try {
            const noticeData = req.body;
            console.log('Received Notice Data:', noticeData); // POST된 내용 로그 출력

            // 공지사항 생성 로직
            const createdNotice = await this.noticeRepository.createNotice(noticeData);

            // 생성된 공지의 ID를 사용하여 상세 관리 페이지로 이동
            res.status(200).json({ success: true, redirectUrl: `/admin/management/notice/${createdNotice.id}` });
        } catch (error) {
            console.error('Error creating notice:', error);
            // 생성 실패 시 작성 페이지에 남아 있도록 함
            res.status(500).json({ success: false, message: '공지사항 생성 중 오류가 발생했습니다.' });
        }
    }

    /**
     * 공지사항을 수정합니다.
     */
    async updateNotice(req, res) {
        try {
            const { id } = req.params;
            const noticeData = req.body;
            console.log('Updating Notice Data:', noticeData); // 수정된 내용 로그 출력

            // 공지사항 존재 여부 확인
            const existingNotice = await this.noticeRepository.findNoticeById(id);
            if (!existingNotice) {
                return res.status(404).json({
                    success: false,
                    message: '수정할 공지사항을 찾을 수 없습니다.'
                });
            }

            // 공지사항 수정 로직
            const updatedNotice = await this.noticeRepository.updateNotice(id, noticeData);
            if (!updatedNotice) {
                return res.status(500).json({
                    success: false,
                    message: '공지사항 수정에 실패했습니다.'
                });
            }

            // 수정된 공지의 상세 페이지로 이동
            res.status(200).json({
                success: true,
                redirectUrl: `/admin/management/notice/${id}`
            });
        } catch (error) {
            console.error('Error updating notice:', error);
            res.status(500).json({
                success: false,
                message: '공지사항 수정 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 공지사항을 삭제합니다.
     */
    async deleteNotice(req, res) {
        try {
            const { id } = req.params;
            console.log('Deleting Notice ID:', id); // 삭제할 공지사항 ID 로그 출력

            // 공지사항 존재 여부 확인
            const existingNotice = await this.noticeRepository.findNoticeById(id);
            if (!existingNotice) {
                return res.status(404).json({
                    success: false,
                    message: '삭제할 공지사항을 찾을 수 없습니다.'
                });
            }

            // 공지사항 삭제 로직
            const isDeleted = await this.noticeRepository.deleteNotice(id);
            if (!isDeleted) {
                return res.status(500).json({
                    success: false,
                    message: '공지사항 삭제에 실패했습니다.'
                });
            }

            // 삭제 성공 시 목록 페이지로 이동
            res.status(200).json({
                success: true,
                redirectUrl: '/admin/management/notice'
            });
        } catch (error) {
            console.error('Error deleting notice:', error);
            res.status(500).json({
                success: false,
                message: '공지사항 삭제 중 오류가 발생했습니다.'
            });
        }
    }
}

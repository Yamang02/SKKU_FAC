import NoticeRepository from '../../repositories/NoticeRepository.js';
import { NoticeNotFoundError, NoticeValidationError, NoticePermissionError } from '../../models/common/error/NoticeError.js';
import NoticeResponseDTO from '../../models/notice/dto/NoticeResponseDto.js';
import NoticeSearchDTO from '../../models/notice/dto/NoticeSearchDto.js';
import Page from '../../models/common/page/Page.js';

/**
 * 공지사항 서비스
 * 공지사항 관련 비즈니스 로직을 처리합니다.
 */
export default class NoticeService {
    constructor() {
        this.noticeRepository = new NoticeRepository();
    }

    /**
     * 페이지네이션 옵션을 생성합니다.
     * @private
     */
    _createPageOptions(options = {}) {
        const {
            page = 1,
            limit = 10,
            baseUrl = '/notice',
            searchType,
            keyword,
            status,
            isImportant
        } = options;

        return {
            page: parseInt(page),
            limit: parseInt(limit),
            baseUrl,
            filters: {
                searchType,
                keyword,
                status,
                isImportant
            }
        };
    }

    /**
     * 공지사항 목록을 조회합니다.
     */
    async getNoticeList(options = {}) {
        try {
            // 1. 검색 DTO 생성 및 검증
            const searchDto = new NoticeSearchDTO(options);
            searchDto.validate();

            // 2. 공지사항 목록 조회
            const notices = await this.noticeRepository.findNotices(searchDto);

            // 3. 페이지네이션 옵션 생성
            const pageOptions = this._createPageOptions({
                ...options,
                baseUrl: options.isManagement ? '/admin/management/notice' : '/notice'
            });

            // 4. Page 인스턴스 생성
            const page = new Page(notices.total, pageOptions);

            // 5. 응답 DTO 생성
            const noticeResponses = notices.items.map(notice =>
                new NoticeResponseDTO(notice)[options.isManagement ? 'toJSON' : 'toListItem']()
            );

            return {
                notices: noticeResponses,
                page
            };
        } catch (error) {
            if (error instanceof NoticeValidationError) {
                throw error;
            }
            throw new Error('공지사항 목록 조회 중 오류가 발생했습니다.');
        }
    }

    /**
     * 공지사항 상세 정보를 조회하고 조회수를 증가시킵니다.
     * @param {string} id - 공지사항 ID
     * @param {string} sessionId - 세션 ID (중복 조회 방지용)
     * @returns {Promise<Object>} 공지사항 정보
     */
    async getNoticeDetail(id, sessionId) {
        try {
            // 1. 공지사항 조회
            const notice = await this.noticeRepository.findNoticeById(id);
            if (!notice) {
                throw new NoticeNotFoundError();
            }

            // 2. 조회수 증가 처리
            await this._handleViewCount(id, sessionId);

            // 3. 이전/다음 글 정보 조회
            const [prevNotice, nextNotice] = await Promise.all([
                this.noticeRepository.findPreviousNotice(id),
                this.noticeRepository.findNextNotice(id)
            ]);

            // 4. DTO 변환 및 반환
            const noticeDto = new NoticeResponseDTO({
                ...notice,
                prevId: prevNotice?.id,
                nextId: nextNotice?.id,
                prevTitle: prevNotice?.title,
                nextTitle: nextNotice?.title
            });

            return noticeDto.toJSON();
        } catch (error) {
            if (error instanceof NoticeNotFoundError) {
                throw error;
            }
            throw new Error('공지사항 조회 중 오류가 발생했습니다.');
        }
    }

    /**
     * 조회수 증가를 처리합니다.
     * @private
     * @param {string} noticeId - 공지사항 ID
     * @param {string} sessionId - 세션 ID
     */
    async _handleViewCount(noticeId, sessionId) {
        try {
            // 세션 기반 중복 조회 체크를 위한 키 생성
            const viewKey = `notice:view:${noticeId}:${sessionId}`;

            // Redis가 구현되어 있지 않으므로 메모리에 임시 저장
            // 추후 Redis 도입 시 수정 필요
            if (!global.viewedNotices) {
                global.viewedNotices = new Map();
            }

            // 24시간 이내 조회 여부 확인
            const now = Date.now();
            const lastViewTime = global.viewedNotices.get(viewKey);
            const ONE_DAY = 24 * 60 * 60 * 1000;

            if (!lastViewTime || (now - lastViewTime) > ONE_DAY) {
                // 조회수 증가
                await this.noticeRepository.incrementViews(noticeId);

                // 조회 시간 기록
                global.viewedNotices.set(viewKey, now);

                // 메모리 관리를 위해 오래된 기록 삭제
                for (const [key, time] of global.viewedNotices.entries()) {
                    if (now - time > ONE_DAY) {
                        global.viewedNotices.delete(key);
                    }
                }
            }
        } catch (error) {
            console.error('Error handling view count:', error);
            // 조회수 처리 실패는 크리티컬한 에러가 아니므로 무시
        }
    }

    /**
     * 공지사항을 생성합니다.
     */
    async createNotice(noticeDto) {
        return this.noticeRepository.createNotice(noticeDto);
    }

    /**
     * 공지사항을 수정합니다.
     */
    async updateNotice(id, noticeDto) {
        const existingNotice = await this.noticeRepository.findById(id);
        if (!existingNotice) {
            throw new NoticeNotFoundError();
        }

        return this.noticeRepository.updateNotice(id, noticeDto);
    }

    /**
     * 공지사항을 삭제합니다.
     */
    async deleteNotice(id, userId) {
        const notice = await this.noticeRepository.findNoticeById(id);
        if (!notice) {
            throw new NoticeNotFoundError();
        }

        if (notice.author !== userId) {
            throw new NoticePermissionError();
        }

        const result = await this.noticeRepository.deleteNotice(id);
        if (!result) {
            throw new Error('공지사항 삭제에 실패했습니다.');
        }

        return result;
    }

    async findNotices(searchDto) {
        return this.noticeRepository.findNotices(searchDto);
    }
}

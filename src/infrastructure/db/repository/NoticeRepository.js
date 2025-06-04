import { Notice, UserAccount } from '../model/entity/EntitityIndex.js';
import BaseRepository from './BaseRepository.js';

export default class NoticeRepository extends BaseRepository {
    constructor() {
        super(Notice);
    }

    /**
     * 기본 include 옵션 (작성자 정보 포함)
     */
    getDefaultInclude() {
        return [
            {
                model: UserAccount,
                attributes: ['id', 'name', 'email']
            }
        ];
    }

    /**
     * 모든 공지사항을 조회합니다.
     */
    async findNotices({ page = 1, limit = 10, keyword, isImportant, userId } = {}) {
        const where = {};

        // 키워드 검색 조건
        if (keyword) {
            Object.assign(where, this.buildSearchCondition(keyword, ['title', 'content']));
        }

        // 중요 공지 필터링
        if (isImportant !== undefined) {
            where.isImportant = isImportant;
        }

        // 작성자 필터링
        if (userId) {
            where.userId = userId;
        }

        return await this.findAll({
            where,
            page,
            limit,
            order: [
                ['isImportant', 'DESC'],
                ['createdAt', 'DESC']
            ],
            include: this.getDefaultInclude()
        });
    }

    /**
     * ID로 공지사항을 조회합니다.
     */
    async findNoticeById(id) {
        return await this.findById(id, {
            include: this.getDefaultInclude()
        });
    }

    /**
     * 새로운 공지사항을 생성합니다.
     */
    async createNotice(noticeData) {
        return await this.create(noticeData);
    }

    /**
     * 공지사항 정보를 업데이트합니다.
     */
    async updateNotice(id, noticeData) {
        return await this.updateById(id, noticeData);
    }

    /**
     * 공지사항을 삭제합니다.
     */
    async deleteNotice(id) {
        return await this.deleteById(id);
    }

    /**
     * 중요 공지사항 목록을 조회합니다.
     */
    async findImportantNotices(limit = 5) {
        return await this.findAll({
            where: { isImportant: true },
            limit,
            order: [['createdAt', 'DESC']],
            include: this.getDefaultInclude(),
            pagination: false
        });
    }

    /**
     * 특정 사용자가 작성한 공지사항 목록을 조회합니다.
     */
    async findNoticesByUser(userId, { page = 1, limit = 10 } = {}) {
        return await this.findAll({
            where: { userId },
            page,
            limit,
            order: [['createdAt', 'DESC']],
            include: this.getDefaultInclude()
        });
    }

    /**
     * 최근 공지사항 목록을 조회합니다.
     */
    async findRecentNotices(limit = 10) {
        return await this.findAll({
            limit,
            order: [['createdAt', 'DESC']],
            include: this.getDefaultInclude(),
            pagination: false
        });
    }

    /**
     * 공지사항 개수를 조회합니다.
     */
    async countNotices(where = {}) {
        return await this.count(where);
    }

    /**
     * 중요 공지사항 개수를 조회합니다.
     */
    async countImportantNotices() {
        return await this.count({ isImportant: true });
    }
}

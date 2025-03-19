/**
 * Comment 리포지토리 인터페이스
 * 댓글 도메인의 영속성을 담당합니다.
 */
class CommentRepository {
    /**
     * 댓글을 생성합니다.
     * @param {Comment} _comment - 생성할 댓글 엔티티
     * @returns {Promise<Comment>} 생성된 댓글
     */
    async create(_comment) {
        throw new Error('CommentRepository.create() must be implemented');
    }

    /**
     * 댓글을 수정합니다.
     * @param {number} _id - 댓글 ID
     * @param {Object} _updateData - 수정할 데이터
     * @returns {Promise<Comment>} 수정된 댓글
     */
    async update(_id, _updateData) {
        throw new Error('CommentRepository.update() must be implemented');
    }

    /**
     * 댓글을 삭제합니다.
     * @param {number} _id - 댓글 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(_id) {
        throw new Error('CommentRepository.delete() must be implemented');
    }

    /**
     * ID로 댓글을 조회합니다.
     * @param {number} _id - 댓글 ID
     * @returns {Promise<Comment>} 조회된 댓글
     */
    async findById(_id) {
        throw new Error('CommentRepository.findById() must be implemented');
    }

    /**
     * 특정 타겟의 댓글 목록을 조회합니다.
     * @param {string} _targetType - 타겟 타입 ('notice' 또는 'artwork')
     * @param {number} _targetId - 타겟 ID
     * @param {number} _offset - 시작 위치
     * @param {number} _limit - 조회할 개수
     * @returns {Promise<Comment[]>} 댓글 목록
     */
    async findByTarget(_targetType, _targetId, _offset, _limit) {
        throw new Error('CommentRepository.findByTarget() must be implemented');
    }

    /**
     * 특정 타겟의 댓글 수를 조회합니다.
     * @param {string} _targetType - 타겟 타입
     * @param {number} _targetId - 타겟 ID
     * @returns {Promise<number>} 댓글 수
     */
    async countByTarget(_targetType, _targetId) {
        throw new Error('CommentRepository.countByTarget() must be implemented');
    }

    /**
     * 특정 부모 댓글의 대댓글 목록을 조회합니다.
     * @param {number} _parentId - 부모 댓글 ID
     * @returns {Promise<Comment[]>} 대댓글 목록
     */
    async findReplies(_parentId) {
        throw new Error('CommentRepository.findReplies() must be implemented');
    }

    /**
     * 작품별 댓글 목록을 조회합니다.
     * @param {number} _artworkId - 작품 ID
     * @param {Object} _options - 조회 옵션
     * @returns {Promise<Array>} 댓글 목록
     */
    async findByArtworkId(_artworkId, _options) {
        throw new Error('CommentRepository.findByArtworkId() must be implemented');
    }

    /**
     * 작품별 댓글 수를 조회합니다.
     * @param {number} _artworkId - 작품 ID
     * @returns {Promise<number>} 댓글 수
     */
    async countByArtworkId(_artworkId) {
        throw new Error('CommentRepository.countByArtworkId() must be implemented');
    }

    /**
     * 공지사항 ID로 댓글을 조회합니다.
     * @param {number} _noticeId - 공지사항 ID
     * @param {number} _limit - 한 페이지당 댓글 수
     * @param {number} _offset - 시작 위치
     * @returns {Promise<Array>} 댓글 목록
     */
    async findByNoticeId(_noticeId, _limit, _offset) {
        throw new Error('CommentRepository.findByNoticeId() must be implemented');
    }

    /**
     * 공지사항 ID로 댓글 수를 조회합니다.
     * @param {number} _noticeId - 공지사항 ID
     * @returns {Promise<number>} 댓글 수
     */
    async countByNoticeId(_noticeId) {
        throw new Error('CommentRepository.countByNoticeId() must be implemented');
    }
}

export default CommentRepository;

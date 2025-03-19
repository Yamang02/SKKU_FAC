import CommentApplicationService from '../service/CommentApplicationService.js';
import CommentRepositoryImpl from '../../../infrastructure/repository/CommentRepositoryImpl.js';

/**
 * Comment 컨트롤러
 * 댓글 관련 HTTP 요청을 처리합니다.
 */
class CommentController {
    constructor() {
        const commentRepository = new CommentRepositoryImpl();
        this.commentApplicationService = new CommentApplicationService(commentRepository);

        // 메서드 바인딩
        this.getCommentList = this.getCommentList.bind(this);
        this.createComment = this.createComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }

    /**
     * 댓글 목록을 조회합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getCommentList(req, res) {
        try {
            const { targetType, targetId } = req.params;
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;

            const result = await this.commentApplicationService.getCommentList({
                targetType,
                targetId: parseInt(targetId, 10),
                page,
                limit
            });

            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * 새 댓글을 생성합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async createComment(req, res) {
        try {
            const { targetType, targetId } = req.params;
            const { content, parent_id } = req.body;
            const author = req.user.id;  // 인증된 사용자 ID

            const comment = await this.commentApplicationService.createComment({
                content,
                author,
                targetType,
                targetId: parseInt(targetId, 10),
                parent_id: parent_id ? parseInt(parent_id, 10) : null
            });

            res.status(201).json(comment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * 댓글을 수정합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async updateComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;  // 인증된 사용자 ID

            const comment = await this.commentApplicationService.updateComment(
                parseInt(id, 10),
                userId,
                { content }
            );

            res.json(comment);
        } catch (error) {
            res.status(error.message.includes('권한') ? 403 : 400)
                .json({ error: error.message });
        }
    }

    /**
     * 댓글을 삭제합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;  // 인증된 사용자 ID

            await this.commentApplicationService.deleteComment(parseInt(id, 10), userId);
            res.status(204).end();
        } catch (error) {
            res.status(error.message.includes('권한') ? 403 : 400)
                .json({ error: error.message });
        }
    }
}

export default CommentController;

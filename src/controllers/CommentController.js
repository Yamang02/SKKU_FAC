import CommentUseCase from '../application/comment/CommentUseCase.js';

/**
 * Comment 컨트롤러
 * 댓글 관련 HTTP 요청을 처리합니다.
 */
class CommentController {
    constructor() {
        this.commentUseCase = new CommentUseCase();
    }

    /**
     * 작품의 댓글 목록을 조회합니다.
     */
    async getArtworkComments(req, res) {
        try {
            const { artworkId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const result = await this.commentUseCase.getArtworkComments(artworkId, page);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json(result);
            } else {
                res.render('artwork/comments', {
                    comments: result.comments,
                    pagination: result.pagination
                });
            }
        } catch (error) {
            console.error('Error in getArtworkComments:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글을 불러오는 중 오류가 발생했습니다.'
                });
            }
        }
    }

    /**
     * 공지사항의 댓글 목록을 조회합니다.
     */
    async getNoticeComments(req, res) {
        try {
            const { noticeId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const result = await this.commentUseCase.getNoticeComments(noticeId, page);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json(result);
            } else {
                res.render('notice/comments', {
                    comments: result.comments,
                    pagination: result.pagination
                });
            }
        } catch (error) {
            console.error('Error in getNoticeComments:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글을 불러오는 중 오류가 발생했습니다.'
                });
            }
        }
    }

    /**
     * 댓글을 추가합니다.
     */
    async addComment(req, res) {
        try {
            const { artworkId, noticeId } = req.params;
            const commentData = {
                ...req.body,
                userId: req.session.user.id
            };

            let result;
            if (artworkId) {
                result = await this.commentUseCase.addArtworkComment(artworkId, commentData);
            } else if (noticeId) {
                result = await this.commentUseCase.addNoticeComment(noticeId, commentData);
            }

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json(result);
            } else {
                res.redirect('back');
            }
        } catch (error) {
            console.error('Error in addComment:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글을 추가하는 중 오류가 발생했습니다.'
                });
            }
        }
    }

    /**
     * 댓글을 수정합니다.
     */
    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const commentData = {
                ...req.body,
                userId: req.session.user.id
            };

            const result = await this.commentUseCase.updateComment(commentId, commentData);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json(result);
            } else {
                res.redirect('back');
            }
        } catch (error) {
            console.error('Error in updateComment:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글을 수정하는 중 오류가 발생했습니다.'
                });
            }
        }
    }

    /**
     * 댓글을 삭제합니다.
     */
    async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.session.user.id;

            const result = await this.commentUseCase.deleteComment(commentId, userId);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json(result);
            } else {
                res.redirect('back');
            }
        } catch (error) {
            console.error('Error in deleteComment:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글을 삭제하는 중 오류가 발생했습니다.'
                });
            }
        }
    }
}

export default CommentController;

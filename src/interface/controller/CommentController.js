import CommentUseCase from '../../application/comment/CommentUseCase.js';

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
            const user = req.session.user;
            const commentData = {
                content: req.body.content,
                author: user.username,
                user_id: user.id,
                department: user.department,
                student_id: user.student_id,
                artwork_id: req.body.artwork_id,
                notice_id: req.body.notice_id
            };

            const result = await this.commentUseCase.addComment(commentData);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json(result);
            } else {
                const redirectUrl = commentData.artwork_id
                    ? `/artworks/${commentData.artwork_id}`
                    : `/notices/${commentData.notice_id}`;
                res.redirect(redirectUrl);
            }
        } catch (error) {
            console.error('Error in addComment:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글 작성 중 오류가 발생했습니다.'
                });
            }
        }
    }

    /**
     * 댓글을 수정합니다.
     */
    async updateComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.session.user.id;

            const result = await this.commentUseCase.updateComment(id, { content }, userId);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json(result);
            } else {
                const redirectUrl = result.artwork_id
                    ? `/artworks/${result.artwork_id}`
                    : `/notices/${result.notice_id}`;
                res.redirect(redirectUrl);
            }
        } catch (error) {
            console.error('Error in updateComment:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글 수정 중 오류가 발생했습니다.'
                });
            }
        }
    }

    /**
     * 댓글을 삭제합니다.
     */
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;

            const result = await this.commentUseCase.deleteComment(id, userId);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.json({ success: result });
            } else {
                res.redirect('back');
            }
        } catch (error) {
            console.error('Error in deleteComment:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).render('common/error', {
                    message: '댓글 삭제 중 오류가 발생했습니다.'
                });
            }
        }
    }
}

export default CommentController;

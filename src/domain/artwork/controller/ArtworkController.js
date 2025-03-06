/**
 * 작품 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
const artworkService = require('../service/ArtworkService');
const relatedArtworkService = require('../service/RelatedArtworkService');
const exhibitionService = require('../../exhibition/service/ExhibitionService');
const commentService = require('../../comment/service/CommentService');

class ArtworkController {
    /**
     * 작품 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static async getArtworkList(req, res) {
        try {
            // 검색 파라미터 가져오기
            const { keyword, exhibition, year, department, page = 1 } = req.query;
            
            // 서비스를 통해 작품 목록 가져오기
            const artworks = artworkService.searchArtworks({
                keyword,
                exhibition,
                year,
                department
            });
            
            // 전시회 목록 가져오기
            const exhibitions = exhibitionService.getAllExhibitions();
            
            // 페이지 렌더링
            res.render('artwork-list', { 
                title: '작품 검색 - SKKU Faculty Art Gallery',
                artworks,
                exhibitions,
                keyword,
                exhibition,
                year,
                department,
                page
            });
        } catch (error) {
            console.error('작품 목록 조회 오류:', error);
            res.status(500).render('error', { 
                message: '작품 목록을 불러오는 중 오류가 발생했습니다.' 
            });
        }
    }

    /**
     * 작품 상세 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static getArtworkDetail(req, res) {
        try {
            const artworkId = req.params.id;
            const commentPage = parseInt(req.query.commentPage) || 1;
            
            // 작품 정보 가져오기
            const artwork = artworkService.getArtworkById(artworkId);
            
            if (!artwork) {
                return res.status(404).render('error', {
                    message: '작품을 찾을 수 없습니다.'
                });
            }
            
            // 관련 작품 가져오기
            const relatedArtworks = relatedArtworkService.getRelatedArtworks(artworkId);
            
            // 댓글 가져오기
            const commentData = commentService.getCommentsByArtworkId(artworkId, commentPage);
            
            // 페이지 렌더링
            res.render('artwork-detail', { 
                artwork,
                relatedArtworks,
                comments: commentData.comments,
                commentPagination: commentData.pagination
            });
        } catch (error) {
            console.error('작품 상세 조회 오류:', error);
            res.status(500).render('error', { 
                message: '작품 정보를 불러오는 중 오류가 발생했습니다.' 
            });
        }
    }
}

module.exports = ArtworkController; 
import ViewResolver from '../../presentation/util/ViewResolver.js';
import { ViewPath } from '../../presentation/constant/ViewPath.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor(artworkUseCase) {
        this.artworkUseCase = artworkUseCase;
    }

    /**
     * 작품 목록 페이지를 렌더링합니다.
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     */
    async getArtworkList(req, res) {
        try {
            const { artworks, exhibitions, pagination } = await this.artworkUseCase.searchArtworks(req.query);
            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                currentPage: req.path,
                artworks: artworks || [],
                exhibitions: exhibitions || [],
                keyword: req.query.keyword || '',
                exhibition: req.query.exhibition || '',
                year: req.query.year || '',
                department: req.query.department || '',
                pagination
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     */
    async getArtworkDetail(req, res) {
        try {
            const artwork = await this.artworkUseCase.getArtworkById(req.params.id);
            if (!artwork) {
                return ViewResolver.renderError(res, new Error('작품을 찾을 수 없습니다.'));
            }

            // 댓글 데이터 가져오기
            const { comments, pagination: commentPagination } = await this.artworkUseCase.getComments(req.params.id, req.query.page || 1);

            // 관련 작품 데이터 가져오기
            const relatedArtworks = await this.artworkUseCase.getRelatedArtworks(req.params.id);

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.DETAIL, {
                currentPage: req.path,
                artwork,
                comments,
                commentPagination,
                relatedArtworks
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회별 작품 목록을 조회합니다.
     */
    async getArtworksByExhibition(req, res) {
        try {
            const artworks = await this.artworkUseCase.findByExhibitionId(req.params.exhibitionId);
            res.json(artworks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

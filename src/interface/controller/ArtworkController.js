/**
 * 작품 컨트롤러
 * 작품 관련 HTTP 요청을 처리합니다.
 */
import viewResolver from '../../presentation/view/ViewResolver.js';

export default class ArtworkController {
    constructor(artworkUseCase) {
        this.artworkUseCase = artworkUseCase;
    }

    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkList(req, res) {
        try {
            const { artworks, exhibitions, pagination } = await this.artworkUseCase.searchArtworks(req.query);
            viewResolver.render(res, 'artwork/ArtworkList', {
                title: '작품 목록',
                artworks: artworks || [],
                exhibitions: exhibitions || [],
                keyword: req.query.keyword || '',
                exhibition: req.query.exhibition || '',
                year: req.query.year || '',
                department: req.query.department || '',
                pagination
            });
        } catch (error) {
            viewResolver.render(res, 'common/error', {
                title: '오류',
                error
            });
        }
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     */
    async getArtworkDetail(req, res) {
        try {
            const artwork = await this.artworkUseCase.getArtworkById(req.params.id);
            if (!artwork) {
                return viewResolver.render(res, 'common/error', {
                    title: '오류',
                    error: { message: '작품을 찾을 수 없습니다.' }
                });
            }

            // 댓글 데이터 가져오기
            const { comments, pagination: commentPagination } = await this.artworkUseCase.getComments(req.params.id, req.query.page || 1);

            // 관련 작품 데이터 가져오기
            const relatedArtworks = await this.artworkUseCase.getRelatedArtworks(req.params.id);

            viewResolver.render(res, 'artwork/ArtworkDetail', {
                title: artwork.title,
                artwork,
                comments,
                commentPagination,
                relatedArtworks
            });
        } catch (error) {
            viewResolver.render(res, 'common/error', {
                title: '오류',
                error
            });
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

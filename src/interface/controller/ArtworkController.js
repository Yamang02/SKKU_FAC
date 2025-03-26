import ViewResolver from '../../presentation/util/ViewResolver.js';
import { ViewPath } from '../../presentation/constant/ViewPath.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor(artworkUseCase, exhibitionUseCase) {
        if (!artworkUseCase) throw new Error('ArtworkUseCase is required');
        if (!exhibitionUseCase) throw new Error('ExhibitionUseCase is required');

        this.artworkUseCase = artworkUseCase;
        this.exhibitionUseCase = exhibitionUseCase;

        // 메서드 바인딩
        this.getArtworkList = this.getArtworkList.bind(this);
        this.getArtworkDetail = this.getArtworkDetail.bind(this);
        this.getArtworksByExhibition = this.getArtworksByExhibition.bind(this);
        this.getAdminArtworkList = this.getAdminArtworkList.bind(this);
        this.getAdminArtworkDetail = this.getAdminArtworkDetail.bind(this);
        this.updateAdminArtwork = this.updateAdminArtwork.bind(this);
        this.deleteAdminArtwork = this.deleteAdminArtwork.bind(this);
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

    /**
     * 관리자 작품 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getAdminArtworkList(req, res) {
        try {
            const [artworks, exhibitions, artists] = await Promise.all([
                this.artworkUseCase.getAllArtworks(),
                this.exhibitionUseCase.findAll(),
                this.artworkUseCase.getAllArtists()
            ]);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                currentPage: req.path,
                artworks,
                exhibitions,
                artists,
                title: '작품 관리'
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 작품 상세 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getAdminArtworkDetail(req, res) {
        try {
            const [artwork, exhibitions, artists] = await Promise.all([
                this.artworkUseCase.getArtworkById(parseInt(req.params.id)),
                this.exhibitionUseCase.findAll(),
                this.artworkUseCase.getAllArtists()
            ]);

            if (!artwork) {
                return ViewResolver.renderError(res, new Error('작품을 찾을 수 없습니다.'));
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                currentPage: req.path,
                artwork,
                exhibitions,
                artists,
                title: '작품 상세'
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 작품 수정을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async updateAdminArtwork(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedArtwork = await this.artworkUseCase.update(parseInt(id), updateData);

            if (!updatedArtwork) {
                return res.status(404).json({ success: false, message: '작품을 찾을 수 없습니다.' });
            }

            res.json({ success: true, data: updatedArtwork });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * 관리자 작품 삭제를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async deleteAdminArtwork(req, res) {
        try {
            const { id } = req.params;
            const result = await this.artworkUseCase.delete(parseInt(id));

            if (!result) {
                return res.status(404).json({ success: false, message: '작품을 찾을 수 없습니다.' });
            }

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

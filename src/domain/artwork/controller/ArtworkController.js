import { ViewPath } from '../../../common/constants/ViewPath.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import ArtworkService from '../service/ArtworkService.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.artworkService = new ArtworkService();
    }

    // === 페이지 렌더링 ===
    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkListPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록'
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     */
    async getArtworkDetailPage(req, res) {
        try {
            const { id } = req.params;
            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.DETAIL, {
                title: '작품 상세',
                artworkId: id
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 등록 페이지를 렌더링합니다.
     */
    async getArtworkRegistrationPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.REGISTER, {
                title: '작품 등록'
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }


    /**
     * 전시회별 작품 목록을 조회합니다.
     */
    async getArtworksByExhibition(req, res) {
        try {
            const { exhibitionId } = req.params;
            const { page = 1, limit = 12 } = req.query;

            const result = await this.artworkService.getArtworkList({
                page: Number(page),
                limit: Number(limit),
                exhibitionId: Number(exhibitionId)
            });

            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '전시회 작품 목록',
                artworks: result.items,
                page: result.page,
                total: result.total,
                exhibitionId
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }

}

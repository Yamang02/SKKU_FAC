import { ViewPath } from '../../../../common/constants/ViewPath.js';
import ViewResolver from '../../../../common/utils/ViewResolver.js';
import ArtworkManagementService from '../../service/artwork/ArtworkManagementService.js';

export default class ArtworkManagementController {
    constructor() {
        this.artworkManagementService = new ArtworkManagementService();
    }

    /**
     * 관리자 작품 목록 페이지를 렌더링합니다.
     */
    async getManagementArtworkListPage(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const artworkListData = await this.artworkManagementService.getArtworkList({ page, limit });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                breadcrumb: '작품 관리',
                currentPage: 'artwork',
                ...artworkListData
            });
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 작품을 삭제합니다.
     */
    async deleteManagementArtwork(req, res) {
        try {
            const artworkId = req.params.id;

            await this.artworkManagementService.deleteArtwork(artworkId);

            res.redirect('/admin/management/artwork');
        } catch (error) {
            console.error('작품 삭제 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }
}

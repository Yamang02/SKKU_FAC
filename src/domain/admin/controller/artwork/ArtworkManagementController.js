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
            const keyword = req.query.keyword || null;
            const status = req.query.status || null;
            const isFeatured = req.query.isFeatured || null;
            const sort = req.query.sort || 'createdAt';
            const order = req.query.order || 'desc';

            const artworkListData = await this.artworkManagementService.getArtworkList({
                page,
                limit,
                keyword,
                status,
                isFeatured,
                sortField: sort,
                sortOrder: order
            });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                breadcrumb: '작품 관리',
                currentPage: 'artwork',
                ...artworkListData,
                sort,
                order
            });
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 작품 상세 페이지를 렌더링합니다.
     */
    async getManagementArtworkDetailPage(req, res) {
        try {
            const artworkId = req.params.id;
            const artworkData = await this.artworkManagementService.getArtworkDetail(artworkId);


            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 상세',
                breadcrumb: '작품 상세',
                currentPage: 'artwork',
                artwork: artworkData
            });
        } catch (error) {
            console.error('작품 상세 조회 중 오류:', error);
            req.flash('error', '작품을 찾을 수 없습니다.');
            res.redirect('/admin/management/artwork');
        }
    }

    /**
     * 관리자 작품 정보를 수정합니다.
     */
    async updateManagementArtwork(req, res) {
        try {
            const artworkId = req.params.id;
            const artworkData = req.body;

            await this.artworkManagementService.updateArtwork(artworkId, artworkData);

            req.flash('success', '작품 정보가 성공적으로 수정되었습니다.');
            res.redirect(`/admin/management/artwork/${artworkId}`);
        } catch (error) {
            console.error('작품 정보 수정 중 오류:', error);
            req.flash('error', '작품 정보 수정 중 오류가 발생했습니다.');
            res.redirect(`/admin/management/artwork/${req.params.id}`);
        }
    }

    /**
     * 관리자 작품을 삭제합니다.
     */
    async deleteManagementArtwork(req, res) {
        try {
            const artworkId = req.params.id;

            await this.artworkManagementService.deleteArtwork(artworkId);

            req.flash('success', '작품이 성공적으로 삭제되었습니다.');
            res.redirect('/admin/management/artwork');
        } catch (error) {
            console.error('작품 삭제 중 오류:', error);
            req.flash('error', '작품 삭제 중 오류가 발생했습니다.');
            res.redirect('/admin/management/artwork');
        }
    }

    /**
     * 작품 상태를 업데이트합니다.
     */
    async updateArtworkStatus(req, res) {
        try {
            const artworkId = req.params.id;
            const { status } = req.body;

            await this.artworkManagementService.updateArtworkStatus(artworkId, status);

            req.flash('success', '작품 상태가 성공적으로 변경되었습니다.');
            res.redirect(`/admin/management/artwork/${artworkId}`);
        } catch (error) {
            console.error('작품 상태 변경 중 오류:', error);
            req.flash('error', '작품 상태 변경 중 오류가 발생했습니다.');
            res.redirect(`/admin/management/artwork/${req.params.id}`);
        }
    }

    /**
     * 작품의 주요 작품 여부를 토글합니다.
     */
    async toggleFeatured(req, res) {
        try {
            const artworkId = req.params.id;
            const updatedArtwork = await this.artworkManagementService.toggleFeatured(artworkId);

            req.flash('success', `작품이 ${updatedArtwork.isFeatured ? '주요 작품으로 설정' : '일반 작품으로 변경'}되었습니다.`);
            res.redirect(`/admin/management/artwork/${artworkId}`);
        } catch (error) {
            console.error('작품 주요 작품 설정 중 오류:', error);
            req.flash('error', '작품 주요 작품 설정 중 오류가 발생했습니다.');
            res.redirect(`/admin/management/artwork/${req.params.id}`);
        }
    }

    /**
     * 작품 생성 페이지를 렌더링합니다.
     */
    async getCreateArtworkPage(req, res) {
        try {
            // 작가 및 전시회 목록 조회
            const { artists, exhibitions } = await this.artworkManagementService.getArtworkFormData();

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.CREATE, {
                title: '작품 추가',
                breadcrumb: '작품 추가',
                currentPage: 'artwork',
                artists,
                exhibitions
            });
        } catch (error) {
            console.error('작품 생성 페이지 조회 중 오류:', error);
            req.flash('error', '작품 생성 페이지 조회 중 오류가 발생했습니다.');
            res.redirect('/admin/management/artwork');
        }
    }

    /**
     * 새 작품을 생성합니다.
     */
    async createArtwork(req, res) {
        try {
            const artworkData = req.body;
            const file = req.file;

            if (!file) {
                req.flash('error', '이미지는 필수입니다.');
                return res.redirect('/admin/management/artwork/create');
            }

            const newArtwork = await this.artworkManagementService.createArtwork(artworkData, file);

            req.flash('success', '작품이 성공적으로 추가되었습니다.');
            res.redirect(`/admin/management/artwork/${newArtwork.id}`);
        } catch (error) {
            console.error('작품 생성 중 오류:', error);
            req.flash('error', `작품 생성 중 오류가 발생했습니다: ${error.message}`);
            res.redirect('/admin/management/artwork/create');
        }
    }
}

import { ViewPath } from '#common/constants/ViewPath.js';
import ViewResolver from '#common/utils/ViewResolver.js';
import BaseAdminController from '#domain/admin/controller/BaseAdminController.js';

export default class ArtworkAdminController extends BaseAdminController {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['ArtworkAdminService'];

    constructor(artworkAdminService = null) {
        super('ArtworkAdminController');

        // 의존성 주입 방식 (새로운 방식)
        if (artworkAdminService) {
            this.artworkAdminService = artworkAdminService;
        } else {
            // 기존 방식 호환성 유지 (임시)

            throw new Error('ArtworkAdminService가 주입되지 않았습니다.');
        }
    }

    /**
     * 관리자 작품 목록 페이지를 렌더링합니다.
     */
    async getManagementArtworkListPage(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const {
                    page = 1,
                    limit = 10,
                    keyword,
                    status,
                    isFeatured,
                    sort = 'createdAt',
                    order = 'desc'
                } = req.query;

                const artworkListData = await this.artworkAdminService.getArtworkList({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    keyword,
                    status,
                    isFeatured,
                    sortField: sort,
                    sortOrder: order
                });

                const pagination = this.createPaginationInfo(page, limit, artworkListData.total);

                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                    title: '작품 관리',
                    artworks: artworkListData.artworks,
                    total: artworkListData.total,
                    page: pagination,
                    filters: { keyword, status, isFeatured },
                    sort,
                    order
                });
            },
            req,
            res,
            {
                operationName: '작품 목록 조회',
                errorRedirectPath: '/admin',
                errorMessage: '작품 목록을 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 작품 상세 페이지를 렌더링합니다.
     */
    async getManagementArtworkDetailPage(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const artworkId = req.params.id;
                const artworkData = await this.artworkAdminService.getArtworkDetail(artworkId);

                if (!artworkData) {
                    throw new Error('작품을 찾을 수 없습니다.');
                }

                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                    title: `작품 상세 - ${artworkData.title}`,
                    artwork: artworkData
                });
            },
            req,
            res,
            {
                operationName: '작품 상세 조회',
                errorRedirectPath: '/admin/management/artwork',
                errorMessage: '작품 정보를 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 작품 정보를 수정합니다.
     */
    async updateManagementArtwork(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const artworkId = req.params.id;
                const artworkData = req.body;

                await this.artworkAdminService.updateArtwork(artworkId, artworkData);

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '작품 정보 수정',
                successRedirectPath: `/admin/management/artwork/${req.params.id}`,
                successMessage: '작품 정보가 성공적으로 수정되었습니다.',
                errorRedirectPath: `/admin/management/artwork/${req.params.id}`,
                errorMessage: '작품 정보 수정 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 작품을 삭제합니다.
     */
    async deleteManagementArtwork(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const artworkId = req.params.id;
                await this.artworkAdminService.deleteArtwork(artworkId);

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '작품 삭제',
                successRedirectPath: '/admin/management/artwork',
                successMessage: '작품이 성공적으로 삭제되었습니다.',
                errorRedirectPath: '/admin/management/artwork',
                errorMessage: '작품 삭제 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 작품 상태를 업데이트합니다.
     */
    async updateArtworkStatus(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const artworkId = req.params.id;
                const { status } = req.body;

                await this.artworkAdminService.updateArtworkStatus(artworkId, status);

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '작품 상태 변경',
                successRedirectPath: `/admin/management/artwork/${req.params.id}`,
                successMessage: '작품 상태가 성공적으로 변경되었습니다.',
                errorRedirectPath: `/admin/management/artwork/${req.params.id}`,
                errorMessage: '작품 상태 변경 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 작품의 주요 작품 여부를 토글합니다.
     */
    async toggleFeatured(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const artworkId = req.params.id;
                const updatedArtwork = await this.artworkAdminService.toggleFeatured(artworkId);

                // 성공 메시지 설정
                const message = `작품이 ${updatedArtwork.isFeatured ? '주요 작품으로 설정' : '일반 작품으로 변경'}되었습니다.`;
                req.flash('success', message);

                // 목록 페이지로 리다이렉트 (현재 페이지 유지를 위해 referer 사용)
                const referer = req.get('Referer') || '/admin/management/artwork';
                return res.redirect(referer);
            },
            req,
            res,
            {
                operationName: '작품 주요 작품 설정',
                errorRedirectPath: req.get('Referer') || '/admin/management/artwork',
                errorMessage: '작품 주요 작품 설정 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 작품 생성 페이지를 렌더링합니다.
     */
    async getCreateArtworkPage(req, res) {
        return this.safeExecuteSSR(
            async () => {
                // 작가 및 전시회 목록 조회
                const { artists, exhibitions } = await this.artworkAdminService.getArtworkFormData();

                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.CREATE, {
                    title: '작품 추가',
                    artists,
                    exhibitions
                });
            },
            req,
            res,
            {
                operationName: '작품 생성 페이지 조회',
                errorRedirectPath: '/admin/management/artwork',
                errorMessage: '작품 생성 페이지를 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 새 작품을 생성합니다.
     */
    async createArtwork(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const artworkData = req.body;
                const file = req.file;

                if (!file) {
                    throw new Error('이미지는 필수입니다.');
                }

                const newArtwork = await this.artworkAdminService.createArtwork(artworkData, file);

                // 생성된 작품 ID를 사용하여 리다이렉트
                req.flash('success', '작품이 성공적으로 추가되었습니다.');
                return res.redirect(`/admin/management/artwork/${newArtwork.id}`);
            },
            req,
            res,
            {
                operationName: '작품 생성',
                errorRedirectPath: '/admin/management/artwork/create',
                errorMessage: '작품 생성 중 오류가 발생했습니다.'
            }
        );
    }
}

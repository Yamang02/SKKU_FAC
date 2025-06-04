import { ViewPath } from '../../../../common/constants/ViewPath.js';
import ViewResolver from '../../../../common/utils/ViewResolver.js';
import BaseAdminController from '../BaseAdminController.js';

export default class ExhibitionManagementController extends BaseAdminController {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['ExhibitionManagementService'];

    constructor(exhibitionManagementService = null) {
        super('ExhibitionManagementController');

        // 의존성 주입 방식 (새로운 방식)
        if (exhibitionManagementService) {
            this.exhibitionManagementService = exhibitionManagementService;
        } else {
            // 기존 방식 호환성 유지 (임시)
            // TODO: 모든 도메인 리팩토링 완료 후 제거 예정
            throw new Error('ExhibitionManagementService가 주입되지 않았습니다.');
        }
    }

    /**
     * 관리자 전시회 목록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionListPage(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const { page = 1, limit = 10, exhibitionType, featured, year, keyword } = req.query;

                const filters = {
                    exhibitionType,
                    featured,
                    year: year ? parseInt(year) : null,
                    keyword
                };

                const exhibitionListData = await this.exhibitionManagementService.getExhibitionList({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    ...filters
                });

                const pagination = this.createPaginationInfo(page, limit, exhibitionListData.total);

                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.LIST, {
                    title: '전시회 관리',
                    exhibitions: exhibitionListData.exhibitions,
                    pagination,
                    filters
                });
            },
            req,
            res,
            {
                operationName: '전시회 목록 조회',
                errorRedirectPath: '/admin',
                errorMessage: '전시회 목록을 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 전시회 생성 페이지를 렌더링합니다.
     */
    async getManagementExhibitionCreatePage(req, res) {
        return this.safeExecuteSSR(
            async () => {
                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                    title: '전시회 등록',
                    mode: 'create',
                    exhibition: null
                });
            },
            req,
            res,
            {
                operationName: '전시회 생성 페이지 조회',
                errorRedirectPath: '/admin/management/exhibition',
                errorMessage: '전시회 생성 페이지를 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 전시회 상세 페이지를 렌더링합니다.
     */
    async getManagementExhibitionDetailPage(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const exhibitionId = req.params.id;
                const exhibition = await this.exhibitionManagementService.getExhibitionDetail(exhibitionId);

                if (!exhibition) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                    title: `전시회 상세 - ${exhibition.title}`,
                    exhibition,
                    mode: 'edit'
                });
            },
            req,
            res,
            {
                operationName: '전시회 상세 조회',
                errorRedirectPath: '/admin/management/exhibition',
                errorMessage: '전시회 정보를 불러오는 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 전시회를 생성합니다.
     */
    async createManagementExhibition(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const exhibitionData = req.body;
                const file = req.file;
                let exhibitionImage = {};

                if (file) {
                    exhibitionImage = {
                        url: file.path,
                        publicId: file.filename
                    };
                }

                const createdExhibition = await this.exhibitionManagementService.createExhibition(
                    exhibitionData,
                    exhibitionImage
                );

                req.flash('success', `${createdExhibition.title} 전시회가 성공적으로 등록되었습니다.`);
                return res.redirect(`/admin/management/exhibition/${createdExhibition.id}`);
            },
            req,
            res,
            {
                operationName: '전시회 생성',
                errorRedirectPath: '/admin/management/exhibition/new',
                errorMessage: '전시회 생성 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 전시회를 수정합니다.
     */
    async updateManagementExhibition(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const exhibitionId = req.params.id;
                const exhibitionData = req.body;

                const result = await this.exhibitionManagementService.updateExhibition(exhibitionId, exhibitionData);

                if (!result) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '전시회 수정',
                successRedirectPath: '/admin/management/exhibition',
                successMessage: '전시회가 성공적으로 수정되었습니다.',
                errorRedirectPath: `/admin/management/exhibition/${req.params.id}`,
                errorMessage: '전시회 수정 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 관리자 전시회를 삭제합니다.
     */
    async deleteManagementExhibition(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const exhibitionId = req.params.id;
                const result = await this.exhibitionManagementService.deleteExhibition(exhibitionId);

                if (!result) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                return null; // safeExecuteSSR에서 리다이렉트 처리
            },
            req,
            res,
            {
                operationName: '전시회 삭제',
                successRedirectPath: '/admin/management/exhibition',
                successMessage: '전시회가 성공적으로 삭제되었습니다.',
                errorRedirectPath: '/admin/management/exhibition',
                errorMessage: '전시회 삭제 중 오류가 발생했습니다.'
            }
        );
    }

    /**
     * 전시회의 주요 전시 여부를 토글합니다.
     */
    async toggleFeatured(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const exhibitionId = req.params.id;
                const updatedExhibition = await this.exhibitionManagementService.toggleFeatured(exhibitionId);

                const message = `전시회가 ${updatedExhibition.isFeatured ? '주요 전시로 설정' : '일반 전시로 변경'}되었습니다.`;
                req.flash('success', message);

                return res.redirect('/admin/management/exhibition');
            },
            req,
            res,
            {
                operationName: '전시회 주요 전시 설정',
                errorRedirectPath: '/admin/management/exhibition',
                errorMessage: '전시회 주요 전시 설정 중 오류가 발생했습니다.'
            }
        );
    }
}

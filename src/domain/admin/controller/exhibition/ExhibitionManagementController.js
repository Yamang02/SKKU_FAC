import { ViewPath } from '../../../../common/constants/ViewPath.js';
import ViewResolver from '../../../../common/utils/ViewResolver.js';
import ExhibitionManagementService from '../../service/exhibition/ExhibitionManagementService.js';

export default class ExhibitionManagementController {
    constructor() {
        this.exhibitionManagementService = new ExhibitionManagementService();
    }

    /**
     * 관리자 전시회 목록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionListPage(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                exhibitionType: req.query.exhibitionType,
                featured: req.query.featured,
                year: req.query.year ? parseInt(req.query.year) : null,
                keyword: req.query.keyword
            };

            const exhibitionListData = await this.exhibitionManagementService.getExhibitionList({
                page,
                limit,
                ...filters
            });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.LIST, {
                title: '전시회 관리',
                breadcrumb: '전시회 관리',
                currentPage: 'exhibition',
                exhibitions: exhibitionListData.exhibitions,
                page: exhibitionListData.page,
                total: exhibitionListData.total,
                filters: exhibitionListData.filters
            });
        } catch (error) {
            console.error('전시회 목록 조회 중 오류:', error);
            req.flash('error', error.message || '전시회 목록 조회 중 오류가 발생했습니다.');
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회 생성 페이지를 렌더링합니다.
     */
    async getManagementExhibitionCreatePage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 등록',
                breadcrumb: '전시회 등록',
                currentPage: 'exhibition',
                mode: 'create',
                exhibition: null
            });
        } catch (error) {
            console.error('전시회 등록 페이지 렌더링 중 오류:', error);
            req.flash('error', error.message || '전시회 등록 페이지 렌더링 중 오류가 발생했습니다.');
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회 상세 페이지를 렌더링합니다.
     */
    async getManagementExhibitionDetailPage(req, res) {
        try {
            const exhibitionId = req.params.id;

            const exhibition = await this.exhibitionManagementService.getExhibitionDetail(exhibitionId);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 상세',
                breadcrumb: '전시회 상세',
                currentPage: 'exhibition',
                exhibition: exhibition,
                mode: 'edit'
            });
        } catch (error) {
            console.error('전시회 상세 조회 중 오류:', error);
            req.flash('error', error.message || '전시회를 찾을 수 없습니다.');
            res.redirect('/admin/management/exhibition');
        }
    }

    /**
    * 관리자 전시회를 생성합니다.
    */
    async createManagementExhibition(req, res) {
        try {
            const exhibitionData = req.body;
            const file = req.file;
            let exhibitionImage = {};

            if (file) {
                exhibitionImage = {
                    url: file.path,
                    publicId: file.filename
                };
            }


            const createdExhibition = await this.exhibitionManagementService.createExhibition(exhibitionData, exhibitionImage);

            req.flash('success', createdExhibition.title + '전시회가 성공적으로 등록되었습니다.');
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 상세',
                breadcrumb: '전시회 상세',
                currentPage: 'exhibition',
                exhibition: createdExhibition,
                mode: 'edit'
            });
        } catch (error) {
            console.error('전시회 등록 중 오류:', error);
            req.flash('error', error.message || '전시회 등록 중 오류가 발생했습니다.');
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 상세',
                breadcrumb: '전시회 상세',
                currentPage: 'exhibition',
                exhibition: null,
                mode: 'create'
            });
        }
    }
    /**
     * 관리자 전시회를 수정합니다.
     */

    async updateManagementExhibition(req, res) {
        try {
            const exhibitionId = req.params.id;
            const exhibitionData = req.body;
            // 업데이트 시 이미지는 처리하지 않음

            const result = await this.exhibitionManagementService.updateExhibition(exhibitionId, exhibitionData);

            if (result) {
                req.flash('success', '전시회가 성공적으로 수정되었습니다.');
                // 전시회 목록 페이지로 리다이렉트
                res.redirect('/admin/management/exhibition?page=1&limit=10'); // 초기값으로 페이지 1과 limit 10 설정
            } else {
                req.flash('error', '전시회를 찾을 수 없습니다.');
                res.redirect('/admin/management/exhibition'); // 전시회 목록 페이지로 리다이렉트
            }
        } catch (error) {
            console.error('전시회 수정 중 오류:', error);
            req.flash('error', error.message || '전시회 수정 중 오류가 발생했습니다.');
            res.redirect('/admin/management/exhibition/' + req.params.id);
        }
    }

    /**
     * 관리자 전시회를 삭제합니다.
     */
    async deleteManagementExhibition(req, res) {
        try {
            const exhibitionId = req.params.id;

            const result = await this.exhibitionManagementService.deleteExhibition(exhibitionId);

            if (result) {
                req.flash('success', '전시회가 성공적으로 삭제되었습니다.');
                res.redirect('/admin/management/exhibition'); // 전시회 목록 페이지로 리다이렉트
            } else {
                req.flash('error', '전시회를 찾을 수 없습니다.');
                res.redirect('/admin/management/exhibition'); // 전시회 목록 페이지로 리다이렉트
            }
        } catch (error) {
            console.error('전시회 삭제 중 오류:', error);
            req.flash('error', error.message || '전시회 삭제 중 오류가 발생했습니다.');
            res.redirect('/admin/management/exhibition'); // 전시회 목록 페이지로 리다이렉트
        }
    }

    /**
     * 전시회의 주요 전시 여부를 토글합니다.
     */
    async toggleFeatured(req, res) {
        try {
            const exhibitionId = req.params.id;
            console.log(`[DEBUG] 전시회(${exhibitionId}) 주요 전시 토글 요청 시작`);

            const exhibition = await this.exhibitionManagementService.getExhibitionDetail(exhibitionId);
            console.log(`[DEBUG] 현재 isFeatured 값: ${exhibition.isFeatured}`);

            const updatedExhibition = await this.exhibitionManagementService.toggleFeatured(exhibitionId);
            console.log(`[DEBUG] 토글 후 isFeatured 값: ${updatedExhibition.isFeatured}`);

            req.flash('success', `전시회가 ${updatedExhibition.isFeatured ? '주요 전시로 설정' : '일반 전시로 변경'}되었습니다.`);
            res.redirect('/admin/management/exhibition');
        } catch (error) {
            console.error('전시회 주요 전시 설정 중 오류:', error);
            req.flash('error', '전시회 주요 전시 설정 중 오류가 발생했습니다.');
            res.redirect('/admin/management/exhibition');
        }
    }
}

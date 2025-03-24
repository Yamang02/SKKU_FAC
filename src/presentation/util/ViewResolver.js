import { CssResolver } from './CssResolver.js';
import { ViewPath } from '../constant/ViewPath.js';
import { CssPath } from '../constant/CssPath.js';

/**
 * 뷰 렌더링을 담당하는 유틸리티 클래스
 */
export default class ViewResolver {
    /**
     * 뷰를 렌더링합니다.
     * @param {Response} res - Express Response 객체
     * @param {string} viewPath - 렌더링할 뷰 경로
     * @param {Object} data - 뷰에 전달할 데이터
     */
    static render(res, viewPath, data = {}) {
        try {
            // Admin 도메인인지 확인
            const isAdminDomain = viewPath.startsWith('admin/');

            // 레이아웃 적용 여부 확인 (Admin 도메인일 때만 기본값 true)
            const useLayout = data.useLayout !== undefined ? data.useLayout : isAdminDomain;

            // CSS 파일 목록 추가
            const cssFiles = CssResolver.getPageCssFiles(data.currentPage || '');

            // 공통 데이터 설정
            const commonData = {
                ...data,
                cssFiles,
                CssPath,
                ViewPath
            };

            if (useLayout) {
                // 레이아웃과 함께 렌더링
                const relativeContentPath = this.getRelativeContentPath(viewPath);
                res.render(ViewPath.ADMIN.LAYOUT, {
                    ...commonData,
                    content: relativeContentPath
                });
            } else {
                // 레이아웃 없이 렌더링
                res.render(viewPath, commonData);
            }
        } catch (error) {
            this.renderError(res, error);
        }
    }

    /**
     * 에러 페이지를 렌더링합니다.
     * @param {Response} res - Express Response 객체
     * @param {Error} error - 에러 객체
     */
    static renderError(res, error) {
        console.error('View Rendering Error:', error);
        res.render(ViewPath.ERROR.ERROR, {
            message: error.message || '페이지를 불러오는 중 오류가 발생했습니다.',
            error: {
                code: error.code || 500,
                stack: error.stack
            },
            cssFiles: [],
            CssPath,
            ViewPath
        });
    }

    /**
     * 뷰 경로를 상대 경로로 변환합니다.
     * @param {string} viewPath - 원본 뷰 경로
     * @returns {string} 상대 경로
     */
    static getRelativeContentPath(viewPath) {
        // admin/layout/AdminLayout.ejs에서 content 파일까지의 상대 경로 계산
        if (viewPath.startsWith('admin/')) {
            const pathParts = viewPath.split('/');
            // management 디렉토리가 포함된 경우 (회원관리 등)
            if (pathParts.includes('management')) {
                return '../' + pathParts.slice(1).join('/');
            }
            // 대시보드 등 다른 admin 페이지
            return '../' + pathParts.slice(1).join('/');
        }
        return viewPath;
    }

    /**
     * 현재 페이지에 필요한 뷰 경로를 반환합니다.
     * @param {string} currentPage - 현재 페이지 URL
     * @returns {string} 뷰 경로
     */
    static getPageViewPath(currentPage) {
        // URL 패턴에 따른 뷰 매핑
        const viewMapping = {
            '/admin/dashboard': ViewPath.ADMIN.DASHBOARD,
            '/admin/management/user': ViewPath.ADMIN.MANAGEMENT.USER.LIST,
            '/admin/management/user/:id': ViewPath.ADMIN.MANAGEMENT.USER.DETAIL,
            '/admin/management/exhibition': ViewPath.ADMIN.MANAGEMENT.EXHIBITION.LIST,
            '/admin/management/artwork': ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST,
            '/admin/management/notice': ViewPath.ADMIN.MANAGEMENT.NOTICE.LIST,
            '/exhibition': ViewPath.MAIN.EXHIBITION.LIST,
            '/artwork': ViewPath.MAIN.ARTWORK.LIST,
            '/artwork/:id': ViewPath.MAIN.ARTWORK.DETAIL,
            '/notice': ViewPath.MAIN.NOTICE.LIST,
            '/notice/:id': ViewPath.MAIN.NOTICE.DETAIL
        };

        // URL 패턴 매칭
        for (const [pattern, viewPath] of Object.entries(viewMapping)) {
            if (currentPage.match(new RegExp(pattern.replace(':id', '\\d+')))) {
                return viewPath;
            }
        }

        // 기본 뷰 반환
        return ViewPath.MAIN.HOME;
    }
}

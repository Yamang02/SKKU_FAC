import { ViewPath } from './ViewPath.js';
import { getPageCssFiles, CssPath } from './CssPath.js';

export default class ViewResolver {
    static render(res, viewPath, data = {}) {
        try {
            // Admin 도메인인지 확인
            const isAdminDomain = viewPath.startsWith(ViewPath.ADMIN.ROOT);

            // 레이아웃 적용 여부 확인 (Admin 도메인일 때만 기본값 true)
            const useLayout = data.useLayout !== undefined ? data.useLayout : isAdminDomain;

            // currentPage 자동 설정 (URL 경로)
            const currentPage = this.resolveCurrentPage(viewPath, data.currentPage);

            // 공통 데이터 설정
            const commonData = {
                ...data,
                currentPage,
                getPageCssFiles,
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
            console.error('View 렌더링 중 오류 발생:', error);
            this.renderError(res, error);
        }
    }

    static renderError(res, error) {
        res.render(ViewPath.ERROR.ERROR, {
            error: {
                message: error.message || '알 수 없는 오류가 발생했습니다.',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            currentPage: '/error',
            getPageCssFiles,
            CssPath,
            ViewPath
        });
    }

    /**
     * 뷰 경로에서 currentPage(URL)를 자동으로 추출합니다.
     * @param {string} viewPath - 뷰 경로
     * @param {string} [explicitCurrentPage] - 명시적으로 지정된 currentPage
     * @returns {string} currentPage (URL)
     */
    static resolveCurrentPage(viewPath, explicitCurrentPage) {
        // 명시적으로 지정된 currentPage가 있으면 그것을 사용
        if (explicitCurrentPage) {
            return explicitCurrentPage;
        }

        // ViewPath에서 URL 매핑
        const urlMap = {
            [ViewPath.ADMIN.DASHBOARD]: '/admin',
            [ViewPath.ADMIN.USER.LIST]: '/admin/users',
            [ViewPath.ADMIN.EXHIBITION.LIST]: '/admin/exhibitions',
            [ViewPath.ADMIN.ARTWORK.LIST]: '/admin/artworks',
            [ViewPath.ADMIN.NOTICE.LIST]: '/admin/notices',
            [ViewPath.HOME.MAIN]: '/',
            [ViewPath.EXHIBITION.LIST]: '/exhibitions',
            [ViewPath.EXHIBITION.DETAIL]: '/exhibitions',
            [ViewPath.ARTWORK.LIST]: '/artworks',
            [ViewPath.ARTWORK.DETAIL]: '/artworks',
            [ViewPath.NOTICE.LIST]: '/notices',
            [ViewPath.NOTICE.DETAIL]: '/notices'
        };

        // 매핑된 URL이 있으면 반환
        if (urlMap[viewPath]) {
            return urlMap[viewPath];
        }

        // 기본값
        return '/';
    }

    /**
     * 뷰 경로를 상대 경로로 변환합니다.
     * @param {string} viewPath - 원본 뷰 경로
     * @returns {string} 상대 경로
     */
    static getRelativeContentPath(viewPath) {
        // admin/layout/AdminLayout.ejs에서 content 파일까지의 상대 경로 계산
        if (viewPath.startsWith('admin/')) {
            return '../' + viewPath.split('/').pop();
        }
        return viewPath;
    }
}

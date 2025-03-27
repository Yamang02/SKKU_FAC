import { ViewPath } from '../constants/ViewPath.js';


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
    static async render(res, viewPath, data = {}) {
        try {
            // 레이아웃 결정
            const layout = this.determineLayout(viewPath);

            // 공통 데이터 설정
            const commonData = {
                ...data,
                ViewPath,
                view: viewPath
            };

            // 컨텐츠를 먼저 렌더링
            res.render(viewPath, commonData, (err, html) => {
                if (err) {
                    this.renderError(res, err);
                    return;
                }

                // 레이아웃과 함께 렌더링
                res.render(layout, {
                    ...commonData,
                    content: html
                });
            });
        } catch (error) {
            this.renderError(res, error);
        }
    }

    /**
     * 에러 페이지를 렌더링합니다.
     */
    static renderError(res, error) {
        console.error('View Rendering Error:', error);
        const layout = this.determineLayout(ViewPath.ERROR);

        // 에러 페이지 HTML을 먼저 렌더링
        res.render(ViewPath.ERROR, {
            message: error.message || '페이지를 불러오는 중 오류가 발생했습니다.',
            error: {
                code: error.code || 500,
                stack: error.stack
            },
            ViewPath
        }, (err, html) => {
            if (err) {
                console.error('Error page rendering failed:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // 레이아웃과 함께 렌더링
            res.render(layout, {
                content: html,
                ViewPath
            });
        });
    }

    /**
     * 뷰 경로에 따른 레이아웃을 결정합니다.
     * @param {string} viewPath - 뷰 경로
     * @returns {string} 레이아웃 경로
     */
    static determineLayout(viewPath) {
        return viewPath.startsWith('admin/') ? ViewPath.ADMIN.LAYOUT : ViewPath.MAIN.LAYOUT;
    }

    /**
     * 현재 페이지에 필요한 뷰 경로를 반환합니다.
     * @param {string} currentPage - 현재 페이지 URL
     * @returns {string} 뷰 경로
     */
    static getPageViewPath(currentPage) {
        // URL 패턴에 따른 뷰 매핑
        const viewMapping = {
            '/admin/management/user': ViewPath.ADMIN.MANAGEMENT.USER.LIST,
            '/admin/management/user/:id': ViewPath.ADMIN.MANAGEMENT.USER.DETAIL,
            '/admin/management/exhibition': ViewPath.ADMIN.MANAGEMENT.EXHIBITION.LIST,
            '/admin/management/exhibition/:id': ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL,
            '/admin/management/artwork': ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST,
            '/admin/management/artwork/:id': ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL,
            '/admin/management/notice': ViewPath.ADMIN.MANAGEMENT.NOTICE.LIST,
            '/admin/management/notice/:id': ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL,
            '/exhibition': ViewPath.MAIN.EXHIBITION.LIST,
            '/exhibition/:id': ViewPath.MAIN.EXHIBITION.DETAIL,
            '/artwork': ViewPath.MAIN.ARTWORK.LIST,
            '/artwork/:id': ViewPath.MAIN.ARTWORK.DETAIL,
            '/notice': ViewPath.MAIN.NOTICE.LIST,
            '/notice/:id': ViewPath.MAIN.NOTICE.DETAIL,
            '/login': ViewPath.MAIN.USER.LOGIN,
            '/register': ViewPath.MAIN.USER.REGISTER,
            '/profile': ViewPath.MAIN.USER.PROFILE
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

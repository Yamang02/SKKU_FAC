import { ViewPath } from '../constants/ViewPath.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

            // 현재 페이지 결정
            const currentPage = this.determineCurrentPage(viewPath);

            // 공통 데이터 설정
            const commonData = {
                ...data,
                ViewPath,
                view: viewPath,
                currentPage
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
                    content: html,
                    layoutPath: layout
                });
            });
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
        const layout = this.determineLayout(ViewPath.ERROR);

        // 에러 페이지 HTML을 먼저 렌더링
        res.render(
            ViewPath.ERROR,
            {
                message: error.message || '페이지를 불러오는 중 오류가 발생했습니다.',
                error: {
                    code: error.code || 500,
                    stack: error.stack
                },
                ViewPath,
                currentPage: 'error'
            },
            (err, html) => {
                if (err) {
                    console.error('Error page rendering failed:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                // 레이아웃과 함께 렌더링
                res.render(layout, {
                    content: html,
                    ViewPath,
                    layoutPath: layout,
                    currentPage: 'error'
                });
            }
        );
    }

    /**
     * 뷰 경로에 따른 레이아웃을 결정합니다.
     * @param {string} _viewPath - 뷰 경로 (현재 미사용)
     * @returns {string} 레이아웃 경로
     */
    static determineLayout(_viewPath) {
        // Admin VIEW는 더 이상 존재하지 않으므로 메인 레이아웃만 사용
        return ViewPath.MAIN.LAYOUT;
    }

    /**
     * 뷰 경로에 따른 현재 페이지를 결정합니다.
     * @param {string} viewPath - 뷰 경로
     * @returns {string} 현재 페이지 식별자
     */
    static determineCurrentPage(viewPath) {
        // Admin 관련 페이지는 더 이상 존재하지 않으므로 제거
        if (viewPath === ViewPath.MAIN.HOME) return 'home';
        if (viewPath === ViewPath.MAIN.ABOUT) return 'about';
        if (viewPath === ViewPath.MAIN.EXHIBITION.LIST) return 'exhibition';
        if (viewPath === ViewPath.MAIN.ARTWORK.LIST) return 'artwork';
        if (viewPath === ViewPath.MAIN.USER.LOGIN) return 'login';
        if (viewPath === ViewPath.MAIN.USER.REGISTER) return 'register';
        if (viewPath === ViewPath.ERROR) return 'error';
        return '';
    }
}

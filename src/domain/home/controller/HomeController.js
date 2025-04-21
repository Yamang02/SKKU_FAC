import { ViewPath } from '../../../common/constants/ViewPath.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';

export default class HomeController {
    constructor() {
    }

    /**
     * 홈 페이지를 렌더링합니다.
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     */
    async getHomePage(req, res) {
        try {
            // 최근 공지사항을 가져옵니다

            ViewResolver.render(res, ViewPath.MAIN.HOME, {
                title: '성미회 홈',
                currentPage: req.path
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * About 페이지를 렌더링합니다.
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     */
    getAboutPage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.MAIN.ABOUT, {
                title: '성미회 소개',
                currentPage: req.path
            });
        } catch (error) {
            console.error('About 페이지 렌더링 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    async getSuccessPage(req, res) {
        const message = req.query.message;
        ViewResolver.render(res, ViewPath.SUCCESS, {
            title: '작업 성공',
            currentPage: req.path,
            message: message
        });
    }
}

import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import NoticeRepository from '../repositories/NoticeRepository.js';
import ArtworkRepository from '../repositories/ArtworkRepository.js';

export default class HomeController {
    constructor() {
        this.noticeRepository = new NoticeRepository();
        this.artworkRepository = new ArtworkRepository();
    }

    /**
     * 홈 페이지를 렌더링합니다.
     * @param {Request} req - Express Request 객체
     * @param {Response} res - Express Response 객체
     */
    async getHomePage(req, res) {
        try {
            // 최근 공지사항과 주요 작품 데이터를 가져옵니다
            const [notices, featuredArtworks] = await Promise.all([
                this.noticeRepository.findNotices({ page: 1, limit: 5 }),
                this.artworkRepository.findFeaturedArtworks()
            ]);

            ViewResolver.render(res, ViewPath.MAIN.HOME, {
                title: '성미회 홈',
                currentPage: req.path,
                recentNotices: notices.items,
                featuredArtworks
            });
        } catch (error) {
            console.error('홈 페이지 데이터 조회 중 오류:', error);
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
}

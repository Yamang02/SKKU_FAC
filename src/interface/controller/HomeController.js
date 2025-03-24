import ViewResolver from '../../presentation/util/ViewResolver.js';
import { ViewPath } from '../../presentation/constant/ViewPath.js';
class HomeController {
    /**
     * HomeController 생성자
     * @param {HomeUseCase} homeUseCase - 홈 유스케이스
     */
    constructor(homeUseCase) {
        this.homeUseCase = homeUseCase;
        this.getHome = this.getHome.bind(this);
    }

    async getHome(req, res) {
        try {
            const { recentNotices, featuredArtworks } = await this.homeUseCase.getHomePageData();

            return ViewResolver.render(res, ViewPath.HOME.MAIN, {
                title: '홈',
                recentNotices,
                featuredArtworks,
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Error in getHome:', error);
            return ViewResolver.render(res, ViewPath.ERROR.ERROR, {
                title: '오류가 발생했습니다',
                message: '홈페이지를 불러오는 중 오류가 발생했습니다.'
            });
        }
    }
}

export default HomeController;

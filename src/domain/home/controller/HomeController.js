import viewResolver from '../../../presentation/view/ViewResolver.js';
import * as noticeData from '../../../infrastructure/data/notice.js';
import { getFeaturedArtworks } from '../service/HomeService.js';

class HomeController {
    constructor() {
        // 메서드 바인딩
        this.getHome = this.getHome.bind(this);
    }

    async getHome(req, res) {
        // 최근 공지사항 3개 가져오기
        let recentNotices = [];
        try {
            const allNotices = noticeData.findAll();
            recentNotices = allNotices
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3);
        } catch (error) {
            console.error('Error fetching notices:', error);
            recentNotices = [];
        }

        // Featured Artworks 가져오기
        let featuredArtworks = [];
        try {
            featuredArtworks = getFeaturedArtworks() || [];
        } catch (error) {
            console.error('Error fetching artworks:', error);
            featuredArtworks = [];
        }

        return viewResolver.render(res, 'home/HomePage', {
            title: '홈',
            recentNotices: recentNotices || [],
            featuredArtworks: featuredArtworks || []
        });
    }
}

export default HomeController;

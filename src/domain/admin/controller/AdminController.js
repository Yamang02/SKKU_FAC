import { ViewPath } from '../../../common/constants/ViewPath.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import TimeFormatter from '../../../common/utils/TimeFormatter.js';
import ArtworkListDTO from '../../artwork/model/dto/ArtworkListDTO.js';
import Page from '../../common/model/Page.js';

export default class AdminController {
    constructor() {
    }

    /**
     * 관리자 대시보드를 렌더링합니다.
     */
    async getDashboard(req, res) {
        try {
            const [users, exhibitions, artworks] = await Promise.all([
                this.userRepository.findUsers(),
                this.exhibitionRepository.findExhibitions(),
                this.artworkRepository.findArtworks({ limit: 10 }) // 최근 10개 작품만 조회
            ]);

            const pageData = new Page(users.total, {
                page: 1,
                limit: 10,
                baseUrl: '/admin/dashboard'
            });

            // 활동 타입별 아이콘 매핑
            const activityIcons = {
                USER_REGISTER: 'fas fa-user-plus',
                EXHIBITION_CREATE: 'fas fa-calendar-plus',
                ARTWORK_UPDATE: 'fas fa-paint-brush'
            };

            // 최근 활동 데이터 가공
            const recentActivities = [
                { type: 'USER_REGISTER', message: '새로운 사용자가 등록되었습니다.', timestamp: new Date() },
                { type: 'EXHIBITION_CREATE', message: '새로운 전시회가 등록되었습니다.', timestamp: new Date(Date.now() - 3600000) },
                { type: 'ARTWORK_UPDATE', message: '작품이 수정되었습니다.', timestamp: new Date(Date.now() - 7200000) }
            ].map(activity => ({
                icon: activityIcons[activity.type],
                text: activity.message,
                time: TimeFormatter.formatTimeAgo(activity.timestamp)
            }));

            // 임시 공지사항 데이터
            const recentNotices = [
                { title: '시스템 점검 안내', date: '2024-03-26', isImportant: true },
                { title: '신규 기능 업데이트', date: '2024-03-25', isImportant: false },
                { title: '전시회 등록 가이드', date: '2024-03-24', isImportant: false }
            ];

            // ArtworkListDTO를 사용하여 작품 데이터 변환
            const artworkListDTO = new ArtworkListDTO({
                items: artworks.items,
                total: artworks.total,
                page: 1
            });

            ViewResolver.render(res, ViewPath.ADMIN.DASHBOARD, {
                title: '관리자 대시보드',
                breadcrumb: '대시보드',
                currentPage: 'dashboard',
                page: pageData,
                stats: {
                    totalUsers: users.total || 0,
                    activeExhibitions: exhibitions.items.filter(e => new Date(e.end_date) >= new Date()).length,
                    totalArtworks: artworks.total,
                    monthlyVisitors: 1234, // 임시 데이터
                    chartData: {
                        userGrowth: [10, 15, 20, 25, 30, 35],
                        exhibitionStats: [5, 8, 12, 15, 18, 20],
                        artworkDistribution: [30, 25, 20, 15, 10]
                    }
                },
                recentArtworks: artworkListDTO,
                recentActivities,
                recentNotices
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }
}



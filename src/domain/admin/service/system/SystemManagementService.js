import UserService from '../../../user/service/UserService.js';
import ArtworkService from '../../../artwork/service/ArtworkService.js';
import TimeFormatter from '../../../../common/utils/TimeFormatter.js';
import Page from '../../../common/model/Page.js';


/**
 * 관리자 서비스
 * 관리자 기능에 대한 비즈니스 로직을 처리합니다.
 */
export default class SystemManagementService {
    constructor() {
        this.userService = new UserService();
        this.artworkService = new ArtworkService();
    }

    /**
     * 대시보드 데이터를 가져옵니다.
     * @param {Object} options - 대시보드 조회 옵션
     * @returns {Promise<Object>} 대시보드 데이터
     */
    async getDashboardData(options = {}) {
        const { page = 1, limit = 10 } = options;

        try {
            // 사용자 및 작품 데이터 조회
            const userOptions = { page, limit };
            const artworkOptions = { page, limit };

            const [users, artworks] = await Promise.all([
                this.userService.getUserList(userOptions),
                this.artworkService.getArtworkListWithDetails(artworkOptions)
            ]);

            // 추천 작품 조회
            const featuredArtworks = await this.artworkService.getFeaturedArtworks();

            // 페이지네이션 데이터 생성
            const pageData = new Page(users?.total || 0, {
                page,
                limit,
                baseUrl: '/admin/dashboard'
            });

            // 대시보드 통계 데이터 생성
            const statsData = this._createStatsData(users, artworks);

            // 최근 활동 데이터 생성
            const activities = this._createActivityData(users, artworks);

            // 공지사항 데이터 생성 (임시 데이터)
            const notices = this._createNoticeData();

            return {
                page: pageData,
                stats: statsData,
                recentActivities: activities,
                recentNotices: notices,
                featuredArtworks: {
                    items: featuredArtworks || [],
                    total: featuredArtworks?.length || 0
                }
            };
        } catch (error) {
            console.error('대시보드 데이터 조회 중 오류:', error);
            throw new Error('대시보드 데이터를 가져오는데 실패했습니다.');
        }
    }

    /**
     * 통계 데이터를 생성합니다.
     * @private
     * @param {Object} users - 사용자 데이터
     * @param {Object} artworks - 작품 데이터
     * @returns {Object} 통계 데이터
     */
    _createStatsData(users, artworks) {
        // 방문자 통계 데이터 (임시)
        const monthlyVisitorsData = [
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 100) + 50
        ];

        const monthlySumVisitors = monthlyVisitorsData.reduce((a, b) => a + b, 0);

        return {
            totalUsers: users?.total || 0,
            activeExhibitions: 0, // 전시회 도메인 미구현으로 0으로 설정
            totalArtworks: artworks?.total || 0,
            monthlyVisitors: monthlySumVisitors,
            chartData: {
                userGrowth: [10, 15, 20, 25, 30, 35],
                artworkDistribution: [30, 25, 20, 15, 10]
            }
        };
    }

    /**
     * 활동 데이터를 생성합니다.
     * @private
     * @param {Object} users - 사용자 데이터
     * @param {Object} artworks - 작품 데이터
     * @returns {Array} 활동 데이터
     */
    _createActivityData(users, artworks) {
        // 활동 타입별 아이콘 매핑
        const activityIcons = {
            USER_REGISTER: 'fas fa-user-plus',
            ARTWORK_CREATE: 'fas fa-paint-brush',
            ARTWORK_UPDATE: 'fas fa-edit'
        };

        // 최근 사용자 가입 및 작품 추가 데이터 수집
        const recentUsers = users?.items?.slice(0, 3) || [];
        const recentArtworksData = artworks?.items?.slice(0, 3) || [];

        // 최근 활동 데이터 가공
        const recentActivities = [];

        // 최근 사용자 가입 활동 추가
        recentUsers.forEach(user => {
            recentActivities.push({
                type: 'USER_REGISTER',
                message: `새로운 사용자 ${user.name || user.username}님이 등록되었습니다.`,
                timestamp: user.createdAt || new Date()
            });
        });

        // 최근 작품 추가 활동 추가
        recentArtworksData.forEach(artwork => {
            recentActivities.push({
                type: 'ARTWORK_CREATE',
                message: `새 작품 "${artwork.title}"이(가) 등록되었습니다.`,
                timestamp: artwork.createdAt || new Date(Date.now() - 3600000)
            });
        });

        // 활동 시간 기준 정렬
        recentActivities.sort((a, b) => b.timestamp - a.timestamp);

        // 활동 데이터 포맷팅
        return recentActivities.slice(0, 5).map(activity => ({
            icon: activityIcons[activity.type],
            text: activity.message,
            time: TimeFormatter.formatTimeAgo(activity.timestamp)
        }));
    }

    /**
     * 공지사항 데이터를 생성합니다.
     * @private
     * @returns {Array} 공지사항 데이터
     */
    _createNoticeData() {
        // 임시 공지사항 데이터
        return [
            { title: '시스템 점검 안내', date: '2024-03-26', isImportant: true },
            { title: '신규 기능 업데이트', date: '2024-03-25', isImportant: false },
            { title: '전시회 등록 가이드', date: '2024-03-24', isImportant: false }
        ];
    }
}

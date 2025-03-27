import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import UserRepository from '../repositories/UserRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import ArtworkRepository from '../repositories/ArtworkRepository.js';

export default class AdminController {
    constructor() {
        this.userRepository = new UserRepository();
        this.exhibitionRepository = new ExhibitionRepository();
        this.artworkRepository = new ArtworkRepository();
    }

    /**
     * 관리자 대시보드를 렌더링합니다.
     */
    async getDashboard(req, res) {
        try {
            const [users, exhibitions, artworks] = await Promise.all([
                this.userRepository.findAll(),
                this.exhibitionRepository.findExhibitions(),
                this.artworkRepository.findArtworks()
            ]);

            const mockData = {
                totalUsers: users.length,
                activeExhibitions: exhibitions.items.filter(e => new Date(e.end_date) >= new Date()).length,
                totalArtworks: artworks.total,
                recentActivities: [
                    { type: 'USER_REGISTER', message: '새로운 사용자가 등록되었습니다.', timestamp: new Date() },
                    { type: 'EXHIBITION_CREATE', message: '새로운 전시회가 등록되었습니다.', timestamp: new Date() },
                    { type: 'ARTWORK_UPDATE', message: '작품이 수정되었습니다.', timestamp: new Date() }
                ],
                chartData: {
                    userGrowth: [10, 15, 20, 25, 30, 35],
                    exhibitionStats: [5, 8, 12, 15, 18, 20],
                    artworkDistribution: [30, 25, 20, 15, 10]
                }
            };

            ViewResolver.render(res, ViewPath.ADMIN.DASHBOARD, {
                title: '관리자 대시보드',
                breadcrumb: '대시보드',
                currentPage: 'dashboard',
                ...mockData
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 사용자 관리 페이지를 렌더링합니다.
     */
    async getUserManagement(req, res) {
        try {
            const users = await this.userRepository.findAll();
            ViewResolver.render(res, ViewPath.ADMIN.USER.LIST, {
                title: '사용자 관리',
                breadcrumb: '사용자 관리',
                currentPage: 'users',
                users
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 사용자 상세 정보를 렌더링합니다.
     */
    async getUserDetail(req, res) {
        try {
            const user = await this.userRepository.findUserById(req.params.id);
            if (!user) {
                return ViewResolver.renderError(res, new Error('사용자를 찾을 수 없습니다.'));
            }

            ViewResolver.render(res, ViewPath.ADMIN.USER.DETAIL, {
                title: '사용자 상세',
                breadcrumb: '사용자 상세',
                currentPage: 'users',
                user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 시간을 사람이 읽기 쉬운 형식으로 변환합니다.
     */
    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    }
}

import ViewResolver from '../../presentation/view/ViewResolver.js';

export default class AdminController {
    constructor() {
        // 메서드 바인딩
        this.getDashboard = this.getDashboard.bind(this);
        this.getUserManagement = this.getUserManagement.bind(this);
        this.getExhibitionManagement = this.getExhibitionManagement.bind(this);
        this.getArtworkManagement = this.getArtworkManagement.bind(this);
        this.getNoticeManagement = this.getNoticeManagement.bind(this);
    }

    /**
     * 관리자 대시보드 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getDashboard(req, res) {
        try {
            const mockData = {
                title: '대시보드',
                breadcrumb: '대시보드',
                currentPage: 'dashboard',
                stats: {
                    totalUsers: 150,
                    activeExhibitions: 5,
                    totalArtworks: 320,
                    monthlyVisitors: 1200
                },
                recentActivities: [
                    {
                        icon: 'fas fa-user-plus',
                        text: '새로운 회원이 가입했습니다.',
                        time: '5분 전'
                    },
                    {
                        icon: 'fas fa-image',
                        text: '새로운 전시가 등록되었습니다.',
                        time: '1시간 전'
                    },
                    {
                        icon: 'fas fa-palette',
                        text: '새로운 작품이 등록되었습니다.',
                        time: '2시간 전'
                    }
                ],
                recentNotices: [
                    {
                        title: '시스템 점검 안내',
                        date: '2024-03-19'
                    },
                    {
                        title: '3월 전시 일정 안내',
                        date: '2024-03-18'
                    },
                    {
                        title: '신규 작가 모집',
                        date: '2024-03-17'
                    }
                ]
            };

            ViewResolver.render(res, 'admin/AdminDashboard', mockData);
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    async getUserManagement(req, res) {
        try {
            const mockData = {
                title: '회원 관리',
                breadcrumb: '회원 관리',
                currentPage: 'users'
            };

            ViewResolver.render(res, 'admin/management/user/UserManagementList', mockData);
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    async getExhibitionManagement(req, res) {
        try {
            const mockData = {
                title: '전시 관리',
                breadcrumb: '전시 관리',
                currentPage: 'exhibitions'
            };

            ViewResolver.render(res, 'admin/management/exhibition/ExhibitionManagementList', mockData);
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    async getArtworkManagement(req, res) {
        try {
            const mockData = {
                title: '작품 관리',
                breadcrumb: '작품 관리',
                currentPage: 'artworks'
            };

            ViewResolver.render(res, 'admin/management/artwork/ArtworkManagementList', mockData);
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    async getNoticeManagement(req, res) {
        try {
            const mockData = {
                title: '공지사항 관리',
                breadcrumb: '공지사항 관리',
                currentPage: 'notices'
            };

            ViewResolver.render(res, 'admin/management/notice/NoticeManagementList', mockData);
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }
}

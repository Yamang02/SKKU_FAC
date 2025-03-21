class AdminController {
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
            // TODO: 실제 데이터를 서비스에서 가져와야 합니다
            const mockData = {
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
                        date: '2024-03-19',
                        isImportant: true
                    },
                    {
                        title: '3월 전시 일정 안내',
                        date: '2024-03-18',
                        isImportant: false
                    },
                    {
                        title: '신규 작가 모집',
                        date: '2024-03-17',
                        isImportant: false
                    }
                ],
                currentPage: 'dashboard'
            };

            res.render('admin/dashboard/index', mockData);
        } catch (error) {
            console.error('대시보드 조회 중 오류 발생:', error);
            res.status(500).send('서버 오류가 발생했습니다.');
        }
    }

    async getUserManagement(req, res) {
        try {
            res.render('admin/management/user/index', {
                title: '사용자 관리',
                breadcrumb: '사용자 관리',
                currentPage: 'users'
            });
        } catch (error) {
            console.error('사용자 관리 페이지 조회 중 오류 발생:', error);
            res.status(500).send('서버 오류가 발생했습니다.');
        }
    }

    async getExhibitionManagement(req, res) {
        try {
            res.render('admin/management/exhibition/index', {
                title: '전시 관리',
                breadcrumb: '전시 관리',
                currentPage: 'exhibitions'
            });
        } catch (error) {
            console.error('전시 관리 페이지 조회 중 오류 발생:', error);
            res.status(500).send('서버 오류가 발생했습니다.');
        }
    }

    async getArtworkManagement(req, res) {
        try {
            res.render('admin/management/artwork/index', {
                title: '작품 관리',
                breadcrumb: '작품 관리',
                currentPage: 'artworks'
            });
        } catch (error) {
            console.error('작품 관리 페이지 조회 중 오류 발생:', error);
            res.status(500).send('서버 오류가 발생했습니다.');
        }
    }

    async getNoticeManagement(req, res) {
        try {
            res.render('admin/management/notice/index', {
                title: '공지사항 관리',
                breadcrumb: '공지사항 관리',
                currentPage: 'notices'
            });
        } catch (error) {
            console.error('공지사항 관리 페이지 조회 중 오류 발생:', error);
            res.status(500).send('서버 오류가 발생했습니다.');
        }
    }
}

export default AdminController;

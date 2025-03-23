import SessionUtil from '../util/SessionUtil.js';
import ProfileViewDto from '../../domain/user/dto/view/ProfileViewDto.js';

class UserController {
    /**
     * UserController 생성자
     * @param {UserUseCase} userUseCase - 유저 유스케이스
     * @param {ArtworkUseCase} artworkUseCase - 작품 유스케이스
     * @param {CommentUseCase} commentUseCase - 댓글 유스케이스
     */
    constructor(userUseCase, artworkUseCase, commentUseCase) {
        this.userUseCase = userUseCase;
        this.artworkUseCase = artworkUseCase;
        this.commentUseCase = commentUseCase;

        // 메서드 바인딩
        this.getLoginPage = this.getLoginPage.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.getRegisterPage = this.getRegisterPage.bind(this);
        this.register = this.register.bind(this);
        this.getProfilePage = this.getProfilePage.bind(this);
        this.getProfileEditPage = this.getProfileEditPage.bind(this);
        this.updateProfile = this.updateProfile.bind(this);

        // 관리 기능 바인딩
        this.getUserList = this.getUserList.bind(this);
        this.getUserDetail = this.getUserDetail.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.updateUserRole = this.updateUserRole.bind(this);
        this.getDashboardStats = this.getDashboardStats.bind(this);
    }

    getLoginPage(req, res) {
        const redirectUrl = req.query.redirect || '/';
        res.render('user/Login', {
            title: '로그인',
            redirectUrl
        });
    }

    async login(req, res) {
        try {
            const { username, password, redirectUrl } = req.body;
            const user = await this.userUseCase.login(username, password);
            await SessionUtil.saveUserToSession(req, user);
            res.redirect(redirectUrl || '/');
        } catch (error) {
            res.render('user/Login', {
                error: error.message,
                username: req.body.username,
                redirectUrl: req.body.redirectUrl
            });
        }
    }

    async logout(req, res) {
        await SessionUtil.destroySession(req);
        res.redirect('/');
    }

    getRegisterPage(req, res) {
        res.render('user/Register', {
            title: '회원가입',
            roles: [
                { value: 'CLUB_MEMBER', label: '동아리 회원' },
                { value: 'ARTIST', label: '외부 작가' },
                { value: 'GUEST', label: '일반 사용자' }
            ]
        });
    }

    async register(req, res) {
        try {
            await this.userUseCase.register(req.body);
            res.redirect('/user/login');
        } catch (error) {
            res.render('user/Register', {
                error: error.message,
                formData: req.body
            });
        }
    }

    async getProfilePage(req, res) {
        try {
            // 로그인 체크
            if (!req.session.user) {
                return res.redirect('/user/login');
            }

            try {
                // 사용자 정보 조회
                const user = await this.userUseCase.getProfile(req.session.user.id);

                // 사용자 정보가 없는 경우 처리
                if (!user) {
                    return res.status(404).render('error', {
                        error: '사용자를 찾을 수 없습니다.'
                    });
                }

                // ViewDto 생성
                const viewDto = new ProfileViewDto({
                    user,
                    artworks: [], // 작품 목록 제거
                    comments: [] // 댓글 목록 제거
                });

                const viewData = viewDto.toView();

                return res.render('user/Profile', {
                    title: viewData.title || '프로필',
                    user: viewData.user
                });

            } catch (error) {
                console.error('데이터 조회 중 오류:', error);
                return res.status(500).render('error', {
                    error: '프로필 페이지를 불러오는 중 오류가 발생했습니다.'
                });
            }
        } catch (error) {
            console.error('프로필 페이지 로드 중 오류:', error);
            return res.status(500).render('error', {
                error: '프로필 페이지를 불러오는 중 오류가 발생했습니다.'
            });
        }
    }

    async getProfileEditPage(req, res) {
        try {
            // 로그인 체크
            if (!req.session.user) {
                console.log('로그인되지 않은 사용자의 프로필 수정 페이지 접근');
                return res.redirect('/user/login');
            }

            console.log('프로필 수정 페이지 요청:', {
                userId: req.session.user.id,
                sessionData: req.session
            });

            const profileUser = await this.userUseCase.getProfile(req.session.user.id);
            console.log('조회된 사용자 정보:', profileUser);

            if (!profileUser) {
                console.error('사용자 정보를 찾을 수 없음:', req.session.user.id);
                return res.status(404).render('error', {
                    error: '사용자를 찾을 수 없습니다.'
                });
            }

            return res.render('user/ProfileEdit', {
                title: '프로필 수정',
                user: profileUser,
                error: null
            });
        } catch (error) {
            console.error('프로필 수정 페이지 로드 중 오류:', {
                error: error.message,
                stack: error.stack,
                userId: req.session?.user?.id
            });

            return res.status(500).render('error', {
                error: process.env.NODE_ENV === 'development'
                    ? `프로필 수정 페이지를 불러오는 중 오류가 발생했습니다: ${error.message}`
                    : '프로필 수정 페이지를 불러오는 중 오류가 발생했습니다.',
                stack: process.env.NODE_ENV === 'development' ? error.stack : null
            });
        }
    }

    async updateProfile(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/user/login');
            }

            await this.userUseCase.updateProfile(req.session.user.id, req.body);
            res.redirect('/user/profile');
        } catch (error) {
            console.error('프로필 수정 중 오류:', error);
            const profileUser = await this.userUseCase.getProfile(req.session.user.id);
            res.render('user/ProfileEdit', {
                title: '프로필 수정',
                user: profileUser,
                error: error.message
            });
        }
    }

    async getUserList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                role: req.query.role,
                search: req.query.search
            };

            const result = await this.userUseCase.getUserList(page, limit, filters);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json(result);
            }

            res.render('user/management/list', {
                title: '사용자 관리',
                currentPage: 'users',
                ...result
            });
        } catch (error) {
            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }

    async getUserDetail(req, res) {
        try {
            const userId = req.params.id;
            const user = await this.userUseCase.getProfile(userId);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json(user);
            }

            res.render('user/management/detail', {
                title: '사용자 상세',
                currentPage: 'users',
                user
            });
        } catch (error) {
            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            await this.userUseCase.deleteUser(userId);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json({ success: true });
            }

            res.redirect('/user/management');
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(400).json({ error: error.message });
            }

            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }

    async updateUserRole(req, res) {
        try {
            const userId = req.params.id;
            const { role } = req.body;
            const user = await this.userUseCase.updateUserRole(userId, role);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json(user);
            }

            res.redirect(`/user/management/${userId}`);
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(400).json({ error: error.message });
            }

            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }

    async getDashboardStats(req, res) {
        try {
            const stats = await this.userUseCase.getUserStats();

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json(stats);
            }

            res.render('user/management/dashboard', {
                title: '사용자 통계',
                currentPage: 'users',
                stats
            });
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(400).json({ error: error.message });
            }

            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }
}

export default UserController;

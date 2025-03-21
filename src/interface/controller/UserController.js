import UserApplicationService from '../../application/user/service/UserApplicationService.js';
import UserRepositoryImpl from '../../infrastructure/repository/UserRepositoryImpl.js';
import { UserRole } from '../../infrastructure/data/user.js';

class UserController {
    constructor() {
        const userRepository = new UserRepositoryImpl();
        this.userApplicationService = new UserApplicationService(userRepository);

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
        res.render('user/Login', {
            title: '로그인'
        });
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await this.userApplicationService.login(username, password);

            req.session.user = user;
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            res.redirect('/');
        } catch (error) {
            res.render('user/Login', {
                error: error.message,
                username: req.body.username
            });
        }
    }

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/');
        });
    }

    getRegisterPage(req, res) {
        res.render('user/Register', {
            title: '회원가입',
            roles: [
                { value: UserRole.CLUB_MEMBER, label: '동아리 회원' },
                { value: UserRole.ARTIST, label: '외부 작가' },
                { value: UserRole.GUEST, label: '일반 사용자' }
            ]
        });
    }

    async register(req, res) {
        try {
            await this.userApplicationService.register(req.body);
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
            const profileUser = await this.userApplicationService.getProfile(req.session.user.id);
            res.render('user/Profile', {
                title: '프로필',
                profileUser
            });
        } catch (error) {
            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }

    async getProfileEditPage(req, res) {
        try {
            const profileUser = await this.userApplicationService.getProfile(req.session.user.id);
            res.render('user/ProfileEdit', {
                title: '프로필 수정',
                profileUser
            });
        } catch (error) {
            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }

    async updateProfile(req, res) {
        try {
            await this.userApplicationService.updateProfile(req.session.user.id, req.body);
            res.redirect('/user/profile');
        } catch (error) {
            const profileUser = await this.userApplicationService.getProfile(req.session.user.id);
            res.render('user/ProfileEdit', {
                title: '프로필 수정',
                profileUser,
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

            const result = await this.userApplicationService.getUserList(page, limit, filters);

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
            const user = await this.userApplicationService.getProfile(userId);

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
            await this.userApplicationService.deleteUser(userId);

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
            const user = await this.userApplicationService.updateUserRole(userId, role);

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
            const stats = await this.userApplicationService.getUserStats();

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

import viewResolver from '../../../presentation/view/ViewResolver.js';
import UserRepositoryImpl from '../../../infrastructure/repository/UserRepositoryImpl.js';
import { UserRole } from '../../../infrastructure/data/user.js';
import UserService from '../service/UserService.js';

/**
 * 사용자 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
// 나중에 UserService가 구현되면 추가할 예정
// import userService from '../service/UserService.js';

class UserController {
    constructor() {
        const userRepository = new UserRepositoryImpl();
        this.userService = new UserService(userRepository);

        // 메서드 바인딩
        this.getLoginPage = this.getLoginPage.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.getRegisterPage = this.getRegisterPage.bind(this);
        this.register = this.register.bind(this);
        this.getProfilePage = this.getProfilePage.bind(this);
        this.getProfileEditPage = this.getProfileEditPage.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    /**
     * 로그인 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    getLoginPage = (req, res) => {
        return viewResolver.render(res, 'user/Login', {
            title: '로그인'
        });
    };

    /**
     * 로그인 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    login = async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await this.userService.login(username, password);

            // 세션에 사용자 정보 저장
            req.session.user = user;

            // 세션 저장이 완료되었는지 확인
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            res.redirect('/');
        } catch (error) {
            return viewResolver.render(res, 'user/Login', {
                error: error.message,
                username: req.body.username
            });
        }
    };

    /**
     * 로그아웃 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    logout = (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/');
        });
    };

    /**
     * 회원가입 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    getRegisterPage = (req, res) => {
        return viewResolver.render(res, 'user/Register', {
            title: '회원가입',
            roles: [
                { value: UserRole.CLUB_MEMBER, label: '동아리 회원' },
                { value: UserRole.ARTIST, label: '외부 작가' },
                { value: UserRole.GUEST, label: '일반 사용자' }
            ]
        });
    };

    /**
     * 회원가입 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    register = async (req, res) => {
        try {
            await this.userService.register(req.body);
            res.redirect('/user/login');
        } catch (error) {
            return viewResolver.render(res, 'user/Register', {
                error: error.message,
                formData: req.body
            });
        }
    };

    /**
     * 프로필 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    getProfilePage = async (req, res) => {
        try {
            const profileUser = await this.userService.getProfile(req.session.user.id);
            return viewResolver.render(res, 'user/Profile', {
                title: '프로필',
                profileUser
            });
        } catch (error) {
            return viewResolver.render(res, 'common/error', {
                title: '에러',
                message: error.message
            });
        }
    };

    /**
     * 프로필 수정 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    getProfileEditPage = async (req, res) => {
        try {
            const profileUser = await this.userService.getProfile(req.session.user.id);
            return viewResolver.render(res, 'user/ProfileEdit', {
                title: '프로필 수정',
                profileUser
            });
        } catch (error) {
            return viewResolver.render(res, 'common/error', {
                title: '에러',
                message: error.message
            });
        }
    };

    /**
     * 프로필 수정 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    updateProfile = async (req, res) => {
        try {
            await this.userService.updateProfile(req.session.user.id, req.body);
            res.redirect('/user/profile');
        } catch (error) {
            const profileUser = await this.userService.getProfile(req.session.user.id);
            return viewResolver.render(res, 'user/ProfileEdit', {
                title: '프로필 수정',
                profileUser,
                error: error.message
            });
        }
    };

    // 인증 미들웨어
    isAuthenticated(req, res, next) {
        if (req.session.user) {
            next();
        } else {
            req.session.returnTo = req.originalUrl;
            return viewResolver.render(res, 'user/Login', {
                error: '로그인이 필요한 서비스입니다.',
                returnTo: req.originalUrl
            });
        }
    }

    // 특정 역할 확인 미들웨어
    hasRole(role) {
        return (req, res, next) => {
            if (req.session.user && req.session.user.role === role) {
                next();
            } else {
                return viewResolver.render(res, 'common/error', {
                    title: '접근 제한',
                    message: '접근 권한이 없습니다.'
                });
            }
        };
    }
}

export default UserController;

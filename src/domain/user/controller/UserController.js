import viewResolver from '../../../presentation/view/ViewResolver.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepositoryImpl from '../../../infrastructure/repository/UserRepositoryImpl.js';
import { UserRole } from '../../../infrastructure/data/user.js';

/**
 * 사용자 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
// 나중에 UserService가 구현되면 추가할 예정
// import userService from '../service/UserService.js';

class UserController {
    constructor() {
        this.userRepository = new UserRepositoryImpl();

        // 메서드 바인딩
        this.getLoginPage = this.getLoginPage.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.getRegisterPage = this.getRegisterPage.bind(this);
        this.register = this.register.bind(this);
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
            const { username, password, remember } = req.body;

            const user = await this.userRepository.findByUsername(username);

            if (!user) {
                return viewResolver.render(res, 'user/Login', {
                    error: '존재하지 않는 아이디입니다.',
                    username
                });
            }

            // 비밀번호 검증
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return viewResolver.render(res, 'user/Login', {
                    error: '비밀번호가 일치하지 않습니다.',
                    username
                });
            }

            // JWT 토큰 생성
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    name: user.name
                },
                process.env.JWT_SECRET,
                { expiresIn: remember ? '7d' : '1d' }
            );

            // 세션에 사용자 정보 저장
            req.session.user = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                email: user.email
            };

            // 쿠키에 토큰 저장
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
            });

            // 홈페이지로 리다이렉트
            res.redirect('/');
        } catch (error) {
            console.error('Login error:', error);
            return viewResolver.render(res, 'user/Login', {
                error: '로그인 처리 중 오류가 발생했습니다.'
            });
        }
    };

    /**
     * 로그아웃 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    logout = (req, res) => {
        req.session.destroy();
        res.clearCookie('auth_token');
        res.redirect('/');
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
            const {
                username,
                password,
                confirmPassword,
                name,
                email,
                role,
                studentId,
                artistInfo
            } = req.body;

            // 비밀번호 확인
            if (password !== confirmPassword) {
                return viewResolver.render(res, 'user/Register', {
                    error: '비밀번호가 일치하지 않습니다.',
                    formData: { username, name, email, role, studentId }
                });
            }

            // 비밀번호 해시화
            const hashedPassword = await bcrypt.hash(password, 10);

            // 사용자 데이터 준비
            const userData = {
                username,
                password: hashedPassword,
                name,
                email,
                role: role || UserRole.GUEST,
                studentId: role === UserRole.CLUB_MEMBER ? studentId : null,
                artistInfo: role === UserRole.ARTIST ? JSON.parse(artistInfo) : null
            };

            // 사용자 저장
            await this.userRepository.save(userData);

            // 로그인 페이지로 리다이렉트
            res.redirect('/user/login');
        } catch (error) {
            console.error('Register error:', error);
            return viewResolver.render(res, 'user/Register', {
                error: error.message || '회원가입 처리 중 오류가 발생했습니다.',
                formData: req.body
            });
        }
    };
}

export default UserController;

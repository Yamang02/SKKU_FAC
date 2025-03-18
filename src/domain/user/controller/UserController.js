import viewResolver from '../../../presentation/view/ViewResolver.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepositoryImpl from '../../../infrastructure/repository/UserRepositoryImpl.js';

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
        return viewResolver.render(res, 'user/Login');
    };

    /**
     * 로그인 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    login = async (req, res) => {
        try {
            const { studentId, password, remember } = req.body;

            const user = await this.userRepository.findByStudentId(studentId);

            if (!user) {
                return viewResolver.render(res, 'user/Login', {
                    error: '존재하지 않는 학번입니다.'
                });
            }

            // 비밀번호 검증
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return viewResolver.render(res, 'user/Login', {
                    error: '비밀번호가 일치하지 않습니다.'
                });
            }

            // JWT 토큰 생성
            const token = jwt.sign(
                { id: user.id, studentId: user.studentId },
                process.env.JWT_SECRET,
                { expiresIn: remember ? '7d' : '1d' }
            );

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
        res.clearCookie('auth_token');
        res.redirect('/');
    };

    /**
     * 회원가입 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    getRegisterPage = (req, res) => {
        return viewResolver.render(res, 'user/Register');
    };

    /**
     * 회원가입 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    register = async (req, res) => {
        try {
            const { name, email, password, confirmPassword } = req.body;

            // 비밀번호 확인
            if (password !== confirmPassword) {
                return viewResolver.render(res, 'user/Register', {
                    error: '비밀번호가 일치하지 않습니다.',
                    user: { name, email }
                });
            }

            // TODO: 회원가입 로직 구현

            res.redirect('/user/login');
        } catch (error) {
            console.error('Register error:', error);
            return viewResolver.render(res, 'user/Register', {
                error: '회원가입 처리 중 오류가 발생했습니다.'
            });
        }
    };
}

export default UserController;

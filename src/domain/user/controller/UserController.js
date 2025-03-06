/**
 * 사용자 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
// 나중에 UserService가 구현되면 추가할 예정
// const userService = require('../service/UserService');

class UserController {
    /**
     * 로그인 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static getLoginPage(req, res) {
        res.render('users/login', {
            title: '로그인'
        });
    }

    /**
     * 로그인 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static login(req, res) {
        try {
            const { username, password } = req.body;
            
            // 로그인 처리 로직 추가 필요
            // const user = userService.authenticate(username, password);
            
            // if (!user) {
            //     return res.render('users/login', {
            //         title: '로그인',
            //         error: '아이디 또는 비밀번호가 올바르지 않습니다.'
            //     });
            // }
            
            // req.session.user = user;
            res.redirect('/');
        } catch (error) {
            console.error('로그인 오류:', error);
            res.status(500).render('error', { 
                message: '로그인 처리 중 오류가 발생했습니다.' 
            });
        }
    }

    /**
     * 로그아웃 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static logout(req, res) {
        // req.session.destroy();
        res.redirect('/');
    }

    /**
     * 회원가입 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static getRegisterPage(req, res) {
        res.render('users/register', {
            title: '회원가입'
        });
    }

    /**
     * 회원가입 요청을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static register(req, res) {
        try {
            const { username, password, email } = req.body;
            
            // 회원가입 처리 로직 추가 필요
            // const result = userService.register(username, password, email);
            
            // if (!result.success) {
            //     return res.render('users/register', {
            //         title: '회원가입',
            //         error: result.message
            //     });
            // }
            
            res.redirect('/user/login');
        } catch (error) {
            console.error('회원가입 오류:', error);
            res.status(500).render('error', { 
                message: '회원가입 처리 중 오류가 발생했습니다.' 
            });
        }
    }
}

module.exports = UserController; 
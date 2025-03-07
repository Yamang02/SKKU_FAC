/**
 * 사용자 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
// 나중에 UserService가 구현되면 추가할 예정
// import userService from '../service/UserService.js';

/**
 * 로그인 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getLoginPage(req, res) {
    res.render('users/login', {
        title: '로그인'
    });
}

/**
 * 로그인 요청을 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function login(req, res) {
    try {
        const { email } = req.body;
        
        // 로그인 로직 추가 필요
        // const user = userService.authenticateUser(email, password);
        
        // 임시 로그인 처리 (실제 구현에서는 데이터베이스 인증 필요)
        req.session.user = {
            id: 1,
            email: email,
            name: '사용자',
            role: 'user'
        };
        
        res.redirect('/');
    } catch (error) {
        // console.error('로그인 처리 오류:', error);
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
export function logout(req, res) {
    req.session.destroy(err => {
        if (err) {
            // console.error('로그아웃 처리 오류:', err);
        }
        res.redirect('/');
    });
}

/**
 * 회원가입 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getRegisterPage(req, res) {
    res.render('users/register', {
        title: '회원가입'
    });
}

/**
 * 회원가입 요청을 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function register(req, res) {
    try {
        const { name, email, password, confirmPassword } = req.body;
        
        // 비밀번호 확인
        if (password !== confirmPassword) {
            return res.render('users/register', {
                title: '회원가입',
                error: '비밀번호가 일치하지 않습니다.',
                user: { name, email }
            });
        }
        
        // 회원가입 로직 추가 필요
        // const user = userService.registerUser(name, email, password);
        
        res.redirect('/user/login');
    } catch (error) {
        // console.error('회원가입 처리 오류:', error);
        res.status(500).render('error', { 
            message: '회원가입 처리 중 오류가 발생했습니다.' 
        });
    }
} 
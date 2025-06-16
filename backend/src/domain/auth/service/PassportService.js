import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
// Google OAuth 제거됨
import UserService from '../../user/service/UserService.js';

/**
 * Passport.js 인증 전략 서비스
 */
export default class PassportService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['UserService'];

    constructor(userService = null) {
        // 의존성 주입 방식 (새로운 방식)
        if (userService) {
            this.userService = userService;
        } else {
            // 기존 방식 호환성 유지 (임시)

            this.userService = new UserService();
        }
        this.initializeStrategies();
    }

    /**
     * 모든 Passport 전략 초기화
     */
    initializeStrategies() {
        this.initializeLocalStrategy();
        // Google OAuth 제거됨
        this.initializeSerializeUser();
    }

    /**
     * 로컬 전략 (이메일/비밀번호) 초기화
     */
    initializeLocalStrategy() {
        passport.use(
            'local',
            new LocalStrategy(
                {
                    usernameField: 'email', // email을 username으로 사용
                    passwordField: 'password',
                    passReqToCallback: true
                },
                async (req, email, password, done) => {
                    try {
                        // 사용자 인증
                        const user = await this.userService.authenticateUser(email, password);

                        if (!user) {
                            return done(null, false, {
                                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
                            });
                        }

                        // 계정 활성화 확인
                        if (!user.isActive) {
                            return done(null, false, {
                                message: '계정이 비활성화되어 있습니다. 관리자에게 문의하세요.'
                            });
                        }

                        return done(null, user);
                    } catch (error) {
                        console.error('로컬 인증 오류:', error);
                        return done(error, false, {
                            message: '로그인 처리 중 오류가 발생했습니다.'
                        });
                    }
                }
            )
        );
    }

    // Google OAuth 제거됨

    /**
     * 사용자 직렬화/역직렬화 설정
     */
    initializeSerializeUser() {
        // 세션에 사용자 ID만 저장
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        // 세션에서 사용자 ID로 전체 사용자 정보 복원
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await this.userService.getUserById(id);
                if (!user) {
                    return done(new Error('사용자를 찾을 수 없습니다.'), null);
                }
                done(null, user);
            } catch (error) {
                console.error('사용자 역직렬화 오류:', error);
                done(error, null);
            }
        });
    }

    /**
     * Passport 인스턴스 반환
     */
    getPassport() {
        return passport;
    }

    /**
     * 로컬 인증 미들웨어
     */
    authenticateLocal(req, res, next) {
        return passport.authenticate('local', {
            failureRedirect: '/auth/login',
            failureFlash: true,
            successReturnToOrRedirect: '/'
        })(req, res, next);
    }

    // Google 인증 메서드 제거됨
}

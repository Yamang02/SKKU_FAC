import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserService from '../../user/service/UserService.js';
import config from '../../../config/index.js';

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
            // TODO: 모든 도메인 리팩토링 완료 후 제거 예정
            this.userService = new UserService();
        }
        this.initializeStrategies();
    }

    /**
     * 모든 Passport 전략 초기화
     */
    initializeStrategies() {
        this.initializeLocalStrategy();
        this.initializeGoogleStrategy();
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

    /**
     * Google OAuth 전략 초기화
     */
    initializeGoogleStrategy() {
        const googleConfig = config.get('oauth.google', {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
        });

        if (googleConfig.clientID && googleConfig.clientSecret) {
            passport.use(
                'google',
                new GoogleStrategy(
                    {
                        clientID: googleConfig.clientID,
                        clientSecret: googleConfig.clientSecret,
                        callbackURL: googleConfig.callbackURL,
                        scope: ['profile', 'email']
                    },
                    async (accessToken, refreshToken, profile, done) => {
                        try {
                            // Google 프로필에서 사용자 정보 추출
                            const googleUser = {
                                googleId: profile.id,
                                email: profile.emails?.[0]?.value,
                                username: profile.displayName,
                                firstName: profile.name?.givenName,
                                lastName: profile.name?.familyName,
                                profileImage: profile.photos?.[0]?.value
                            };

                            if (!googleUser.email) {
                                return done(new Error('Google 계정에서 이메일을 가져올 수 없습니다.'), null);
                            }

                            // 기존 사용자 확인
                            const user = await this.userService.getUserByEmail(googleUser.email);

                            if (user) {
                                // 기존 사용자의 Google 연동 정보 업데이트
                                if (!user.googleId) {
                                    await this.userService.linkGoogleAccount(user.id, googleUser.googleId);
                                }
                                return done(null, user);
                            } else {
                                // 새 사용자 생성 (Google 계정으로 회원가입)
                                const newUser = await this.userService.createGoogleUser(googleUser);
                                return done(null, newUser);
                            }
                        } catch (error) {
                            console.error('Google OAuth 오류:', error);
                            return done(error, null);
                        }
                    }
                )
            );
        } else {
            console.warn('⚠️ Google OAuth 설정이 누락되어 Google 전략을 건너뜁니다.');
        }
    }

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

    /**
     * Google 인증 시작 미들웨어
     */
    authenticateGoogle() {
        return passport.authenticate('google', {
            scope: ['profile', 'email']
        });
    }

    /**
     * Google 인증 콜백 미들웨어
     */
    authenticateGoogleCallback(req, res, next) {
        return passport.authenticate('google', {
            failureRedirect: '/auth/login',
            failureFlash: true,
            successReturnToOrRedirect: '/'
        })(req, res, next);
    }
}

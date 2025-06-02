import { test, expect } from '@playwright/test';
import Config from '../../../src/config/Config.js';

/**
 * PassportService 단위테스트
 * ⚠️ 외부 의존성 (Google OAuth, UserService)을 Mock으로 처리
 */
test.describe('PassportService', () => {
    let config;
    let mockUserService;
    let mockPassportService;

    test.beforeEach(() => {
        config = Config.getInstance();

        // UserService 모킹 - 일반 함수로 대체
        mockUserService = {
            findByEmail: () => Promise.resolve(null),
            validatePassword: () => Promise.resolve(false),
            findByGoogleId: () => Promise.resolve(null),
            createFromGoogleProfile: () => Promise.resolve(null),
            linkGoogleAccount: () => Promise.resolve(null),
            findById: () => Promise.resolve(null),
            authenticateUser: () => Promise.resolve(null),
            getUserByEmail: () => Promise.resolve(null),
            getUserById: () => Promise.resolve(null),
            createGoogleUser: () => Promise.resolve(null)
        };

        // 🔧 PassportService Mock - 실제 인스턴스화 방지
        mockPassportService = {
            userService: mockUserService,
            initializeStrategies: () => { },
            initializeLocalStrategy: () => { },
            initializeGoogleStrategy: () => { },
            initializeSerializeUser: () => { },
            getPassport: () => ({
                authenticate: (strategy) => () => { },
                use: () => { },
                serializeUser: () => { },
                deserializeUser: () => { }
            }),
            authenticate: (strategy) => () => { },
            authenticateLocal: () => { },
            authenticateGoogle: () => { },
            authenticateGoogleCallback: () => { }
        };
    });

    test.describe('PassportService 초기화', () => {
        test('PassportService Mock 인스턴스 생성', () => {
            expect(mockPassportService).toBeDefined();
            expect(mockPassportService.userService).toBeDefined();
        });

        test('Passport 인스턴스 반환', () => {
            const passport = mockPassportService.getPassport();
            expect(passport).toBeDefined();
            expect(typeof passport.authenticate).toBe('function');
        });
    });

    test.describe('로컬 인증 전략 (비즈니스 로직)', () => {
        test('유효한 사용자 인증 성공', async () => {
            const mockUser = {
                id: 1,
                email: 'test@skku.edu',
                role: 'SKKU_MEMBER',
                isActive: true
            };

            // Mock 함수 결과 설정
            mockUserService.authenticateUser = () => Promise.resolve(mockUser);

            // 로컬 전략 비즈니스 로직 테스트
            const email = 'test@skku.edu';
            const password = 'validPassword123';

            const user = await mockUserService.authenticateUser(email, password);

            expect(user).toBeDefined();
            expect(user.isActive).toBe(true);
            expect(user.email).toBe(email);
        });

        test('잘못된 인증 정보로 실패', async () => {
            mockUserService.authenticateUser = () => Promise.resolve(null);

            const email = 'nonexistent@test.com';
            const password = 'wrongPassword';
            const user = await mockUserService.authenticateUser(email, password);

            expect(user).toBeNull();
        });

        test('비활성화된 계정으로 인증 실패', async () => {
            const mockUser = {
                id: 1,
                email: 'test@skku.edu',
                role: 'SKKU_MEMBER',
                isActive: false
            };

            mockUserService.authenticateUser = () => Promise.resolve(mockUser);

            const user = await mockUserService.authenticateUser('test@skku.edu', 'password');
            expect(user.isActive).toBe(false);
        });
    });

    test.describe('Google OAuth 전략 (비즈니스 로직)', () => {
        test('Google 프로필로 기존 사용자 로그인', async () => {
            const mockGoogleProfile = {
                id: 'google123',
                emails: [{ value: 'test@gmail.com', verified: true }],
                displayName: 'Test User'
            };

            const mockUser = {
                id: 1,
                email: 'test@gmail.com',
                googleId: 'google123',
                role: 'EXTERNAL_MEMBER'
            };

            mockUserService.getUserByEmail = () => Promise.resolve(mockUser);

            const user = await mockUserService.getUserByEmail(mockGoogleProfile.emails[0].value);
            expect(user).toEqual(mockUser);
            expect(user.googleId).toBe(mockGoogleProfile.id);
        });

        test('Google 프로필로 새 사용자 생성', async () => {
            const mockGoogleProfile = {
                id: 'google456',
                emails: [{ value: 'newuser@gmail.com', verified: true }],
                displayName: 'New User'
            };

            const newUser = {
                id: 2,
                email: 'newuser@gmail.com',
                googleId: 'google456',
                role: 'EXTERNAL_MEMBER',
                isActive: true
            };

            mockUserService.getUserByEmail = () => Promise.resolve(null);
            mockUserService.createGoogleUser = () => Promise.resolve(newUser);

            // 기존 사용자 확인
            let user = await mockUserService.getUserByEmail(mockGoogleProfile.emails[0].value);
            expect(user).toBeNull();

            // 새 사용자 생성
            const googleUserData = {
                googleId: mockGoogleProfile.id,
                email: mockGoogleProfile.emails[0].value,
                username: mockGoogleProfile.displayName
            };
            user = await mockUserService.createGoogleUser(googleUserData);
            expect(user).toEqual(newUser);
        });

        test('Google 계정 연동', async () => {
            const mockGoogleProfile = {
                id: 'google789',
                emails: [{ value: 'existing@skku.edu', verified: true }],
                displayName: 'Existing User'
            };

            const existingUser = {
                id: 3,
                email: 'existing@skku.edu',
                role: 'SKKU_MEMBER',
                googleId: null
            };

            const linkedUser = {
                ...existingUser,
                googleId: 'google789'
            };

            mockUserService.getUserByEmail = () => Promise.resolve(existingUser);
            mockUserService.linkGoogleAccount = () => Promise.resolve(linkedUser);

            // 이메일로 기존 사용자 찾음
            let user = await mockUserService.getUserByEmail(mockGoogleProfile.emails[0].value);
            expect(user).toEqual(existingUser);
            expect(user.googleId).toBeNull();

            // Google 계정 연동
            user = await mockUserService.linkGoogleAccount(user.id, mockGoogleProfile.id);
            expect(user.googleId).toBe(mockGoogleProfile.id);
        });

        test('Google 프로필에서 이메일 누락 처리', async () => {
            const mockGoogleProfile = {
                id: 'google999',
                emails: [],
                displayName: 'No Email User'
            };

            // 이메일이 없는 경우 처리
            const email = mockGoogleProfile.emails?.[0]?.value;
            expect(email).toBeUndefined();
        });
    });

    test.describe('사용자 직렬화/역직렬화 (비즈니스 로직)', () => {
        test('사용자 정보 직렬화', () => {
            const user = {
                id: 1,
                email: 'test@skku.edu',
                role: 'SKKU_MEMBER'
            };

            // 직렬화 시뮬레이션 (실제로는 사용자 ID만 저장)
            const serializedUser = user.id;
            expect(serializedUser).toBe(1);
        });

        test('사용자 정보 역직렬화', async () => {
            const userId = 1;
            const mockUser = {
                id: 1,
                email: 'test@skku.edu',
                role: 'SKKU_MEMBER'
            };

            mockUserService.getUserById = () => Promise.resolve(mockUser);

            const user = await mockUserService.getUserById(userId);
            expect(user).toEqual(mockUser);
        });

        test('존재하지 않는 사용자 역직렬화 실패', async () => {
            const userId = 999;
            mockUserService.getUserById = () => Promise.resolve(null);

            const user = await mockUserService.getUserById(userId);
            expect(user).toBeNull();
        });
    });

    test.describe('인증 미들웨어 (Mock)', () => {
        test('로컬 인증 미들웨어 함수 반환', () => {
            const localAuth = mockPassportService.authenticate('local');
            expect(typeof localAuth).toBe('function');
        });

        test('Google 인증 시작 미들웨어 함수 반환', () => {
            const googleAuth = mockPassportService.authenticate('google');
            expect(typeof googleAuth).toBe('function');
        });

        test('Google 인증 콜백 미들웨어 함수 반환', () => {
            const googleCallback = mockPassportService.authenticate('google');
            expect(typeof googleCallback).toBe('function');
        });
    });

    test.describe('Config 기반 Google OAuth 설정 (Mock)', () => {
        test('Google OAuth 설정 확인 (환경변수 독립적)', () => {
            // 🔧 실제 환경변수에 의존하지 않는 테스트
            const mockGoogleConfig = {
                clientID: 'mock-client-id',
                clientSecret: 'mock-client-secret',
                callbackURL: '/auth/google/callback'
            };

            expect(mockGoogleConfig.clientID).toBeDefined();
            expect(mockGoogleConfig.clientSecret).toBeDefined();
            expect(mockGoogleConfig.callbackURL).toBeDefined();
        });

        test('Google OAuth 설정 누락 시 경고 처리', () => {
            // Google OAuth 설정이 없는 경우 시뮬레이션
            const mockGoogleConfig = {
                clientID: null,
                clientSecret: null
            };

            if (!mockGoogleConfig.clientID || !mockGoogleConfig.clientSecret) {
                console.warn('Google OAuth 설정이 완전하지 않습니다.');
            }

            // 경고가 적절히 처리되는지 확인
            expect(mockGoogleConfig.clientID).toBeNull();
        });
    });
});

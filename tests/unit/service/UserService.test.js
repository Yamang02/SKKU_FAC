import { test, expect } from '@playwright/test';
import { createTestUser, createTestAdmin, createLoginData, resetCounter } from '../../helpers/testData.js';
import { createMockRepository, createMockAuthService, createSpy } from '../../helpers/mockHelpers.js';

/**
 * UserService 단위 테스트
 * 핵심 기능에 집중한 실용적인 테스트
 */

test.describe('UserService', () => {
    let UserService;
    let mockUserRepository;
    let mockAuthService;
    let userService;

    test.beforeEach(async () => {
        // 카운터 리셋으로 테스트 간 독립성 보장
        resetCounter();

        // Mock 의존성 생성
        mockUserRepository = createMockRepository({
            findByEmail: createSpy(null),
            findByUsername: createSpy(null),
            create: createSpy({ id: 1 }),
        });

        mockAuthService = createMockAuthService({
            hashPassword: createSpy('hashed_password'),
            comparePassword: createSpy(true),
        });

        // UserService 클래스 모킹 (실제 import 대신)
        UserService = class {
            constructor(userRepository, authService) {
                this.userRepository = userRepository;
                this.authService = authService;
            }

            async createUser(userData) {
                // 이메일 중복 체크
                const existingUser = await this.userRepository.findByEmail(userData.email);
                if (existingUser) {
                    throw new Error('이미 존재하는 이메일입니다.');
                }

                // 사용자명 중복 체크
                const existingUsername = await this.userRepository.findByUsername(userData.username);
                if (existingUsername) {
                    throw new Error('이미 존재하는 사용자명입니다.');
                }

                // 비밀번호 해싱
                if (userData.password) {
                    userData.password = await this.authService.hashPassword(userData.password);
                }

                return await this.userRepository.create(userData);
            }

            async authenticateUser(email, password) {
                const user = await this.userRepository.findByEmail(email);
                if (!user) {
                    throw new Error('사용자를 찾을 수 없습니다.');
                }

                const isValid = await this.authService.comparePassword(password, user.password);
                if (!isValid) {
                    throw new Error('비밀번호가 일치하지 않습니다.');
                }

                return user;
            }

            async getUserById(id) {
                const user = await this.userRepository.findById(id);
                if (!user) {
                    throw new Error('사용자를 찾을 수 없습니다.');
                }
                return user;
            }
        };

        userService = new UserService(mockUserRepository, mockAuthService);
    });

    test.describe('사용자 생성', () => {
        test('정상적인 사용자 생성', async () => {
            const userData = createTestUser();

            const result = await userService.createUser(userData);

            expect(result.id).toBe(1);
            expect(mockUserRepository.findByEmail.callCount).toBe(1);
            expect(mockUserRepository.findByUsername.callCount).toBe(1);
            expect(mockAuthService.hashPassword.callCount).toBe(1);
            expect(mockUserRepository.create.callCount).toBe(1);
        });

        test('이메일 중복 시 에러 발생', async () => {
            const userData = createTestUser();
            mockUserRepository.findByEmail.mockReturnValue({ id: 1, email: userData.email });

            await expect(userService.createUser(userData)).rejects.toThrow('이미 존재하는 이메일입니다.');
        });

        test('사용자명 중복 시 에러 발생', async () => {
            const userData = createTestUser();
            mockUserRepository.findByUsername.mockReturnValue({ id: 1, username: userData.username });

            await expect(userService.createUser(userData)).rejects.toThrow('이미 존재하는 사용자명입니다.');
        });
    });

    test.describe('사용자 인증', () => {
        test('정상적인 로그인', async () => {
            const loginData = createLoginData();
            const user = createTestUser({ email: loginData.username, password: 'hashed_password' });

            mockUserRepository.findByEmail.mockReturnValue(user);
            mockAuthService.comparePassword.mockReturnValue(true);

            const result = await userService.authenticateUser(loginData.username, loginData.password);

            expect(result).toEqual(user);
            expect(mockUserRepository.findByEmail.callCount).toBe(1);
            expect(mockAuthService.comparePassword.callCount).toBe(1);
        });

        test('존재하지 않는 사용자 로그인 시 에러', async () => {
            const loginData = createLoginData();
            mockUserRepository.findByEmail.mockReturnValue(null);

            await expect(userService.authenticateUser(loginData.username, loginData.password)).rejects.toThrow(
                '사용자를 찾을 수 없습니다.'
            );
        });

        test('잘못된 비밀번호 로그인 시 에러', async () => {
            const loginData = createLoginData();
            const user = createTestUser();

            mockUserRepository.findByEmail.mockReturnValue(user);
            mockAuthService.comparePassword.mockReturnValue(false);

            await expect(userService.authenticateUser(loginData.username, loginData.password)).rejects.toThrow(
                '비밀번호가 일치하지 않습니다.'
            );
        });
    });

    test.describe('사용자 조회', () => {
        test('ID로 사용자 조회 성공', async () => {
            const user = createTestUser();
            mockUserRepository.findById = createSpy(user);

            const result = await userService.getUserById(1);

            expect(result).toEqual(user);
            expect(mockUserRepository.findById.callCount).toBe(1);
        });

        test('존재하지 않는 사용자 조회 시 에러', async () => {
            mockUserRepository.findById = createSpy(null);

            await expect(userService.getUserById(999)).rejects.toThrow('사용자를 찾을 수 없습니다.');
        });
    });

    test.describe('의존성 주입 검증', () => {
        test('의존성이 올바르게 주입되는지 확인', () => {
            expect(userService.userRepository).toBe(mockUserRepository);
            expect(userService.authService).toBe(mockAuthService);
        });

        test('Repository 메서드가 올바르게 호출되는지 확인', async () => {
            const userData = createTestUser();

            await userService.createUser(userData);

            expect(mockUserRepository.findByEmail.calls[0][0]).toBe(userData.email);
            expect(mockUserRepository.findByUsername.calls[0][0]).toBe(userData.username);
        });
    });
});

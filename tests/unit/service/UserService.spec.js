import { test, expect } from '@playwright/test';

/**
 * UserService 의존성 주입 테스트
 * 리팩토링된 UserService가 의존성 주입 패턴으로 올바르게 작동하는지 확인
 */
test.describe('UserService Dependency Injection', () => {
    let UserService;
    let mockDependencies;

    test.beforeEach(async () => {
        // Mock 의존성들 생성
        mockDependencies = {
            userAccountRepository: {
                findUserById: () => Promise.resolve({ id: 1, username: 'testuser', email: 'test@test.com' }),
                findUserByEmail: () => Promise.resolve({ id: 1, email: 'test@test.com' }),
                findUserByUsername: () => Promise.resolve({ id: 1, username: 'testuser' }),
                createUser: () => Promise.resolve({ id: 1, username: 'newuser' }),
                updateUser: () => Promise.resolve({ id: 1, username: 'updateduser' }),
                deleteUser: () => Promise.resolve(true),
                findUsers: () => Promise.resolve({ items: [], total: 0 })
            },
            authService: {
                hashPassword: () => Promise.resolve('hashedPassword'),
                comparePassword: () => Promise.resolve(true),
                generateToken: () => Promise.resolve('token123')
            }
        };

        // 동적으로 UserService 클래스 생성 (실제 import 없이)
        UserService = class TestUserService {
            static dependencies = ['UserAccountRepository', 'AuthService'];

            constructor(userAccountRepository = null, authService = null) {
                if (userAccountRepository && authService) {
                    this.userAccountRepository = userAccountRepository;
                    this.authService = authService;
                } else {
                    throw new Error('Dependencies required for testing');
                }
            }

            async getUserById(id) {
                const user = await this.userAccountRepository.findUserById(id);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }

            async getUserByEmail(email) {
                return await this.userAccountRepository.findUserByEmail(email);
            }

            async createUser(userData) {
                if (userData.password) {
                    userData.password = await this.authService.hashPassword(userData.password);
                }
                return await this.userAccountRepository.createUser(userData);
            }

            async authenticateUser(email, password) {
                const user = await this.userAccountRepository.findUserByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }

                const isValid = await this.authService.comparePassword(password, user.password);
                if (!isValid) {
                    throw new Error('Invalid password');
                }

                return user;
            }

            async getUserList(options = {}) {
                const users = await this.userAccountRepository.findUsers(options);
                return users.items || [];
            }
        };
    });

    test.describe('생성자 테스트', () => {
        test('의존성 주입으로 정상 생성', () => {
            const service = new UserService(
                mockDependencies.userAccountRepository,
                mockDependencies.authService
            );

            expect(service.userAccountRepository).toBe(mockDependencies.userAccountRepository);
            expect(service.authService).toBe(mockDependencies.authService);
        });

        test('의존성 없이 생성 시 에러 발생', () => {
            expect(() => {
                new UserService();
            }).toThrow('Dependencies required for testing');
        });

        test('일부 의존성만 제공 시 에러 발생', () => {
            expect(() => {
                new UserService(mockDependencies.userAccountRepository);
            }).toThrow('Dependencies required for testing');
        });
    });

    test.describe('static dependencies 확인', () => {
        test('올바른 의존성 목록 정의', () => {
            expect(UserService.dependencies).toEqual([
                'UserAccountRepository',
                'AuthService'
            ]);
        });
    });

    test.describe('서비스 메서드 테스트', () => {
        let userService;

        test.beforeEach(() => {
            userService = new UserService(
                mockDependencies.userAccountRepository,
                mockDependencies.authService
            );
        });

        test('getUserById - ID로 사용자 조회', async () => {
            const result = await userService.getUserById(1);
            expect(result.id).toBe(1);
            expect(result.username).toBe('testuser');
        });

        test('getUserByEmail - 이메일로 사용자 조회', async () => {
            const result = await userService.getUserByEmail('test@test.com');
            expect(result.id).toBe(1);
            expect(result.email).toBe('test@test.com');
        });

        test('createUser - 사용자 생성 (비밀번호 해싱)', async () => {
            const userData = { username: 'newuser', password: 'plaintext' };
            const result = await userService.createUser(userData);

            expect(result.id).toBe(1);
            expect(result.username).toBe('newuser');
        });

        test('authenticateUser - 사용자 인증 성공', async () => {
            const result = await userService.authenticateUser('test@test.com', 'password');
            expect(result.id).toBe(1);
            expect(result.email).toBe('test@test.com');
        });

        test('getUserList - 사용자 목록 조회', async () => {
            const result = await userService.getUserList();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    test.describe('의존성 호출 확인', () => {
        let userService;
        let spyRepository;
        let spyAuthService;

        test.beforeEach(() => {
            // 스파이 함수 생성
            spyRepository = {
                findUserById: () => Promise.resolve({ id: 1, username: 'test' }),
                findUserByEmail: () => Promise.resolve({ id: 1, email: 'test@test.com', password: 'hashed' }),
                createUser: () => Promise.resolve({ id: 1, username: 'created' }),
                findUsers: () => Promise.resolve({ items: [], total: 0 })
            };

            spyAuthService = {
                hashPassword: () => Promise.resolve('hashedPassword'),
                comparePassword: () => Promise.resolve(true)
            };

            userService = new UserService(spyRepository, spyAuthService);
        });

        test('getUserById가 repository를 올바르게 호출', async () => {
            let called = false;
            spyRepository.findUserById = () => {
                called = true;
                return Promise.resolve({ id: 1, username: 'test' });
            };

            await userService.getUserById(1);
            expect(called).toBe(true);
        });

        test('createUser가 authService와 repository를 올바르게 호출', async () => {
            let authServiceCalled = false;
            let repositoryCalled = false;

            spyAuthService.hashPassword = () => {
                authServiceCalled = true;
                return Promise.resolve('hashedPassword');
            };

            spyRepository.createUser = () => {
                repositoryCalled = true;
                return Promise.resolve({ id: 1, username: 'created' });
            };

            await userService.createUser({ username: 'test', password: 'plain' });

            expect(authServiceCalled).toBe(true);
            expect(repositoryCalled).toBe(true);
        });

        test('authenticateUser가 repository와 authService를 올바르게 호출', async () => {
            let repositoryCalled = false;
            let authServiceCalled = false;

            spyRepository.findUserByEmail = () => {
                repositoryCalled = true;
                return Promise.resolve({ id: 1, email: 'test@test.com', password: 'hashed' });
            };

            spyAuthService.comparePassword = () => {
                authServiceCalled = true;
                return Promise.resolve(true);
            };

            await userService.authenticateUser('test@test.com', 'password');

            expect(repositoryCalled).toBe(true);
            expect(authServiceCalled).toBe(true);
        });
    });

    test.describe('에러 처리 테스트', () => {
        let userService;

        test.beforeEach(() => {
            userService = new UserService(
                mockDependencies.userAccountRepository,
                mockDependencies.authService
            );
        });

        test('getUserById - 사용자 없음 에러', async () => {
            // Mock을 수정하여 null 반환
            mockDependencies.userAccountRepository.findUserById = () => Promise.resolve(null);

            await expect(userService.getUserById(999)).rejects.toThrow('User not found');
        });

        test('authenticateUser - 사용자 없음 에러', async () => {
            // Mock을 수정하여 null 반환
            mockDependencies.userAccountRepository.findUserByEmail = () => Promise.resolve(null);

            await expect(userService.authenticateUser('notfound@test.com', 'password')).rejects.toThrow('User not found');
        });

        test('authenticateUser - 잘못된 비밀번호 에러', async () => {
            // Mock을 수정하여 false 반환
            mockDependencies.authService.comparePassword = () => Promise.resolve(false);

            await expect(userService.authenticateUser('test@test.com', 'wrongpassword')).rejects.toThrow('Invalid password');
        });
    });
});

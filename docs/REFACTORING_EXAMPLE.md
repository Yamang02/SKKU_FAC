# UserService 의존성 주입 리팩토링 예제

SKKU 미술동아리 갤러리 프로젝트에서 실제 UserService를 의존성 주입 방식으로 리팩토링하는 구체적인 예제입니다.

## 📋 현재 상황 분석

### Before: 기존 UserService 구조

```javascript
// src/domain/user/service/UserService.js
import UserRepository from '../../../infrastructure/db/repository/UserAccountRepository.js';
import AuthService from '../../auth/service/AuthService.js';

export default class UserService {
    constructor() {
        this.userRepository = new UserRepository();     // 🔴 직접 생성
        this.authService = new AuthService();           // 🔴 직접 생성
    }

    async createUser(userRequestDTO) {
        // 메서드 내부에서도 직접 생성
        const authService = new AuthService();          // 🔴 또 다른 직접 생성
        await authService.createEmailVerificationToken(/* ... */);
        // ...
    }

    // ... 기타 메서드들
}
```

### 문제점 분석

1. **강한 결합도**: UserService가 구체적인 구현체에 직접 의존
2. **테스트 어려움**: Mock 객체 주입이 불가능
3. **중복 인스턴스**: 메서드 내부에서 AuthService를 또 생성
4. **순환 의존성 위험**: 의존성 관계가 명확하지 않음
5. **설정 변경 어려움**: 다른 구현체로 교체하기 어려움

## 🔄 리팩토링 단계

### 1단계: UserService 의존성 주입 적용

```javascript
// src/domain/user/service/UserService.js
import UserRequestDto from '../model/dto/UserRequestDto.js';
import UserSimpleDto from '../model/dto/UserSimpleDto.js';
import UserDetailDto from '../model/dto/UserDetailDto.js';
import { UserNotFoundError, UserEmailDuplicateError, UserUsernameDuplicateError } from '../../../common/error/UserError.js';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';
import bcrypt from 'bcrypt';
import Page from '../../common/model/Page.js';
import logger from '../../../common/utils/Logger.js';

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리합니다.
 */
export default class UserService {
    // ✅ 의존성 명시적 선언
    static dependencies = ['UserRepository', 'AuthService'];

    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    /**
     * 새로운 사용자를 생성합니다.
     */
    async createUser(userRequestDTO) {
        // 이메일 중복 확인
        const existingEmailUser = await this.getUserByEmail(userRequestDTO.email);
        if (existingEmailUser) {
            throw new UserEmailDuplicateError();
        }

        // 사용자명 중복 확인
        const existingUsernameUser = await this.getUserByUsername(userRequestDTO.username);
        if (existingUsernameUser) {
            throw new UserUsernameDuplicateError();
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(userRequestDTO.password, 10);

        // Id 생성
        const userId = generateDomainUUID(DOMAINS.USER);
        const skkuUserId = generateDomainUUID(DOMAINS.SKKU_USER);
        const externalUserId = generateDomainUUID(DOMAINS.EXTERNAL_USER);

        // 사용자 데이터 구성
        const userDto = new UserRequestDto({
            ...userRequestDTO,
            id: userId,
            skkuUserId,
            externalUserId,
            password: hashedPassword,
            emailVerified: false,
            status: 'PENDING'
        });

        const createdUser = await this.userRepository.createUser(userDto);

        // ✅ 주입받은 AuthService 사용 (중복 제거)
        try {
            await this.authService.createEmailVerificationToken(createdUser.id, createdUser.email);
        } catch (emailError) {
            logger.error('이메일 전송 실패', emailError);
            throw new Error('인증 이메일 전송에 실패했습니다. 관리자에게 문의하세요');
        }

        const userSimpleDto = new UserSimpleDto(createdUser);
        return userSimpleDto;
    }

    // ... 나머지 메서드들은 동일
}
```

### 2단계: 의존성 컨테이너 설정 파일 생성

```javascript
// src/config/container.js
import { defaultContainer } from '../common/container/index.js';

// Repository 등록
import UserRepository from '../infrastructure/db/repository/UserAccountRepository.js';
defaultContainer.registerSingleton('UserRepository', UserRepository);

// Service 등록 (AuthService도 의존성 주입 방식으로 변경 필요)
import AuthService from '../domain/auth/service/AuthService.js';
defaultContainer.registerSingleton('AuthService', AuthService);

// UserService를 자동 와이어링으로 등록
import UserService from '../domain/user/service/UserService.js';
defaultContainer.registerAutoWired('UserService', UserService, 'singleton');

// 다른 서비스들도 동일하게 등록...
// import ArtworkService from '../domain/artwork/service/ArtworkService.js';
// defaultContainer.registerAutoWired('ArtworkService', ArtworkService, 'singleton');

export { defaultContainer as container };
```

### 3단계: 컨트롤러 수정

```javascript
// src/domain/user/controller/UserController.js
import { container } from '../../../config/container.js';
import UserRequestDto from '../model/dto/UserRequestDto.js';

export default class UserController {
    constructor() {
        // ✅ 컨테이너에서 서비스 해결
        this.userService = container.resolve('UserService');
    }

    /**
     * 사용자 생성
     */
    async createUser(req, res) {
        try {
            const userDto = new UserRequestDto(req.body);
            const user = await this.userService.createUser(userDto);

            res.status(201).json({
                success: true,
                data: user,
                message: '사용자가 성공적으로 생성되었습니다.'
            });
        } catch (error) {
            logger.error(`사용자 생성 실패: ${error.message}`, error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // ... 기타 메서드들
}
```

### 4단계: 애플리케이션 시작 시 컨테이너 초기화

```javascript
// src/app.js
import express from 'express';
import './config/container.js'; // ✅ 컨테이너 설정 로드

// ... 기타 import들

const app = express();

// ... 미들웨어 설정

// 라우터 등록
import userRoutes from './domain/user/routes/userRoutes.js';
app.use('/api/users', userRoutes);

export default app;
```

## 🧪 테스트에서의 활용

### 단위 테스트 예제

```javascript
// test/unit/UserService.test.js
import { Container } from '../../src/common/container/index.js';
import UserService from '../../src/domain/user/service/UserService.js';
import { UserEmailDuplicateError } from '../../src/common/error/UserError.js';

describe('UserService', () => {
    let container;
    let userService;
    let mockUserRepository;
    let mockAuthService;

    beforeEach(() => {
        // ✅ 각 테스트마다 새로운 컨테이너 생성
        container = new Container();

        // Mock 의존성 생성
        mockUserRepository = {
            findUserByEmail: jest.fn(),
            findUserByUsername: jest.fn(),
            createUser: jest.fn(),
            findUserById: jest.fn()
        };

        mockAuthService = {
            createEmailVerificationToken: jest.fn()
        };

        // Mock 의존성 등록
        container.register('UserRepository', mockUserRepository);
        container.register('AuthService', mockAuthService);

        // ✅ 자동 와이어링으로 테스트 대상 생성
        userService = container.autoWire(UserService);
    });

    describe('createUser', () => {
        test('이메일 중복 시 UserEmailDuplicateError 발생', async () => {
            // Given
            const userRequestDto = {
                email: 'test@skku.edu',
                username: 'testuser',
                password: 'password123'
            };

            mockUserRepository.findUserByEmail.mockResolvedValue({ id: 1 }); // 기존 사용자 존재

            // When & Then
            await expect(userService.createUser(userRequestDto))
                .rejects.toThrow(UserEmailDuplicateError);

            expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith('test@skku.edu');
        });

        test('정상적인 사용자 생성', async () => {
            // Given
            const userRequestDto = {
                email: 'new@skku.edu',
                username: 'newuser',
                password: 'password123',
                name: 'Test User'
            };

            mockUserRepository.findUserByEmail.mockResolvedValue(null);
            mockUserRepository.findUserByUsername.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue({
                id: 'user_123',
                email: 'new@skku.edu',
                username: 'newuser'
            });
            mockAuthService.createEmailVerificationToken.mockResolvedValue();

            // When
            const result = await userService.createUser(userRequestDto);

            // Then
            expect(result).toBeDefined();
            expect(mockUserRepository.createUser).toHaveBeenCalled();
            expect(mockAuthService.createEmailVerificationToken).toHaveBeenCalled();
        });
    });
});
```

### 통합 테스트 예제

```javascript
// test/integration/UserController.test.js
import request from 'supertest';
import app from '../../src/app.js';
import { container } from '../../src/config/container.js';

describe('User API Integration Tests', () => {
    let mockUserRepository;

    beforeEach(() => {
        // ✅ 통합 테스트에서 특정 의존성만 Mock으로 교체
        mockUserRepository = {
            findUserByEmail: jest.fn(),
            findUserByUsername: jest.fn(),
            createUser: jest.fn()
        };

        // 실제 컨테이너의 의존성을 Mock으로 교체
        container.register('UserRepository', mockUserRepository);
    });

    test('POST /api/users - 사용자 생성 성공', async () => {
        // Given
        mockUserRepository.findUserByEmail.mockResolvedValue(null);
        mockUserRepository.findUserByUsername.mockResolvedValue(null);
        mockUserRepository.createUser.mockResolvedValue({
            id: 'user_123',
            email: 'test@skku.edu',
            username: 'testuser'
        });

        // When & Then
        const response = await request(app)
            .post('/api/users')
            .send({
                email: 'test@skku.edu',
                username: 'testuser',
                password: 'password123',
                name: 'Test User'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });
});
```

## 📊 마이그레이션 체크리스트

### Phase 1: 기본 구조 변경
- [ ] UserService에 static dependencies 추가
- [ ] 생성자를 의존성 주입 방식으로 변경
- [ ] 메서드 내부의 직접 인스턴스 생성 제거

### Phase 2: 컨테이너 설정
- [ ] container.js 설정 파일 생성
- [ ] 모든 의존성을 컨테이너에 등록
- [ ] 라이프사이클 적절히 설정 (singleton/transient)

### Phase 3: 컨트롤러 수정
- [ ] UserController에서 컨테이너 사용
- [ ] 다른 컨트롤러들도 동일하게 수정

### Phase 4: 테스트 코드 작성
- [ ] 단위 테스트에서 Mock 의존성 사용
- [ ] 통합 테스트 설정

### Phase 5: 점진적 확장
- [ ] AuthService도 의존성 주입 방식으로 변경
- [ ] ArtworkService, ExhibitionService 등 다른 서비스들도 동일하게 적용

## 🎯 기대 효과

### 1. 테스트 가능성 향상
```javascript
// Before: 테스트하기 어려움
const userService = new UserService(); // 실제 DB 연결 필요

// After: 쉬운 테스트
const userService = container.autoWire(UserService); // Mock 의존성 사용 가능
```

### 2. 유연한 구성
```javascript
// 개발 환경
container.registerSingleton('UserRepository', UserRepository);

// 테스트 환경
container.registerSingleton('UserRepository', MockUserRepository);

// 다른 구현체로 쉽게 교체
container.registerSingleton('UserRepository', CachedUserRepository);
```

### 3. 순환 의존성 감지
```javascript
// 컨테이너가 자동으로 감지하고 에러 발생
// A → B → A 같은 순환 참조를 런타임에 감지
```

### 4. 메모리 효율성
```javascript
// 싱글톤으로 등록된 서비스는 앱 전체에서 하나의 인스턴스만 사용
// 불필요한 객체 생성 방지
```

---

이 리팩토링을 통해 UserService의 테스트 가능성, 유지보수성, 확장성이 크게 향상됩니다.

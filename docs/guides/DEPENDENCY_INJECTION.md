# 의존성 주입 컨테이너 가이드

SKKU 미술동아리 갤러리 프로젝트의 의존성 주입 컨테이너 사용 가이드입니다.

## 📋 목차

- [개요](#개요)
- [기본 사용법](#기본-사용법)
- [라이프사이클 관리](#라이프사이클-관리)
- [자동 와이어링](#자동-와이어링)
- [팩토리 패턴](#팩토리-패턴)
- [실제 사용 예제](#실제-사용-예제)
- [모범 사례](#모범-사례)

## 개요

의존성 주입 컨테이너는 클래스 간의 결합도를 낮추고 테스트 가능성을 향상시키기 위해 구현되었습니다.

### 주요 기능

- ✅ **기본 등록/해결**: 클래스와 값을 키로 등록하고 해결
- ✅ **라이프사이클 관리**: 싱글톤과 트랜지언트 지원
- ✅ **자동 와이어링**: static dependencies를 통한 자동 의존성 주입
- ✅ **팩토리 패턴**: 복잡한 객체 생성 로직 지원
- ✅ **순환 참조 감지**: 의존성 순환 참조 자동 감지 및 에러
- ✅ **선택적 의존성**: optional 의존성 지원

## 기본 사용법

### 1. 컨테이너 import

```javascript
import { Container, defaultContainer, LIFECYCLE } from '../common/container/index.js';

// 새 컨테이너 생성
const container = new Container();

// 또는 기본 컨테이너 사용
// const container = defaultContainer;
```

### 2. 기본 등록 및 해결

```javascript
// 값 등록
container.register('databaseUrl', 'mysql://localhost:3306/gallery');

// 클래스 등록
class UserRepository {
    constructor() {
        this.dbUrl = container.resolve('databaseUrl');
    }
}

container.register('UserRepository', UserRepository);

// 해결
const userRepo = container.resolve('UserRepository');
```

## 라이프사이클 관리

### 싱글톤 (Singleton)

```javascript
// 방법 1: 명시적 라이프사이클 지정
container.register('UserService', UserService, LIFECYCLE.SINGLETON);

// 방법 2: 편의 메서드 사용
container.registerSingleton('UserService', UserService);

// 항상 같은 인스턴스 반환
const service1 = container.resolve('UserService');
const service2 = container.resolve('UserService');
console.log(service1 === service2); // true
```

### 트랜지언트 (Transient)

```javascript
// 방법 1: 기본값 (생략 가능)
container.register('UserService', UserService, LIFECYCLE.TRANSIENT);

// 방법 2: 편의 메서드 사용
container.registerTransient('UserService', UserService);

// 항상 새로운 인스턴스 반환
const service1 = container.resolve('UserService');
const service2 = container.resolve('UserService');
console.log(service1 === service2); // false
```

## 자동 와이어링

### 클래스 정의

```javascript
class UserRepository {
    constructor() {
        this.name = 'UserRepository';
    }

    findById(id) {
        return { id, name: 'User' + id };
    }
}

class AuthService {
    constructor() {
        this.name = 'AuthService';
    }

    authenticate(user) {
        return true;
    }
}

class UserService {
    // 의존성 명시적 선언 (중요!)
    static dependencies = ['UserRepository', 'AuthService'];

    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    getUser(id) {
        const user = this.userRepository.findById(id);
        if (this.authService.authenticate(user)) {
            return user;
        }
        throw new Error('Authentication failed');
    }
}
```

### 컨테이너 등록 및 사용

```javascript
// 의존성들을 먼저 등록
container.registerSingleton('UserRepository', UserRepository);
container.registerSingleton('AuthService', AuthService);

// 자동 와이어링으로 등록
container.registerAutoWired('UserService', UserService, LIFECYCLE.SINGLETON);

// 또는 직접 autoWire 사용
const userService = container.autoWire(UserService);
const user = userService.getUser(1);
```

### 선택적 의존성

```javascript
class NotificationService {
    static dependencies = [
        'LoggerService',
        { key: 'EmailService', optional: true }  // 선택적 의존성
    ];

    constructor(loggerService, emailService = null) {
        this.loggerService = loggerService;
        this.emailService = emailService;
    }

    notify(message) {
        this.loggerService.log(message);

        if (this.emailService) {
            this.emailService.send(message);
        }
    }
}
```

## 팩토리 패턴

복잡한 객체 생성 로직이 필요한 경우 팩토리 패턴을 사용합니다.

```javascript
// 팩토리 함수 등록
container.registerFactory('DatabaseConnection', (container) => {
    const config = container.resolve('DatabaseConfig');
    const logger = container.resolve('Logger');

    // 복잡한 초기화 로직
    const connection = new DatabaseConnection(config);
    connection.setLogger(logger);
    connection.connect();

    return connection;
});

// 사용
const dbConnection = container.resolve('DatabaseConnection');
```

## 실제 사용 예제

### 기존 UserService 리팩토링

**Before (기존 방식):**

```javascript
export default class UserService {
    constructor() {
        this.userRepository = new UserRepository();      // 직접 생성
        this.authService = new AuthService();            // 직접 생성
    }

    // ... 비즈니스 로직
}
```

**After (의존성 주입 사용):**

```javascript
export default class UserService {
    static dependencies = ['UserRepository', 'AuthService'];

    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    // ... 비즈니스 로직 (동일)
}
```

### 컨테이너 설정 (app.js 또는 별도 파일)

```javascript
import { defaultContainer } from './src/common/container/index.js';
import UserRepository from './src/infrastructure/db/repository/UserAccountRepository.js';
import AuthService from './src/domain/auth/service/AuthService.js';
import UserService from './src/domain/user/service/UserService.js';

// 기본 의존성들 등록
defaultContainer.registerSingleton('UserRepository', UserRepository);
defaultContainer.registerSingleton('AuthService', AuthService);

// 서비스들 등록
defaultContainer.registerAutoWired('UserService', UserService, 'singleton');

// 컨테이너를 전역으로 export
export { defaultContainer as container };
```

### 컨트롤러에서 사용

```javascript
import { container } from '../../../containerSetup.js';

export default class UserController {
    constructor() {
        this.userService = container.resolve('UserService');
    }

    async createUser(req, res) {
        try {
            const userDto = new UserRequestDto(req.body);
            const user = await this.userService.createUser(userDto);
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
```

## 모범 사례

### 1. 의존성 선언

```javascript
// ✅ 좋은 예: static dependencies 명시적 선언
class UserService {
    static dependencies = ['UserRepository', 'AuthService'];
    constructor(userRepository, authService) { /* ... */ }
}

// ❌ 나쁜 예: static dependencies 없이 autoWire 사용 불가
class UserService {
    constructor(userRepository, authService) { /* ... */ }
}
```

### 2. 라이프사이클 선택

```javascript
// ✅ 상태가 없는 서비스는 싱글톤
container.registerSingleton('UserService', UserService);

// ✅ 상태가 있거나 요청별로 다른 인스턴스가 필요한 경우 트랜지언트
container.registerTransient('UserRequest', UserRequest);
```

### 3. 인터페이스 분리

```javascript
// ✅ 좋은 예: 작은 의존성들
class UserService {
    static dependencies = ['UserRepository', 'EmailService', 'Logger'];
    // ...
}

// ❌ 피해야 할 예: 너무 많은 의존성 (5개 이상)
class UserService {
    static dependencies = [
        'UserRepository', 'EmailService', 'Logger',
        'CacheService', 'ValidationService', 'AuditService',
        'NotificationService', 'ConfigService'
    ];
    // ...
}
```

### 4. 테스트에서의 활용

```javascript
describe('UserService', () => {
    let container;
    let userService;

    beforeEach(() => {
        container = new Container();

        // Mock 의존성 등록
        const mockUserRepository = {
            findById: jest.fn().mockReturnValue({ id: 1, name: 'Test User' })
        };
        const mockAuthService = {
            authenticate: jest.fn().mockReturnValue(true)
        };

        container.register('UserRepository', mockUserRepository);
        container.register('AuthService', mockAuthService);

        // 테스트 대상 생성
        userService = container.autoWire(UserService);
    });

    test('should get user successfully', () => {
        const user = userService.getUser(1);
        expect(user.name).toBe('Test User');
    });
});
```

### 5. 에러 처리

```javascript
// 의존성이 등록되지 않은 경우
try {
    const service = container.resolve('NonExistentService');
} catch (error) {
    console.error('Service not found:', error.message);
}

// 순환 참조가 감지된 경우
try {
    const serviceA = container.resolve('ServiceA');
} catch (error) {
    if (error.message.includes('Circular dependency')) {
        console.error('Circular dependency detected:', error.message);
    }
}
```

## 주의사항

1. **static dependencies 필수**: 자동 와이어링을 사용하려면 반드시 `static dependencies` 속성을 정의해야 합니다.

2. **순환 참조 주의**: A → B → A 같은 순환 참조는 자동으로 감지되어 에러가 발생합니다.

3. **의존성 등록 순서**: 의존성을 해결하기 전에 반드시 등록되어 있어야 합니다.

4. **선택적 의존성**: `{ key: 'ServiceName', optional: true }` 형태로만 선택적 의존성을 지정할 수 있습니다.

5. **테스트 격리**: 테스트에서는 별도의 컨테이너 인스턴스를 생성하여 사용하세요.

---

이 가이드를 따라 의존성 주입 컨테이너를 효과적으로 활용하여 유지보수성과 테스트 가능성이 높은 코드를 작성할 수 있습니다.

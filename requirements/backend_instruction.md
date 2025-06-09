# SKKU Gallery 백엔드 개발 가이드

## 프로젝트 개요
SKKU 미술동아리 갤러리는 성균관대학교 순수 미술 동아리 전시의 예술 작품을 전시하고 관리하는 웹 플랫폼입니다. Docker 기반 개발환경과 Railway 배포를 통해 안정적인 서비스를 제공합니다.

## 기술 스택

### 핵심 기술
- **Runtime**: Node.js 22.13.0 + ECMAScript 모듈(ESM)
- **Framework**: Express.js + TypeScript 지원
- **Database**: MySQL + Sequelize ORM
- **Authentication**: Session 기반 + JWT 토큰
- **Storage**: Cloudinary (이미지 스토리지)
- **Cache**: Redis (세션 스토어 + 캐싱)

### 아키텍처 패턴
- **의존성 주입**: tsyringe 기반 DI Container
- **도메인 중심 설계**: DDD 원칙 적용
- **중앙집중식 설정**: Config 클래스 + joi 검증
- **구조화된 로깅**: Winston + Railway 최적화
- **중앙화된 에러 처리**: BaseError + ErrorHandler

### 보안 및 성능
- **보안**: helmet + CSP + express-rate-limit
- **암호화**: bcrypt (비밀번호) + AES-256-GCM (환경변수)
- **성능**: Import Maps + Redis 캐싱 + compression

## 현재 프로젝트 구조

```
SKKU_FAC_GALLERY/
├── src/                              # 소스 코드 루트
│   ├── server.js                     # 서버 진입점
│   ├── app.js                        # Express 애플리케이션 설정
│   ├── config/                       # 설정 관리
│   │   ├── Config.js                 # 중앙 설정 클래스
│   │   └── database.js               # DB 설정
│   ├── common/                       # 공통 유틸리티
│   │   ├── di/                       # 의존성 주입
│   │   │   ├── container.js          # DI Container
│   │   │   └── ServiceRegistry.js    # 서비스 레지스트리
│   │   ├── error/                    # 에러 처리
│   │   │   ├── BaseError.js          # 기본 에러 클래스
│   │   │   └── ErrorHandler.js       # 중앙 에러 핸들러
│   │   └── logging/                  # 로깅 시스템
│   │       └── Logger.js             # Winston 로거
│   ├── domain/                       # 도메인별 구성요소
│   │   ├── admin/                    # 관리자 도메인
│   │   ├── artwork/                  # 작품 도메인
│   │   ├── auth/                     # 인증 도메인
│   │   ├── exhibition/               # 전시회 도메인
│   │   │   ├── controller/           # 컨트롤러 레이어
│   │   │   ├── model/                # 모델 레이어
│   │   │   └── service/              # 서비스 레이어
│   │   ├── home/                     # 홈 도메인
│   │   ├── image/                    # 이미지 도메인
│   │   └── user/                     # 사용자 도메인
│   ├── infrastructure/               # 인프라 계층
│   │   ├── cloudinary/               # Cloudinary 통합
│   │   ├── cache/                    # Redis 캐시
│   │   └── database/                 # 데이터베이스
│   │       ├── models/               # Sequelize 모델
│   │       └── repositories/         # 레포지토리 패턴
│   ├── public/                       # 정적 파일
│   └── views/                        # EJS 뷰 템플릿
├── docker-compose.yml                # Docker 개발 환경
├── Dockerfile.dev                    # Docker 이미지
├── railway.json                      # Railway 배포 설정
├── docker_development_guide.md       # Docker 개발 가이드
└── railway_deployment_guide.md       # Railway 배포 가이드
```

## 개발 환경 설정

### Docker 기반 개발
```bash
# 개발 환경 시작
npm run dev

# 컨테이너 내부 접속
npm run dev:shell

# 로그 확인
npm run dev:logs

# 환경 정리
npm run dev:clean
```

### Import Maps 시스템
```javascript
// package.json에 정의된 절대 경로 사용
import { Config } from '#config/Config.js';
import { Logger } from '#common/logging/Logger.js';
import { container } from '#common/di/container.js';
```

## 아키텍처 가이드

### 1. 의존성 주입 사용법
```javascript
// 서비스 등록
import { container } from '#common/di/container.js';
import { ExhibitionService } from './ExhibitionService.js';

container.register('ExhibitionService', { useClass: ExhibitionService });

// 컨트롤러에서 주입 받기
export class ExhibitionController {
    constructor() {
        this.exhibitionService = container.resolve('ExhibitionService');
        this.logger = container.resolve('Logger');
    }
}
```

### 2. 설정 관리
```javascript
// Config 클래스 사용
import { Config } from '#config/Config.js';

const config = Config.getInstance();
const dbConfig = config.get('database');
const emailConfig = config.get('email');
```

### 3. 로깅 시스템
```javascript
// 구조화된 로그 작성
import { Logger } from '#common/logging/Logger.js';

const logger = Logger.getInstance();

logger.info('사용자 로그인 성공', {
    userId: user.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
});

logger.error('데이터베이스 연결 실패', {
    error: error.message,
    query: failedQuery
});
```

### 4. 에러 처리
```javascript
// BaseError 상속
import { BaseError } from '#common/error/BaseError.js';

export class ValidationError extends BaseError {
    constructor(message, field) {
        super(message, 400, true);
        this.field = field;
    }
}

// 컨트롤러에서 사용
throw new ValidationError('이메일 형식이 올바르지 않습니다', 'email');
```

### 5. 데이터베이스 레포지토리 패턴
```javascript
// 레포지토리 인터페이스
export class ExhibitionRepository {
    async findById(id) {
        return await Exhibition.findByPk(id);
    }

    async findActive() {
        return await Exhibition.findAll({
            where: { status: 'ACTIVE' }
        });
    }
}
```

## 개발 규칙

### 코드 구조
- **MVC 패턴**: Controller → Service → Repository → Model
- **도메인 분리**: 각 도메인은 독립적인 controller/service/model 구조
- **레이어 분리**: presentation → business → data access 레이어 구분

### 파일 규칙
- **ESM 모듈**: 모든 파일은 import/export 사용 (require 금지)
- **Import Maps**: #src/, #common/, #config/ 등 절대 경로 사용
- **파일명**: PascalCase (클래스), camelCase (함수/변수)

### 비즈니스 로직
- **Service 레이어**: 모든 비즈니스 로직은 Service에 구현
- **Controller**: 요청 처리와 응답 반환만 담당
- **Validation**: joi 스키마 또는 express-validator 사용

### 데이터 접근
- **Repository 패턴**: 직접 Sequelize 모델 접근 금지
- **트랜잭션**: 중요한 작업은 트랜잭션 내에서 수행
- **관계 설정**: models/relationships/ 폴더에서 관리

### 보안 규칙
- **환경변수**: 민감 정보는 암호화하여 저장
- **인증**: 모든 protected 라우트는 인증 미들웨어 적용
- **Validation**: 사용자 입력은 반드시 검증 후 처리
- **SQL Injection**: Sequelize ORM 사용으로 방지

## 테스트 및 배포

### E2E 테스트
```bash
# 로컬 Docker 환경 테스트
npm run test:e2e:local

# Railway test 환경 테스트
npm run test:e2e:railway
```

### 코드 품질
```bash
# 전체 품질 검사
npm run quality

# 개별 검사
npm run lint
npm run format
npm run type-check
```

### 배포 워크플로우
```bash
# feature → dev → test → main
git checkout dev
git merge feature_브랜치명
git push origin dev

git checkout test
git merge dev
git push origin test  # Railway test 환경 자동 배포

git checkout main
git merge test
git push origin main  # Railway production 환경 자동 배포
```

## 성능 최적화

### Redis 캐싱
- **세션 스토어**: Redis를 세션 저장소로 사용
- **쿼리 캐싱**: 자주 조회되는 데이터 캐싱
- **TTL 설정**: 캐시 만료 시간 적절히 설정

### 데이터베이스 최적화
- **Connection Pool**: 환경별 최적화된 풀 설정
- **Lazy Loading**: 필요한 관계만 로드
- **인덱스**: 자주 조회되는 컬럼에 인덱스 설정

### 이미지 최적화
- **Cloudinary**: 자동 이미지 최적화 및 CDN 제공
- **Sharp**: 서버 사이드 이미지 처리 (필요시)

이 가이드에 따라 개발하면 안정적이고 확장 가능한 백엔드 시스템을 구축할 수 있습니다.

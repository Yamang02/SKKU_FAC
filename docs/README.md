# 📚 SKKU 미술동아리 갤러리 - 프로젝트 문서

이 디렉토리는 SKKU 미술동아리 갤러리 프로젝트의 모든 문서를 체계적으로 관리합니다.

## 🎯 최근 주요 업데이트 (2025년 1월)

### ✨ 새로운 아키텍처 특징
- **Import Maps 시스템**: Node.js Subpath Imports로 깔끔한 절대 경로 지원
- **완전한 의존성 주입**: IoC Container를 통한 테스트 가능한 아키텍처
- **향상된 코드 품질**: Prettier, Stylelint, ESLint 통합 워크플로우
- **개발자 경험 개선**: 통합된 npm 스크립트와 자동화 도구

### 📖 바로가기
- [📄 CHANGELOG.md](../CHANGELOG.md) - 상세한 변경사항 기록
- [🔧 Import Maps 가이드](#import-maps-가이드) - 새로운 import 시스템 사용법
- [🏗️ 의존성 주입 가이드](#dependency-injection-가이드) - DI 패턴 구현 방법

## 📁 디렉토리 구조

### 🔧 `/setup`
프로젝트 초기 설정 및 환경 구성 관련 문서
- 개발 환경 설정 가이드
- 이메일 서비스 설정
- 데이터베이스 설정
- 외부 서비스 연동

### 🔌 `/api`
API 문서 및 개발자 가이드
- API 응답 포맷 정의
- 엔드포인트 문서
- 에러 코드 정의
- 인증/권한 가이드

### 📖 `/guides`
개발 가이드 및 아키텍처 문서
- 코딩 스타일 가이드
- 아키텍처 설명
- 리팩토링 가이드
- 도메인별 개발 가이드
- **NEW**: Import Maps 사용 가이드
- **NEW**: 의존성 주입 패턴 가이드

### 🚀 `/deployment`
배포 및 운영 관련 문서
- 배포 가이드
- 모니터링 설정
- 성능 최적화
- CI/CD 파이프라인

### 🔒 `/security`
보안 관련 문서
- 보안 체크리스트
- 취약점 대응 가이드
- 인증/인가 정책
- 데이터 보호 정책

## 🛠️ 개발자 빠른 시작

### Import Maps 가이드

새로운 절대 경로 시스템 사용:

```javascript
// ❌ 기존 방식 (깊은 상대 경로)
import logger from '../../../common/utils/Logger.js';
import UserService from '../../user/service/UserService.js';

// ✅ 새로운 방식 (절대 경로)
import logger from '#common/utils/Logger.js';
import UserService from '#domain/user/service/UserService.js';
```

**사용 가능한 별칭:**
- `#src/*` - 소스 루트 (`./src/*`)
- `#common/*` - 공통 유틸리티 (`./src/common/*`)
- `#domain/*` - 도메인 모듈 (`./src/domain/*`)
- `#infrastructure/*` - 인프라 계층 (`./src/infrastructure/*`)
- `#config/*` - 설정 파일 (`./src/config/*`)
- `#public/*` - 정적 파일 (`./src/public/*`)

### Dependency Injection 가이드

서비스에서 의존성 주입 사용:

```javascript
export default class ExampleService {
    // 1. 의존성 정의
    static dependencies = ['UserRepository', 'EmailService'];

    // 2. 생성자에서 주입받기
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // 3. 비즈니스 로직에서 사용
    async createUser(userData) {
        const user = await this.userRepository.create(userData);
        await this.emailService.sendWelcome(user.email);
        return user;
    }
}
```

### 새로운 개발 명령어

```bash
# 코드 품질 분석
npm run analyze

# 완전한 품질 검사 (lint + format + test)
npm run quality

# 개발 환경 자동 설정
npm run dev:setup

# 코드 포맷팅 (docs 포함)
npm run format
```

## 📋 문서 작성 가이드

### 파일 명명 규칙
- **영문 대문자 + 밑줄**: `SECURITY_CHECKLIST.md`, `API_REFERENCE.md`
- **영문 소문자 + 하이픈**: `auth-domain-status.md`, `database-setup.md`
- **명확하고 설명적인 이름** 사용

### 문서 구조
1. **제목**: 명확하고 구체적인 제목 (이모지 활용)
2. **개요**: 문서의 목적과 범위
3. **목차**: 긴 문서의 경우 목차 제공
4. **본문**: 단계별, 논리적 구조
5. **예제**: 실제 사용 예제 포함 (특히 코드 예제)
6. **참고자료**: 관련 링크 및 참조

### 마크다운 스타일
- **헤더**: `#`, `##`, `###` 사용
- **강조**: **굵게**, *기울임*
- **코드**: 인라인 `code`, 코드 블록 ```javascript
- **목록**: `-` 또는 `1.` 사용
- **링크**: `[텍스트](URL)` 형식
- **이모지**: 섹션 구분과 가독성 향상을 위해 적절히 활용

### 코드 예제 작성 팁
```javascript
// ✅ DO: 새로운 Import Maps 사용
import logger from '#common/utils/Logger.js';

// ❌ DON'T: 깊은 상대 경로 사용
import logger from '../../../common/utils/Logger.js';
```

## 🔄 문서 업데이트 정책

1. **정기 검토**: 분기별 문서 검토 및 업데이트
2. **버전 관리**: 주요 변경사항은 Git으로 추적
3. **팀 공유**: 새로운 문서나 중요 변경사항은 팀에 공지
4. **품질 관리**: 오탈자, 링크 유효성 정기 확인
5. **아키텍처 변경 반영**: 기술 스택 변경 시 즉시 문서 업데이트

## 📞 문의 및 기여

문서 개선 제안이나 오류 발견 시:
- GitHub Issues 등록
- Pull Request 제출
- 팀 내 문서 담당자에게 직접 연락
- Task Master AI를 통한 체계적인 작업 관리

## 🔗 관련 리소스

- [프로젝트 메인 README](../README.md)
- [CHANGELOG](../CHANGELOG.md)
- [Task Master 설정](../.taskmaster/)
- [코딩 스타일 규칙](../.cursor/rules/)

---

**최종 업데이트**: 2025-01-XX
**작성자**: SKKU 미술동아리 갤러리 개발팀
**버전**: v2.0 (Import Maps & DI Architecture)

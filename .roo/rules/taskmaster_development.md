---
description:
globs:
alwaysApply: false
---
# Taskmaster 개발 실수 방지 규칙

## **기존 구조 파악 우선 원칙**

### **1. 프로젝트 구조 분석 필수**
- **새로운 기능 구현 전 반드시 기존 구조 파악**
  - `list_dir`로 도메인별 디렉토리 구조 확인
  - 기존 컨트롤러, 서비스, 모델 패턴 분석
  - 일관된 아키텍처 패턴 유지

```typescript
// ✅ DO: 기존 구조 확인 후 일관성 유지
src/domain/user/controller/api/UserApiController.js
src/domain/artwork/controller/api/ArtworkApiController.js
src/domain/exhibition/controller/api/ExhibitionApiController.js

// ❌ DON'T: 임의로 새로운 구조 생성
src/api/admin/controllers/AdminController.js
```

### **2. 기존 서비스 메서드 확인 필수**
- **서비스 클래스 구현 전 기존 메서드 목록 확인**
  - `read_file`로 기존 서비스 파일 내용 확인
  - 실제 존재하는 메서드만 호출
  - 메서드 시그니처와 반환값 타입 확인

```typescript
// ✅ DO: 기존 서비스 메서드 확인 후 사용
const result = await this.userAdminService.getUserList(options);
const user = await this.userAdminService.getUserDetail(id);

// ❌ DON'T: 존재하지 않는 메서드 임의 호출
const user = await this.userAdminService.createUser(userData); // 존재하지 않음
```

## **라이브러리 및 패키지 관리**

### **3. 기존 패키지 패턴 준수**
- **새로운 패키지 도입 전 기존 사용 패턴 확인**
  - `package.json` 확인으로 기존 의존성 파악
  - 동일한 목적의 기존 패키지 사용 여부 확인
  - 기존 코드에서 사용하는 방식 그대로 적용

```typescript
// ✅ DO: 기존 패턴 사용
return res.status(400).json(ApiResponse.error('에러 메시지'));

// ❌ DON'T: 새로운 패키지 임의 도입
import { StatusCodes } from 'http-status-codes'; // 기존에 없던 패키지
```

### **4. Import 경로 및 파일명 일관성**
- **기존 import 패턴과 파일명 대소문자 확인**
  - 프로젝트에서 #문법을 사용하므로 모든 새 파일에서 #문법 적용 필수
  - 파일명 대소문자 정확히 일치시키기
  - 상대경로 대신 #문법 사용

```typescript
// ✅ DO: #문법 사용 (프로젝트 표준)
import logger from '#common/utils/Logger.js';
import { ApiResponse } from '#common/model/ApiResponse.js';
import UserRequestDto from '#domain/user/model/dto/UserRequestDto.js';

// ❌ DON'T: 상대경로 사용
import logger from '../../../../common/utils/Logger.js';
import { ApiResponse } from '../../../common/model/ApiResponse.js';
```

## **비즈니스 로직 및 권한 확인**

### **5. 관리자 권한 및 기능 범위 파악**
- **관리자가 실제로 할 수 있는 작업만 구현**
  - 기존 Admin 라우터 및 컨트롤러 확인
  - 실제 비즈니스 요구사항에 맞는 기능만 구현
  - 권한별 제한사항 확인

```typescript
// ✅ DO: 실제 관리자 권한에 맞는 기능
- 사용자 조회/수정/삭제 (생성 불가)
- 작품 조회/수정/삭제/승인 (관리자가 직접 생성 불가)
- 전시회 조회/생성/수정/삭제 (관리자만 생성 가능)

// ❌ DON'T: 권한 없는 기능 임의 추가
async createUser() // 관리자는 사용자를 직접 생성할 수 없음
```

### **6. 기존 DTO 및 유효성 검사 시스템 활용**
- **RequestDto와 ResponseDto에서만 유효성 검사 수행**
  - Joi 기반 DTO 시스템 사용 (RequestDto, ResponseDto만)
  - RequestDto의 `validateWithSchema(schemaType)` 메서드 활용
  - ResponseDto의 `validateWithSchema(schemaType)` 메서드 활용
  - 새로운 유효성 검사 라이브러리 도입 금지

```typescript
// ✅ DO: RequestDto에서 유효성 검사
const userDto = new UserRequestDto(req.body);
const validationResult = userDto.validateWithSchema('create'); // 또는 'update'
if (!validationResult.isValid) {
    return res.status(400).json(ApiResponse.error(validationResult.errors[0].message));
}

// ✅ DO: ResponseDto에서 유효성 검사
const responseDto = new UserResponseDto(userData);
const validationResult = responseDto.validateWithSchema('response');

// ❌ DON'T: 새로운 유효성 검사 라이브러리 사용
import { body, validationResult } from 'express-validator';

// ❌ DON'T: 모든 DTO에서 유효성 검사 (RequestDto, ResponseDto만 해당)
const someDto = new SomeDto(data);
someDto.validateWithSchema(); // RequestDto, ResponseDto가 아닌 경우
```

## **개발 프로세스 체크리스트**

### **Task 시작 전 필수 확인사항**
1. **[ ] 기존 프로젝트 구조 파악**
   - 관련 도메인 디렉토리 구조 확인
   - 기존 컨트롤러/서비스 패턴 분석

2. **[ ] 기존 서비스 메서드 확인**
   - 사용할 서비스 클래스의 실제 메서드 목록 확인
   - 메서드 시그니처와 반환값 확인

3. **[ ] 권한 및 비즈니스 로직 확인**
   - 실제 사용자 권한 범위 파악
   - 기존 라우터에서 허용되는 작업 확인

4. **[ ] 기존 패키지 및 패턴 확인**
   - 동일 목적의 기존 패키지 사용 여부 확인
   - Import 경로 및 파일명 대소문자 확인

5. **[ ] DTO 유효성 검사 패턴 확인**
   - RequestDto와 ResponseDto에서만 `validateWithSchema` 사용
   - 스키마 타입 ('create', 'update', 'response' 등) 확인
   - 기존 DTO 클래스들의 스키마 메서드 확인

### **구현 중 지속적 확인사항**
- **기존 코드와의 일관성 유지**
- **실제 존재하는 메서드만 호출**
- **프로젝트 아키텍처 패턴 준수**
- **비즈니스 요구사항 범위 내에서만 구현**

## **에러 방지를 위한 도구 활용**

### **필수 도구 사용 순서**
1. `list_dir` - 구조 파악
2. `read_file` - 기존 코드 확인
3. `grep_search` - 패턴 검색
4. `codebase_search` - 관련 코드 찾기

### **구현 전 반드시 확인할 파일들**
- 관련 도메인의 기존 서비스 파일
- 기존 컨트롤러 파일 (API/일반)
- 라우터 설정 파일
- RequestDto 및 ResponseDto 파일 (유효성 검사 스키마 확인)
- package.json (의존성 확인)

---

## **React Native Web 개발 개선점**

### **7. ES 모듈 환경에서의 설정 파일 관리**
- **package.json에 `"type": "module"`이 설정된 프로젝트에서 주의사항**
  - 모든 설정 파일(.js)은 ES 모듈 문법 사용 필수
  - CommonJS `require()` → ES 모듈 `import` 변환
  - `module.exports` → `export default` 변환
  - `__dirname` 사용 시 `fileURLToPath` 추가 필요

```javascript
// ✅ DO: ES 모듈 문법 사용
import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  // webpack 설정
};

// ❌ DON'T: CommonJS 문법 사용
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // webpack 설정
};
```

### **8. React Native Web 의존성 관리**
- **React Native Web 사용 시 의존성 충돌 해결**
  - React와 React Native 버전 호환성 확인 필수
  - React Native Web만 사용하고 React Native는 웹 개발 시 불필요
  - 정확한 버전 고정으로 충돌 방지

```json
// ✅ DO: 호환되는 버전 조합
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-native-web": "^0.19.12"
}

// ❌ DON'T: 버전 충돌 발생
{
  "react": "^18.2.0",
  "react-native": "^0.72.0", // 웹 개발 시 불필요
  "react-native-web": "^0.19.0"
}
```

### **9. 크로스플랫폼 개발 시 불필요한 의존성 제거**
- **React Native Web 사용 시 CSS 관련 의존성 불필요**
  - StyleSheet API 사용으로 CSS 로더 제거
  - style-loader, css-loader 등 제거
  - CSS 파일 대신 StyleSheet 객체 사용

```javascript
// ✅ DO: StyleSheet API 사용
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
});

// ❌ DON'T: CSS 파일 사용
import './styles.css';
```

### **10. 포트 충돌 방지**
- **Docker Compose와 개발 서버 포트 충돌 확인**
  - docker-compose.yml의 기존 포트 사용 현황 파악
  - 새로운 개발 서버는 사용되지 않는 포트 할당
  - 포트 매핑 문서화

```yaml
# 포트 사용 현황 확인 필요
# 3000: Express 백엔드
# 3001: Docker test-env
# 3002: React 개발 서버 (충돌 해결)
```

### **11. 파일 확장자 명시 규칙**
- **ES 모듈에서 상대 경로 import 시 확장자 필수**
  - JSX 코드 포함 파일은 .jsx 확장자 사용
  - import 문에서 확장자 명시 필수
  - Webpack entry point도 정확한 확장자로 설정

```javascript
// ✅ DO: 확장자 명시
import App from './App.jsx';
import { api } from './services/api.js';

// ❌ DON'T: 확장자 생략
import App from './App';
import { api } from './services/api';
```

### **12. 개발 환경 설정 검증 프로세스**
- **새로운 기술 스택 도입 시 단계적 검증**
  1. 기본 의존성 설치 및 버전 호환성 확인
  2. 최소한의 설정으로 빌드 테스트
  3. 개발 서버 실행 확인
  4. 점진적 기능 추가

```bash
# 검증 순서
npm install --legacy-peer-deps  # 의존성 충돌 시
npm run start:react            # 개발 서버 실행 테스트
npm run build:react           # 빌드 테스트
```

## **React Native Web 개발 체크리스트**

### **프로젝트 설정 전 확인사항**
1. **[ ] ES 모듈 환경 확인**
   - package.json의 "type": "module" 설정 확인
   - 모든 설정 파일을 ES 모듈 문법으로 작성

2. **[ ] 의존성 호환성 확인**
   - React와 React Native Web 버전 호환성 확인
   - 불필요한 React Native 의존성 제거

3. **[ ] 포트 충돌 방지**
   - docker-compose.yml의 기존 포트 확인
   - 새로운 포트 할당 및 문서화

4. **[ ] 파일 구조 및 확장자**
   - JSX 파일은 .jsx 확장자 사용
   - import 문에서 확장자 명시
   - Webpack entry point 정확히 설정

### **개발 중 지속적 확인사항**
- **CSS 대신 StyleSheet API 사용**
- **React Native 컴포넌트 우선 사용**
- **모바일 친화적 UI 패턴 적용**
- **터치 이벤트 최적화**

---

**핵심 원칙: "기존을 먼저 파악하고, 일관성을 유지하며, 실제 요구사항에 맞게 구현한다"**
**React Native Web 원칙: "크로스플랫폼 호환성을 고려하고, 모바일 우선 설계로 개발한다"**

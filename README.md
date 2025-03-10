# SKKU Faculty Art Gallery

성균관대학교 순수 미술 동아리 작품 갤러리 웹사이트입니다.

## 기술 스택

### 프론트엔드
- HTML5, CSS3, JavaScript
- EJS (템플릿 엔진)

### 백엔드
- Node.js
- Express.js
- MySQL

### 개발 도구
- ESLint
- Stylelint
- Nodemon

## 주요 기능

- **작품 갤러리**: 학생들의 작품을 카테고리별로 볼 수 있는 갤러리
- **전시회 정보**: 현재 및 예정된 전시회 정보 제공
- **공지사항**: 동아리 및 전시회 관련 공지사항
- **관리자 기능**: 작품, 전시회, 공지사항 관리 기능

## 코드 품질 관리

이 프로젝트는 코드 품질을 유지하기 위해 다음과 같은 도구를 사용합니다:

### 코드 분석 도구

- **ESLint**: JavaScript 코드 품질 검사
- **Stylelint**: CSS 코드 품질 및 중복 검사

### 사용 방법

```bash
# 코드 분석 실행
npm run analyze

# JavaScript 코드만 분석
npm run lint

# JavaScript 코드 분석 및 자동 수정
npm run lint:fix

# CSS 코드만 분석
npm run lint:css

# CSS 코드 분석 및 자동 수정
npm run lint:css:fix
```

### 사용되지 않는 코드 확인 방법

1. ESLint를 사용하여 사용되지 않는 변수 및 함수 확인
2. Stylelint를 사용하여 중복된 CSS 규칙 확인
3. 브라우저 개발자 도구의 Coverage 탭을 사용하여 실행 시 사용되지 않는 코드 확인

## 코드 컨벤션

이 프로젝트는 일관된 코드 스타일을 유지하기 위해 코드 컨벤션을 준수합니다.
자세한 내용은 [CODING_CONVENTION.md](docs/CODING_CONVENTION.md) 파일을 참조하세요.

코드 작성 전에 다음 명령어로 개발 환경을 설정하세요:

```bash
# 의존성 설치
npm install

# 코드 컨벤션 검사
npm run analyze
```

## 프로젝트 구조

프로젝트 구조에 대한 자세한 내용은 [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) 파일을 참조하세요.

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
```

## API 문서

### 작품 API
- `GET /artwork`: 모든 작품 목록 조회
- `GET /artwork/:id`: 특정 작품 상세 정보 조회
- `POST /artwork`: 새 작품 등록 (관리자 전용)
- `PUT /artwork/:id`: 작품 정보 수정 (관리자 전용)
- `DELETE /artwork/:id`: 작품 삭제 (관리자 전용)

### 전시회 API
- `GET /exhibition`: 모든 전시회 목록 조회
- `GET /exhibition/:id`: 특정 전시회 상세 정보 조회
- `POST /exhibition`: 새 전시회 등록 (관리자 전용)
- `PUT /exhibition/:id`: 전시회 정보 수정 (관리자 전용)
- `DELETE /exhibition/:id`: 전시회 삭제 (관리자 전용)

### 공지사항 API
- `GET /notice`: 모든 공지사항 목록 조회
- `GET /notice/:id`: 특정 공지사항 상세 정보 조회
- `POST /notice`: 새 공지사항 등록 (관리자 전용)
- `PUT /notice/:id`: 공지사항 수정 (관리자 전용)
- `DELETE /notice/:id`: 공지사항 삭제 (관리자 전용)

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다: `git checkout -b feature/기능명`
3. 변경사항을 커밋합니다: `git commit -m '새 기능 추가'`
4. 포크한 저장소에 푸시합니다: `git push origin feature/기능명`
5. Pull Request를 제출합니다.

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 연락처

- 프로젝트 관리자: [여기에 이메일 주소를 입력하세요]
- 이슈 트래커: [여기에 GitHub 이슈 페이지 링크를 입력하세요]

#project-overview (프로젝트 개요)
SKKU 미술동아리 갤러리는 성균관대학교 순수 미술 동아리 전시의 예술 작품을 전시하고 관리하는 웹 플랫폼입니다. 이 시스템은 전시회 관리, 작품 업로드, 사용자 인증 등의 기능을 제공합니다.

#feature-requirements (기능 요구사항)
1. Node.js(22.13.0)와 Express.js 프레임워크를 사용합니다.
2. ECMAScript 모듈(ESM) 시스템을 사용하여 import/export 구문으로 모듈을 관리합니다.
3. MySQL 데이터베이스와 Sequelize ORM을 사용하여 데이터를 관리합니다.
4. 세션 기반 인증을 구현하여 사용자 로그인 상태를 관리합니다.
5. 작품 이미지는 Cloudinary 스토리지를 사용하여 저장 및 관리합니다.
6. 사용자 비밀번호는 bcrypt를 통해 암호화하여 저장합니다.
7. helmet 미들웨어를 사용하여 보안 헤더를 설정합니다.
8. express-rate-limit을 사용하여 요청 제한을 구현합니다.
9. EJS 템플릿 엔진을 사용하여 서버 사이드 렌더링을 구현합니다.
10. Swagger UI를 통해 API 문서를 제공합니다.
11. 도메인 중심 설계(DDD) 원칙에 따라 백엔드 구조를 구성합니다.

#relevant-codes (관련 코드)
```javascript
// 서버 설정 예시 (app.js)
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "https://res.cloudinary.com/"]
        }
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 15분당 최대 100개 요청
});
app.use('/api/', limiter);

// 라우터 등록
import { HomeRouter, ExhibitionRouter } from './routeIndex.js';
app.use('/', HomeRouter);
app.use('/exhibition', ExhibitionRouter);
```

#Current-file-instruction (현재 파일 구조)
```
SKKU_FAC_GALLERY/
├── src/                              # 소스 코드 루트
│   ├── app.js                        # Express 애플리케이션 설정
│   ├── server.js                     # 서버 시작점
│   ├── routeIndex.js                 # 라우터 인덱스
│   ├── swagger.json                  # API 문서
│   ├── domain/                       # 도메인별 구성요소
│   │   ├── admin/                    # 관리자 도메인
│   │   ├── artwork/                  # 작품 도메인
│   │   ├── auth/                     # 인증 도메인
│   │   ├── common/                   # 공통 도메인
│   │   ├── exhibition/               # 전시회 도메인
│   │   │   ├── controller/           # 컨트롤러 레이어
│   │   │   ├── model/                # 모델 레이어
│   │   │   └── service/              # 서비스 레이어
│   │   ├── home/                     # 홈 도메인
│   │   ├── image/                    # 이미지 도메인
│   │   └── user/                     # 사용자 도메인
│   ├── infrastructure/               # 인프라 계층
│   │   ├── cloudinary/               # Cloudinary 통합
│   │   └── db/                       # 데이터베이스 관련
│   │       ├── adapter/              # DB 어댑터
│   │       ├── repository/           # 레포지토리 패턴 구현
│   │       └── model/                # DB 모델
│   │           ├── entity/           # 엔티티 모델
│   │           └── relationship/     # 모델 간 관계 설정
│   ├── common/                       # 공통 유틸리티
│   ├── config/                       # 설정 파일
│   ├── public/                       # 정적 파일
│   └── views/                        # EJS 뷰 템플릿
```

#rules (규칙)
- 모든 백엔드 코드는 MVC 패턴을 따라야 합니다(Controller, Service, Model 구조).
- 도메인 폴더 내부는 controller, service, model 폴더로 구분하여 관심사를 분리합니다.
- 모든 파일은 ECMAScript 모듈(ESM) 형식을 사용해야 합니다(require 대신 import/export 사용).
- 모든 데이터베이스 관련 코드는 infrastructure/db 폴더에 작성합니다.
- 인증 및 권한 검사 미들웨어는 auth 도메인에 위치시킵니다.
- 비즈니스 로직은 Service 레이어에 구현하고, Controller는 요청 처리와 응답 반환만 담당합니다.
- 환경 변수는 config 폴더의 설정 파일을 통해 접근하도록 구현합니다.
- 모든 API 엔드포인트는 swagger.json에 문서화되어야 합니다.
- 에러 처리는 중앙 집중식으로 구현하며, 적절한 HTTP 상태 코드와 응답 형식을 유지합니다.
- 코드 스타일은 ESLint 규칙을 따라야 합니다.
- 각 도메인의 데이터 모델은 entity 및 relationship 폴더에 명확히 정의되어야 합니다.

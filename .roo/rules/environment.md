---
description:
globs:
alwaysApply: false
---
# Environment Variables Management Rules

## **환경변수 파일 구조**

### **현재 설정된 파일**
- **`.env.docker`**: Docker 환경용 (유일한 환경변수 파일)

### **환경변수 로딩 순서**
Config.js에서 다음 순서로 환경변수를 로드합니다:
1. `.env.local` (삭제됨)
2. `.env` (존재하지 않음)
3. `.env.${NODE_ENV}` (예: `.env.development`, 존재하지 않음)
4. `.env.${NODE_ENV}.local` (존재하지 않음)

**현재는 `.env.docker` 파일만 사용하며, Docker 기반 개발이 주된 방식입니다.**

## **Docker 환경 설정**

### **컨테이너별 환경변수**
- **애플리케이션**: `.env.docker` 파일 사용
- **MySQL**: `docker-compose.yml`에서 직접 설정
- **Redis**: 설정 파일 불필요 (기본값 사용)

### **호스트명 설정**
```javascript
// Docker 환경 (.env.docker)
DB_HOST=mysql          // Docker 서비스명
REDIS_HOST=redis       // Docker 서비스명
```

## **환경변수 추가 시 규칙**

### **새로운 환경변수 추가 절차**
1. **`src/config/Config.js`의 `validateCriticalEnvironmentVariables()` 메서드에 검증 규칙 추가**
2. **`.env.docker` 파일에 변수 추가**
3. **프로덕션 환경: Railway 환경변수 설정**

### **환경변수 명명 규칙**
- **데이터베이스**: `DB_*` (Docker), `MYSQL*` (프로덕션/Railway)
- **Redis**: `REDIS_*`
- **보안**: `*_SECRET`, `JWT_*`
- **외부 서비스**: `CLOUDINARY_*`, `GOOGLE_*`, `EMAIL_*`

### **필수 환경변수 목록**
```javascript
// 데이터베이스 (환경별)
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME  // Docker
MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQL_DATABASE  // Railway

// 보안
SESSION_SECRET (최소 32자)
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

// 외부 서비스
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

## **현재 개발 환경**

### **Docker 기반 개발 (권장)**
- 포트: MySQL 3306, Redis 6379 (컨테이너 내부)
- 호스트: 서비스명 (mysql, redis)
- 로깅: debug 레벨
- 파일: `.env.docker`
- 실행: `npm run dev` (docker-compose 기반)

### **프로덕션환경 (Railway)**
- Railway 환경변수 사용
- MYSQL* 접두사 사용
- 보안 강화 설정

## **Docker Compose 환경변수 설정**

### **애플리케이션 컨테이너**
```yaml
app:
  environment:
    - NODE_ENV=development
    - DB_HOST=mysql
    - REDIS_HOST=redis
  env_file:
    - .env.docker
```

### **데이터베이스 컨테이너**
```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: devpassword
    MYSQL_DATABASE: skku_sfa_gallery
```

## **보안 고려사항**

### **민감한 환경변수**
- `.env.docker` 파일은 `.gitignore`에 포함
- 프로덕션 시크릿은 Railway 환경변수로 관리
- 개발용 시크릿은 실제 프로덕션 값과 분리

### **환경변수 검증**
- Config.js에서 자동 검증
- 필수 변수 누락 시 애플리케이션 종료
- 타입 및 형식 검증 (이메일, URL, 숫자 범위 등)

## **문제 해결**

### **환경변수 로딩 확인**
```javascript
// 로드된 환경변수 파일 확인
console.log(Config.getInstance().getEnvironmentLoadingStatus());

// 특정 환경변수 값 확인
console.log(Config.getInstance().get('database.host'));
```

### **Docker 환경 문제**
- 컨테이너 간 네트워킹: 서비스명을 호스트명으로 사용
- 포트 충돌: 다른 포트 사용 시 docker-compose.yml 수정
- 볼륨 마운트: `.env.docker` 파일이 컨테이너에 접근 가능한지 확인

---

**주의:** 현재는 Docker 기반 개발이 표준이므로, `npm run dev` 명령어를 사용하여 개발환경을 시작하세요.

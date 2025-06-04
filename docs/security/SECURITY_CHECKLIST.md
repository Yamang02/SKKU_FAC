# 🔒 보안 체크리스트

SKKU Fine Art Club Gallery 프로젝트의 보안 관리 가이드라인입니다.

## 📋 커밋 전 보안 체크리스트

### ✅ **환경 변수 및 설정 파일**
- [ ] `.env*` 파일들이 `.gitignore`에 포함되어 있는가?
- [ ] 실제 API 키, 비밀번호가 코드에 하드코딩되어 있지 않은가?
- [ ] 테스트 환경에서만 더미 데이터를 사용하고 있는가?
- [ ] 프로덕션 설정 파일이 실수로 포함되지 않았는가?

### ✅ **데이터베이스 보안**
- [ ] 데이터베이스 백업 파일(`.sql`, `.dump`)이 제외되어 있는가?
- [ ] 테스트 데이터베이스 연결 정보만 사용하고 있는가?
- [ ] 실제 사용자 데이터가 테스트 코드에 포함되지 않았는가?

### ✅ **인증서 및 키 파일**
- [ ] SSL 인증서(`.pem`, `.crt`, `.key`)가 제외되어 있는가?
- [ ] JWT 시크릿이 환경 변수로 관리되고 있는가?
- [ ] 세션 시크릿이 하드코딩되지 않았는가?

### ✅ **로그 및 임시 파일**
- [ ] 로그 파일들이 `.gitignore`에 포함되어 있는가?
- [ ] 임시 파일들(`.tmp`, `.temp`)이 제외되어 있는가?
- [ ] 개발자 개인 설정 파일들이 제외되어 있는가?

## 🛡️ 현재 프로젝트 보안 상태

### ✅ **잘 관리되고 있는 부분**

1. **환경 변수 관리**:
   ```
   .env.docker ✅ (gitignore에 포함)
   .env.local ✅ (gitignore에 포함)
   .env* ✅ (모든 패턴 제외)
   ```

2. **테스트 데이터 보안**:
   ```
   더미 비밀번호만 사용 ✅
   테스트용 이메일만 사용 ✅
   실제 API 키 없음 ✅
   ```

3. **CI/CD 보안**:
   ```
   테스트용 환경 변수만 사용 ✅
   실제 프로덕션 키 없음 ✅
   GitHub Secrets 사용 권장 ✅
   ```

### 🔧 **추가 보안 강화 사항**

1. **GitHub Secrets 사용**:
   ```yaml
   # .github/workflows/integration-tests.yml에서
   env:
     DB_PASSWORD: ${{ secrets.TEST_DB_PASSWORD }}
     JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
   ```

2. **환경별 설정 분리**:
   ```
   config/environments/development.js ✅
   config/environments/test.js ✅
   config/environments/production.js ✅
   ```

3. **보안 스캔 자동화**:
   ```
   npm audit ✅
   audit-ci ✅
   GitHub Security Advisories ✅
   ```

## 🚨 **절대 커밋하면 안 되는 파일들**

```
# 환경 변수
.env
.env.local
.env.production
.env.docker

# 인증서
*.pem
*.key
*.crt

# 데이터베이스
*.sql
*.dump

# 설정 파일
config/secrets.*
src/config/local.*

# 로그 파일
*.log
logs/

# 백업 파일
*.backup
*.bak
```

## 🔍 **보안 점검 명령어**

```bash
# Git 상태 확인
git status

# 스테이징된 파일 확인
git diff --cached

# 민감한 파일 검색
find . -name "*.env*" -not -path "./node_modules/*"
find . -name "*.key" -not -path "./node_modules/*"
find . -name "*.pem" -not -path "./node_modules/*"

# 보안 스캔
npm audit
npx audit-ci --moderate
```

## 📞 **보안 사고 대응**

만약 민감한 정보가 실수로 커밋된 경우:

1. **즉시 조치**:
   ```bash
   # 마지막 커밋 취소
   git reset --soft HEAD~1

   # 특정 파일만 제거
   git rm --cached .env.production
   git commit --amend
   ```

2. **API 키 교체**:
   - 노출된 API 키 즉시 비활성화
   - 새로운 키 생성 및 환경 변수 업데이트

3. **히스토리 정리** (필요시):
   ```bash
   # 주의: 협업 시 팀원과 상의 후 실행
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env.production' \
   --prune-empty --tag-name-filter cat -- --all
   ```

---

**마지막 업데이트**: 2025년 6월 4일
**담당자**: SKKU Fine Art Club Gallery 개발팀

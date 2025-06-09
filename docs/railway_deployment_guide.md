# Railway 배포 가이드

## 브랜치 관리 전략

### 브랜치 구조
```
feature/* → dev → test → main
```

- **feature 브랜치**: 개별 기능 개발 (`feature_TaskmasterAI활용리팩토링` 등)
- **dev**: 개발 통합 브랜치 (로컬 Docker 테스트)
- **test**: 테스트 환경 브랜치 (Railway test 환경 자동 배포)
- **main**: 운영 환경 브랜치 (Railway production 환경 자동 배포)

### 배포 워크플로우

#### 1. Feature 브랜치에서 개발
```bash
# 현재 feature 브랜치에서 개발 계속
git checkout feature_TaskmasterAI활용리팩토링

# Docker 환경에서 로컬 테스트
npm run dev
npm run test:e2e:local
```

#### 2. Dev 브랜치로 통합
```bash
# dev 브랜치로 전환
git checkout dev
git pull origin dev

# feature 브랜치 변경사항을 dev로 병합
git merge feature_TaskmasterAI활용리팩토링

# 충돌 해결 후 푸시
git push origin dev
```

#### 3. Test 환경 배포
```bash
# test 브랜치로 전환 및 업데이트
git checkout test
git pull origin test

# dev 브랜치 변경사항을 test로 병합
git merge dev

# Railway test 환경으로 자동 배포
git push origin test
```

#### 4. Production 배포
```bash
# main 브랜치로 전환 및 업데이트
git checkout main
git pull origin main

# test 브랜치 변경사항을 main으로 병합
git merge test

# Railway production 환경으로 자동 배포
git push origin main
```

## Railway 환경 설정

### 연결된 환경
- **Test 환경**: `test` 브랜치 → `skkufacapp-test.up.railway.app`
- **Production 환경**: `main` 브랜치 → 운영 도메인

### Railway 프로젝트 관리
```bash
# Railway 로그인
npm run railway:login

# 프로젝트 상태 확인
npm run railway:status

# 배포 로그 확인
npm run railway:logs

# Railway 대시보드 열기
npm run railway:open
```

### 환경별 변수 확인
```bash
# Test 환경 변수 확인
npx railway variables

# Production 환경으로 전환 후 확인
npx railway environment production
npx railway variables
```

## 배포 전 체크리스트

### Dev → Test 배포 전
- [ ] Docker 환경에서 로컬 E2E 테스트 통과
- [ ] 코드 품질 검사 통과 (`npm run lint`, `npm run type-check`)
- [ ] 환경 변수 설정 확인
- [ ] Database migration 필요 여부 확인

### Test → Main 배포 전
- [ ] Railway test 환경에서 전체 기능 검증
- [ ] E2E 테스트 통과 (`npm run test:e2e:railway`)
- [ ] 성능 테스트 통과
- [ ] 보안 검토 완료
- [ ] Production 환경 변수 재확인

## 긴급 상황 대응

### Hotfix 배포
```bash
# main에서 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix_이슈명

# 수정 후 main으로 직접 병합
git checkout main
git merge hotfix_이슈명
git push origin main

# dev, test 브랜치에도 반영
git checkout dev
git merge main
git push origin dev

git checkout test
git merge main
git push origin test
```

### 롤백
```bash
# Railway에서 이전 배포로 롤백
npx railway redeploy

# 또는 Git에서 이전 커밋으로 되돌리기
git revert HEAD
git push origin main
```

## 모니터링

### Railway 로그 모니터링
```bash
# 실시간 로그 확인
npm run railway:logs

# 특정 서비스 로그
npx railway logs --service SKKU_FAC_app
```

### 애플리케이션 상태 확인
- Test: `https://skkufacapp-test.up.railway.app/health`
- Production: Railway 운영 도메인 + `/health`

## 주의사항

1. **이메일 링크**: BASE_URL 환경 변수에 반드시 `https://` 프로토콜 포함
2. **Redis 의존성**: Redis Cloud 서비스 연결 상태 모니터링 필수
3. **환경별 DB 분리**: test와 production 환경의 데이터베이스가 분리되어 있음
4. **자동 배포**: Git push 시 즉시 Railway 배포가 시작되므로 신중히 진행
5. **브랜치 순서**: 반드시 feature → dev → test → main 순서로 진행

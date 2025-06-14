# 🔄 SKKU Gallery Development Workflow

SKKU Gallery 프로젝트에서 Task Master를 활용한 체계적인 개발 워크플로우 가이드입니다.

## **🚀 프로젝트 시작 흐름**

### **1. 신규 프로젝트 초기화**
- Task Master 초기화: `initialize_project` 도구
- PRD 기반 초기 태스크 생성: `parse_prd` 도구

### **2. 기존 프로젝트 진입**
- 현재 작업 상황 파악: `get_tasks` 도구
- 다음 작업할 태스크 식별: `next_task` 도구

### **3. React 전환 프로젝트 진입** ⭐ NEW
- 관리자 도메인 분리 상태 확인: [React 전환 가이드](mdc:.roo/rules/react_migration.md)
- API-First 아키텍처 진행 상황 파악
- 하이브리드 운영 환경 설정 확인

## **🎯 개발 세션 시작 프로세스**

### **Phase 1: 상황 파악**
1. **전체 태스크 현황 확인** → [상세 명령어](mdc:.roo/rules/taskmaster.md)
2. **의존성 상태 체크** - 전제 조건 태스크들이 완료되었는지 확인
3. **다음 작업 태스크 결정** - 우선순위와 의존성 기반

### **Phase 2: 태스크 분석**
1. **복잡도 분석** 실행 (필요시)
2. **태스크 세부 정보 확인** - 요구사항, 구현 방법, 테스트 전략
3. **태스크 분해** (복잡한 경우) - 서브태스크로 나누기

### **Phase 3: 구현 준비**
1. **코드베이스 탐색** - 관련 파일과 구조 파악
2. **구현 계획 수립** - 변경할 파일, 메서드, 의존성 확인
3. **테스트 전략 확인** - [테스트 가이드](mdc:.roo/rules/testing.md) 참조

## **🛠️ 구현 단계별 워크플로우**

### **서브태스크 이터레이티브 구현**

#### **단계 1: 목표 이해**
- 서브태스크의 구체적 목표와 요구사항 파악
- 실제 프로젝트 구조와 코드 확인 필수
- **React 전환 작업 시**: [도메인 분리 체크리스트](mdc:.roo/rules/react_migration.md) 확인

#### **단계 2: 탐색 & 계획**
- **코드베이스 분석**: `codebase_search`, `read_file`, `grep_search` 활용
- **실제 구조 확인**: 가정하지 말고 반드시 검증
- **구현 계획 수립**: 변경할 파일과 위치 명시
- **React 작업 시**: 기존 EJS 템플릿과 새로운 React 컴포넌트 매핑 확인

#### **단계 3: 계획 기록**
- **상세 계획 로깅**: `update_subtask`로 탐색 결과와 구현 계획 기록
- **모든 세부사항 포함**: 파일 경로, 라인 번호, 예상 변경사항
- **API 작업 시**: 엔드포인트 설계 및 응답 형식 명시

#### **단계 4: 구현 시작**
- **상태 업데이트**: 서브태스크를 'in-progress'로 변경
- **코딩 진행**: 로깅된 계획에 따라 구현
- **하이브리드 운영**: 기존 기능 중단 없이 점진적 전환

#### **단계 5: 진행상황 업데이트**
- **발견사항 기록**: 작동한 것, 작동하지 않은 것
- **지속적 로깅**: 구현 여정의 timestamped 기록 생성
- **학습 내용 보존**: 향후 유사 작업을 위한 지식 축적
- **API 테스트**: Postman/Thunder Client로 엔드포인트 검증

#### **단계 6: 완료 및 검증**
- **테스트 실행**: [테스트 가이드](mdc:.roo/rules/testing.md)에 따라
- **React 컴포넌트**: 렌더링 및 상호작용 테스트
- **API 엔드포인트**: 권한 및 데이터 검증
- **상태 완료**: 서브태스크를 'done'으로 변경
- **커밋**: Git으로 변경사항 저장

## **📊 태스크 관리 베스트 프랙티스**

### **의존성 관리**
- **전제 조건**: 의존하는 모든 태스크가 'done' 상태인지 확인
- **순환 의존성**: 의존성 검증 도구로 문제 예방
- **블로킹 해결**: 의존성 문제 발견 시 우선 해결
- **React 전환**: 도메인 분리 → API 구축 → React 컴포넌트 순서 준수

### **상태 관리 철칙**
- **'pending'**: 작업 준비 완료
- **'in-progress'**: 현재 작업 중
- **'done'**: 완료 및 검증 완료
- **'deferred'**: 연기됨 (이유 명시)

## **🔄 구현 드리프트 처리**

### **언제 업데이트해야 하는가**
- 구현 방식이 원래 계획과 크게 달라질 때
- 새로운 의존성이나 요구사항이 발견될 때
- 미래 태스크들이 현재 구현에 영향을 받을 때
- **React 전환 시**: 컴포넌트 구조나 API 설계가 변경될 때

### **업데이트 전략**
- **단일 태스크**: `update_task`로 특정 태스크만 수정
- **여러 태스크**: `update`로 특정 ID 이후 모든 태스크 업데이트
- **연구 기반**: `--research` 플래그로 더 정확한 업데이트

## **🧪 테스트 통합 워크플로우**

### **기존 테스트 (개발 전/중/후)**
```bash
# 기본 기능 확인
npm run test:basic-check

# 도메인별 테스트
npm run test:auth      # 인증 관련 작업 시
npm run test:artwork   # 작품 관련 작업 시

# 실시간 확인 (헤드리스 모드 해제)
npm run test:auth -- --headed

# 특정 기능 테스트
npm run test:validation  # 미들웨어 수정 시

# 핵심 기능 확인
npm run test:critical

# 회귀 테스트
npm run test:regression
```

### **React 전환 테스트** ⭐ NEW
```bash
# API 엔드포인트 테스트
npm run test:api

# React 컴포넌트 테스트
npm run test:react

# 통합 테스트 (EJS + React 하이브리드)
npm run test:integration

# 권한 시스템 테스트 (JWT + RBAC)
npm run test:auth:api
```

## **⚛️ React 개발 워크플로우** ⭐ NEW

### **컴포넌트 개발 사이클**
1. **설계**: 기존 EJS 템플릿 분석 및 React 컴포넌트 설계
2. **구현**: 컴포넌트 개발 및 API 통신 연결
3. **테스트**: 렌더링, 상호작용, API 통신 테스트
4. **통합**: 기존 시스템과의 하이브리드 운영 확인

### **API 개발 사이클**
1. **설계**: RESTful 엔드포인트 설계 및 응답 형식 정의
2. **구현**: 컨트롤러, 서비스, 미들웨어 개발
3. **테스트**: 단위 테스트, 통합 테스트, 권한 테스트
4. **문서화**: API 문서 업데이트

### **빌드 및 배포**
```bash
# 개발 환경 (Hot Module Replacement)
npm run dev:react

# 프로덕션 빌드
npm run build:react

# 하이브리드 서버 실행
npm run start:hybrid
```

## **📝 커밋 및 문서화**

### **Git 워크플로우**
1. **변경사항 스테이징**: `git add .`
2. **커밋 메시지 작성**: 프로젝트 커밋 가이드라인 준수
3. **태스크 완료 표시**: Task Master에서 상태 업데이트

### **React 전환 커밋 컨벤션** ⭐ NEW
```bash
# 도메인 분리
git commit -m "feat(admin): separate user admin domain"

# API 구축
git commit -m "feat(api): add user admin REST endpoints"

# React 컴포넌트
git commit -m "feat(react): add UserManagement component"

# 하이브리드 통합
git commit -m "feat(hybrid): integrate React with existing EJS"
```

### **룰 업데이트**
- **새로운 패턴 발견**: 룰 파일 업데이트 고려
- **일관성 유지**: 기존 컨벤션과 조화
- **문서화**: 중요한 결정사항 기록
- **React 패턴**: [React 전환 가이드](mdc:.roo/rules/react_migration.md) 업데이트

---

**💡 핵심 원칙**:
1. **계획 → 탐색 → 기록 → 구현 → 검증** 사이클 준수
2. **가정하지 말고 항상 확인** - 코드베이스 분석 우선
3. **지속적 기록** - 구현 과정의 학습 내용 보존
4. **테스트 우선** - 구현 전후 적절한 테스트 실행
5. **점진적 전환** - 기존 기능 중단 없이 React 도입 ⭐ NEW

자세한 명령어와 도구 사용법은 **[Task Master 도구 참조](mdc:.roo/rules/taskmaster.md)**를 확인하세요.

---
description: React 기반 관리자 도메인 분리 및 프론트엔드 전환 가이드
globs: src/domain/*/admin/**, src/frontend/react/**, webpack.config.js, babel.config.js
alwaysApply: true
---

# 🚀 React 기반 관리자 도메인 분리 및 프론트엔드 전환 가이드

SKKU Gallery 프로젝트의 관리자 기능을 도메인별로 분리하고 React SPA로 전환하는 체계적인 가이드입니다.

## **📁 도메인 분리 아키텍처**

### **기본 구조 원칙**
```
src/domain/
├── user/
│   ├── controller/UserController.js          # 일반 사용자 기능
│   ├── admin/                                # 사용자 관리 전용
│   │   ├── controller/UserAdminController.js
│   │   ├── service/UserAdminService.js
│   │   └── middleware/UserAdminMiddleware.js
│   └── service/UserService.js                # 공통 비즈니스 로직
├── artwork/
│   ├── controller/ArtworkController.js
│   ├── admin/                                # 작품 관리 전용
│   │   ├── controller/ArtworkAdminController.js
│   │   └── service/ArtworkAdminService.js
│   └── service/ArtworkService.js
└── exhibition/
    ├── controller/ExhibitionController.js
    ├── admin/                                # 전시회 관리 전용
    │   ├── controller/ExhibitionAdminController.js
    │   └── service/ExhibitionAdminService.js
    └── service/ExhibitionService.js
```

### **도메인 분리 체크리스트**
- [ ] **디렉토리 구조 생성**: `/src/domain/{domain}/admin/` 구조
- [ ] **컨트롤러 이전**: 기존 Management 컨트롤러 → Admin 컨트롤러
- [ ] **서비스 분리**: 관리자 전용 비즈니스 로직 분리
- [ ] **RBAC 통합**: 기존 권한 체계 적용
- [ ] **라우팅 업데이트**: 새로운 구조 반영
- [ ] **의존성 주입**: 기존 DI 패턴 유지

## **🔗 API-First 아키텍처**

### **RESTful API 설계 원칙**
```javascript
// 표준 API 엔드포인트 구조
/api/admin/users          # GET, POST
/api/admin/users/:id      # GET, PUT, DELETE
/api/admin/artworks       # GET, POST
/api/admin/artworks/:id   # GET, PUT, DELETE
/api/admin/exhibitions    # GET, POST
/api/admin/exhibitions/:id # GET, PUT, DELETE
```

### **API 컨트롤러 구현 패턴**
```javascript
// AdminApiController 기본 구조
export default class UserAdminApiController extends BaseAdminController {
    constructor(userAdminService, rbacService) {
        super('UserAdminApiController');
        this.userAdminService = userAdminService;
        this.rbacService = rbacService;
    }

    async getUsers(req, res) {
        return this.safeExecuteAPI(
            async () => {
                const { page = 1, limit = 10, ...filters } = req.query;
                return await this.userAdminService.getUsers({ page, limit, ...filters });
            },
            req, res,
            { operationName: '사용자 목록 조회' }
        );
    }
}
```

### **API 응답 표준화**
```javascript
// 성공 응답
{
    "success": true,
    "data": { ... },
    "pagination": { page, limit, total, totalPages }
}

// 에러 응답
{
    "success": false,
    "error": "사용자 친화적 메시지",
    "code": "ERROR_CODE"
}
```

## **⚛️ React 컴포넌트 아키텍처**

### **디렉토리 구조**
```
src/frontend/react/
├── components/
│   ├── common/              # 재사용 가능한 공통 컴포넌트
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── Form/
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── AdminLayout/
│   │   ├── Header/
│   │   └── Sidebar/
│   └── admin/               # 관리자 전용 컴포넌트
│       ├── users/
│       │   ├── UserList/
│       │   ├── UserDetail/
│       │   └── UserForm/
│       ├── artworks/
│       └── exhibitions/
├── pages/                   # 페이지 컴포넌트
│   ├── AdminDashboard/
│   ├── UserManagement/
│   ├── ArtworkManagement/
│   └── ExhibitionManagement/
├── services/                # API 통신 서비스
│   ├── api.js              # Axios 설정
│   ├── userService.js
│   ├── artworkService.js
│   └── exhibitionService.js
├── hooks/                   # 커스텀 훅
│   ├── useAuth.js
│   ├── useApi.js
│   └── usePagination.js
├── utils/                   # 유틸리티 함수
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
└── App.js                   # 메인 앱 컴포넌트
```

### **컴포넌트 설계 원칙**
- **단일 책임**: 각 컴포넌트는 하나의 명확한 역할
- **재사용성**: 공통 컴포넌트는 props로 커스터마이징
- **상태 관리**: Context API 또는 useState/useReducer 활용
- **타입 안정성**: PropTypes 또는 TypeScript 활용 고려

### **API 통신 패턴**
```javascript
// services/userService.js
import api from './api';

export const userService = {
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    createUser: (data) => api.post('/admin/users', data),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// hooks/useUsers.js
export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async (params) => {
        setLoading(true);
        try {
            const response = await userService.getUsers(params);
            setUsers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    return { users, loading, fetchUsers };
};
```

## **🔧 빌드 및 개발 환경**

### **Webpack 설정 원칙**
```javascript
// webpack.config.js 기본 구조
module.exports = {
    entry: './src/frontend/react/App.js',
    output: {
        path: path.resolve(__dirname, 'dist/react'),
        filename: '[name].[contenthash].js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/frontend/react/index.html'
        })
    ]
};
```

### **개발 환경 설정**
- **Hot Module Replacement**: 개발 중 실시간 업데이트
- **Source Maps**: 디버깅을 위한 소스 맵 생성
- **환경 분리**: development/production 빌드 구분

## **🔄 하이브리드 운영 전략**

### **점진적 전환 계획**
1. **Phase 1**: 관리자 도메인 분리 (EJS 유지)
2. **Phase 2**: API 엔드포인트 구축 (병행 운영)
3. **Phase 3**: React 컴포넌트 개발 (하이브리드)
4. **Phase 4**: 완전 React 전환

### **라우팅 전략**
```javascript
// Express 라우팅 (하이브리드)
app.use('/admin/api', adminApiRoutes);     // API 엔드포인트
app.use('/admin/react', reactRoutes);      // React SPA
app.use('/admin', traditionalRoutes);      // 기존 EJS 템플릿

// React Router 설정
<Router>
    <Routes>
        <Route path="/admin/react" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="artworks" element={<ArtworkManagement />} />
            <Route path="exhibitions" element={<ExhibitionManagement />} />
        </Route>
    </Routes>
</Router>
```

## **🔐 인증 및 보안**

### **JWT 기반 API 인증**
```javascript
// JWT 미들웨어
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

// RBAC 통합
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!rbacService.hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        next();
    };
};
```

### **React에서의 인증 처리**
```javascript
// AuthContext
const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// API 인터셉터
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

## **🧪 테스트 전략**

### **API 테스트**
- **단위 테스트**: 각 API 엔드포인트별 테스트
- **통합 테스트**: 전체 워크플로우 테스트
- **권한 테스트**: RBAC 시스템 검증

### **React 컴포넌트 테스트**
- **컴포넌트 렌더링**: React Testing Library 활용
- **사용자 상호작용**: 이벤트 시뮬레이션
- **API 통신**: Mock 서비스 활용

## **📊 성능 최적화**

### **React 최적화**
- **코드 스플리팅**: 라우트별 청크 분리
- **메모이제이션**: React.memo, useMemo, useCallback 활용
- **번들 크기**: Webpack Bundle Analyzer로 모니터링

### **API 최적화**
- **페이지네이션**: 대용량 데이터 처리
- **캐싱**: Redis 활용한 응답 캐싱
- **압축**: gzip 압축 적용

---

**💡 핵심 원칙**:
1. **점진적 전환**: 기존 기능 중단 없이 단계적 적용
2. **도메인 응집성**: 관련 기능을 도메인별로 그룹화
3. **API-First**: 프론트엔드와 백엔드 완전 분리
4. **재사용성**: 컴포넌트와 서비스의 재사용성 극대화
5. **보안 우선**: 기존 RBAC 시스템 활용 및 강화

자세한 Taskmaster 활용법은 **[Taskmaster 가이드](mdc:.roo/rules/taskmaster.md)**를 참조하세요.

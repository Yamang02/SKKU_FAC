/**
 * 전역 타입 정의
 * 애플리케이션 전반에서 사용되는 공통 타입들을 정의합니다.
 */

// 기본 API 응답 타입
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    error?: string;
    message?: string;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        items: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    error?: string;
    message?: string;
}

// 페이지네이션 요청 파라미터
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

// 필터 파라미터 기본 타입
export interface BaseFilterParams extends PaginationParams {
    search?: string;
    status?: string;
}

// 사용자 역할
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

// 사용자 상태
export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

// 작품 상태
export enum ArtworkStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    REJECTED = 'REJECTED',
}

// 전시 상태
export enum ExhibitionStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ACTIVE = 'ACTIVE',
    ENDED = 'ENDED',
    CANCELLED = 'CANCELLED',
}

// 기본 엔티티 타입
export interface BaseEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

// 에러 타입
export interface AppError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    statusCode?: number;
}

// 로딩 상태 타입
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

// 폼 필드 타입
export interface FormField<T = unknown> {
    value: T;
    error: string | null;
    touched: boolean;
    dirty: boolean;
}

// 모달 상태 타입
export interface ModalState {
    isOpen: boolean;
    data?: Record<string, unknown>;
}

// 테마 타입
export enum Theme {
    LIGHT = 'light',
    DARK = 'dark',
    AUTO = 'auto',
}

// 언어 타입
export enum Language {
    KO = 'ko',
    EN = 'en',
}

// 파일 업로드 타입
export interface FileUpload {
    file: File;
    preview?: string;
    progress?: number;
    error?: string;
}

// 검색 결과 타입
export interface SearchResult<T> {
    items: T[];
    total: number;
    query: string;
    filters?: Record<string, unknown>;
}

// 통계 데이터 타입
export interface StatisticsData {
    totalUsers: number;
    totalArtworks: number;
    totalExhibitions: number;
    totalVisitors: number;
    recentActivities: Activity[];
}

// 활동 로그 타입
export interface Activity {
    id: number;
    userId: number;
    userName: string;
    action: string;
    target: string;
    targetId?: number;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

// 알림 타입
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    timestamp: string;
}

// 브레드크럼 아이템 타입
export interface BreadcrumbItem {
    title: string;
    path?: string;
    icon?: React.ReactNode;
}

// 메뉴 아이템 타입
export interface MenuItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    path?: string;
    children?: MenuItem[];
    permission?: string;
}

// 컴포넌트 공통 Props 타입
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

// 이벤트 핸들러 타입
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// 유틸리티 타입들
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Vite 환경변수 타입 확장
declare global {
    interface ImportMetaEnv {
        readonly VITE_API_BASE_URL: string;
        readonly VITE_APP_TITLE: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

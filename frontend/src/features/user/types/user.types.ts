/**
 * Admin User 도메인 타입 정의
 * 백엔드 API 응답과 요청 구조에 맞게 정의
 * Admin 기능에만 집중
 */

// 관리자가 보는 사용자 상세 정보 - 백엔드 UserResponseDto 기준
export interface AdminUserDetail {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SKKU_MEMBER' | 'EXTERNAL_MEMBER';
    department: string | null;
    affiliation: string | null;
    studentYear: string | null;
    isClubMember?: boolean;
    emailVerified?: boolean;
    createdAt: string;
    updatedAt: string;
}

// 관리자용 사용자 생성 요청 - 백엔드 RegisterSchema 기준
export interface AdminCreateUserRequest {
    username: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'ADMIN' | 'SKKU_MEMBER' | 'EXTERNAL_MEMBER';
    department?: string;      // SKKU_MEMBER, ADMIN일 때 필수
    affiliation?: string;     // EXTERNAL_MEMBER일 때 필수
    studentYear?: string;     // SKKU_MEMBER, ADMIN일 때 필수
    isClubMember?: boolean;   // SKKU_MEMBER, ADMIN일 때만 설정 가능
}

// 관리자용 사용자 업데이트 요청 - 백엔드 UpdateProfileSchema 기준
export interface AdminUpdateUserRequest {
    name?: string;
    email?: string;
    role?: 'ADMIN' | 'SKKU_MEMBER' | 'EXTERNAL_MEMBER';
    department?: string;
    affiliation?: string;
    studentYear?: string;
    isClubMember?: boolean;
    emailVerified?: boolean;
}

// 사용자 검색 및 필터링 파라미터 - 백엔드 query params 기준
export interface AdminUserSearchParams {
    page?: number;
    limit?: number;
    search?: string;          // 백엔드에서 search 파라미터 사용
    role?: 'ADMIN' | 'SKKU_MEMBER' | 'EXTERNAL_MEMBER';
    status?: string;          // 백엔드에서 status 파라미터 사용
    sortBy?: 'id' | 'name' | 'email' | 'username' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

// 사용자 목록 응답 - 백엔드 userAdminService.getUserList() 응답 기준
export interface AdminUserListResponse {
    items: AdminUserDetail[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// 비밀번호 초기화 응답 - 백엔드 resetUserPassword 응답 기준
export interface AdminPasswordResetResponse {
    tempPassword: string;
    message: string;
}

// 사용자 통계 (관리자용) - 추후 백엔드 구현 시
export interface AdminUserStats {
    totalUsers: number;
    adminUsers: number;
    skkuMembers: number;
    externalMembers: number;
    clubMembers: number;
    verifiedUsers: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
}

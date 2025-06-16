export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    status: string;
    department: string;
    isClubMember: boolean;
    studentYear: string;
    skkuUserId: string;
    externalUserId: string;
    affiliation: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
    emailVerified: boolean;
}

export interface CreateUserRequest {
    username: string;
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
    affiliation: string;
    studentYear: number;
    isClubMember: boolean;
}

export interface UpdateUserRequest {
    name?: string;
    department?: string;
    studentYear?: number;
    affiliation?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserFilters {
    role?: string;
    department?: string;
    affiliation?: string;
    isClubMember?: boolean;
    search?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface FindUsernameRequest {
    email: string;
}

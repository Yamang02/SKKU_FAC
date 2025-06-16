/**
 * 사용자 관련 API
 */
import { apiClient, ApiResponse } from './client';
import { User } from '../../types';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    name: string;
    department?: string;
    studentYear?: number;
    affiliation?: string;
}

export interface FlashMessage {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

export class UserApi {
    /**
     * 회원가입
     */
    static async register(userData: RegisterData): Promise<ApiResponse<User>> {
        try {
            const response = await apiClient.post<{ user: User }>('/user', userData);

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data.user,
                };
            }

            return {
                success: false,
                error: response.error || '회원가입에 실패했습니다.',
            };
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);
            return {
                success: false,
                error: '회원가입에 실패했습니다.',
            };
        }
    }

    /**
     * 프로필 조회
     */
    static async getProfile(): Promise<ApiResponse<User>> {
        try {
            const response = await apiClient.get<User>('/user/api/me');
            return response;
        } catch (error: any) {
            console.error('프로필 조회 중 오류 발생:', error);

            // 401 오류인 경우 로그인 필요 메시지 반환
            if (error.statusCode === 401) {
                return {
                    success: false,
                    error: '로그인이 필요합니다.',
                };
            }

            // 기타 오류
            return {
                success: false,
                error: '사용자 정보를 불러오는 중 오류가 발생했습니다.',
            };
        }
    }

    /**
     * 프로필 수정
     */
    static async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
        try {
            const response = await apiClient.put<User>('/user/me', profileData);
            return response;
        } catch (error) {
            console.error('프로필 수정 중 오류 발생:', error);
            return {
                success: false,
                error: '프로필 수정에 실패했습니다.',
            };
        }
    }

    /**
     * 계정 삭제
     */
    static async deleteAccount(): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.delete<void>('/user/me');
            return response;
        } catch (error) {
            console.error('계정 삭제 중 오류 발생:', error);
            return {
                success: false,
                error: '계정 삭제에 실패했습니다.',
            };
        }
    }

    /**
     * 로그인
     */
    static async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
        try {
            const response = await apiClient.post<User>('/user/login', credentials);
            return response;
        } catch (error) {
            console.error('로그인 중 오류 발생:', error);
            return {
                success: false,
                error: '로그인에 실패했습니다.',
            };
        }
    }

    /**
     * 로그아웃
     */
    static async logout(): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.get<void>('/user/logout', {
                'Accept': 'application/json'
            });
            return response;
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            return {
                success: false,
                error: '로그아웃에 실패했습니다.',
            };
        }
    }

    /**
     * 세션 사용자 조회
     */
    static async getSessionUser(): Promise<ApiResponse<User>> {
        try {
            const response = await apiClient.get<User>('/user/api/session');
            return response;
        } catch (error) {
            console.error('세션 사용자 조회 중 오류 발생:', error);
            return {
                success: false,
                error: '세션 정보를 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 플래시 메시지 조회
     */
    static async getFlashMessage(): Promise<ApiResponse<FlashMessage | null>> {
        try {
            const response = await apiClient.get<FlashMessage | null>('/user/api/flash-message');
            return response;
        } catch (error) {
            console.error('플래시 메시지 조회 중 오류 발생:', error);
            // 에러가 발생해도 UI에 표시하지 않고 조용히 실패 처리
            return {
                success: false,
                error: '플래시 메시지를 조회하는 중 오류가 발생했습니다.',
                data: null,
            };
        }
    }

    /**
     * 아이디 찾기
     */
    static async findUsername(email: string): Promise<ApiResponse<{ username: string }>> {
        try {
            const response = await apiClient.get<{ username: string }>(`/user/api/find-username?email=${encodeURIComponent(email)}`);

            if (response.success && response.data) {
                return response;
            }

            return {
                success: false,
                error: response.error || '아이디 찾기에 실패했습니다.',
            };
        } catch (error) {
            console.error('아이디 찾기 중 오류 발생:', error);
            return {
                success: false,
                error: '아이디 찾기에 실패했습니다.',
            };
        }
    }
}

export default UserApi;

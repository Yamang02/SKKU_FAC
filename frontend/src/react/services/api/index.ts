/**
 * API 서비스 통합 인덱스
 */

// API 클라이언트
export { apiClient, type ApiResponse, type ApiClientConfig } from './client';

// API 서비스들
export { ArtworkApi, type ArtworkListResponse, type ArtworkFilters } from './artworkApi';
export { ExhibitionApi, type ExhibitionListParams, type ExhibitionListResponse } from './exhibitionApi';
export { UserApi, type LoginCredentials, type RegisterData, type FlashMessage } from './userApi';
export { AuthApi, type PasswordResetRequest, type PasswordResetData, type TokenResendRequest, type TokenValidationParams } from './authApi';

// 홈페이지 API (기존)
export { homeApi } from './homeApi';

// 기본 내보내기
import { ArtworkApi } from './artworkApi';
import { ExhibitionApi } from './exhibitionApi';
import { UserApi } from './userApi';
import { AuthApi } from './authApi';
import { homeApi } from './homeApi';

export default {
    Artwork: ArtworkApi,
    Exhibition: ExhibitionApi,
    User: UserApi,
    Auth: AuthApi,
    Home: homeApi,
};

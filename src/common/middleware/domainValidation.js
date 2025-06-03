import { validateWithDto, validateMultiple, validateIf } from './dtoValidation.js';

// DTO 클래스 임포트
import UserRequestDto from '../../domain/user/model/dto/UserRequestDto.js';
import UserResponseDto from '../../domain/user/model/dto/UserResponseDto.js';
import ArtworkRequestDto from '../../domain/artwork/model/dto/ArtworkRequestDto.js';
import ArtworkResponseDto from '../../domain/artwork/model/dto/ArtworkResponseDto.js';
import ExhibitionRequestDto from '../../domain/exhibition/model/dto/ExhibitionRequestDto.js';
import AuthRequestDto from '../../domain/auth/model/AuthRequestDto.js';
import AdminRequestDto from '../../domain/admin/model/AdminRequestDto.js';

/**
 * 사용자 도메인 검증 미들웨어
 */
export const UserValidation = {
    // 사용자 등록 검증
    validateRegister: validateWithDto(
        UserRequestDto,
        UserRequestDto.getRegisterSchema,
        { source: 'body', dtoProperty: 'userDto' }
    ),

    // 로그인 검증
    validateLogin: validateWithDto(
        UserRequestDto,
        UserRequestDto.getLoginSchema,
        { source: 'body', dtoProperty: 'userDto' }
    ),

    // 프로필 업데이트 검증
    validateUpdateProfile: validateWithDto(
        UserRequestDto,
        UserRequestDto.getUpdateProfileSchema,
        { source: 'body', dtoProperty: 'userDto' }
    ),

    // 이메일 검증 (쿼리 파라미터)
    validateEmailQuery: validateWithDto(
        UserRequestDto,
        UserRequestDto.getEmailSchema,
        { source: 'query', dtoProperty: 'emailDto' }
    ),

    // 비밀번호 재설정 검증
    validateResetPassword: validateWithDto(
        UserRequestDto,
        UserRequestDto.getResetPasswordSchema,
        { source: 'body', dtoProperty: 'userDto' }
    ),

    // 응답 검증 (개발 환경)
    validateUserResponse: validateWithDto(
        UserResponseDto,
        UserResponseDto.responseSchema,
        { source: 'body', attachDto: false }
    )
};

/**
 * 작품 도메인 검증 미들웨어
 */
export const ArtworkValidation = {
    // 작품 생성 검증
    validateCreate: validateWithDto(
        ArtworkRequestDto,
        ArtworkRequestDto.createSchema,
        { source: 'body', dtoProperty: 'artworkDto' }
    ),

    // 작품 업데이트 검증
    validateUpdate: validateWithDto(
        ArtworkRequestDto,
        ArtworkRequestDto.updateSchema,
        { source: 'body', dtoProperty: 'artworkDto' }
    ),

    // 작품 목록 쿼리 검증
    validateListQuery: validateWithDto(
        ArtworkRequestDto,
        ArtworkRequestDto.listQuerySchema,
        { source: 'query', dtoProperty: 'queryDto' }
    ),

    // 작품 응답 검증 (개발 환경)
    validateArtworkResponse: validateWithDto(
        ArtworkResponseDto,
        ArtworkResponseDto.responseSchema,
        { source: 'body', attachDto: false }
    )
};

/**
 * 전시회 도메인 검증 미들웨어
 */
export const ExhibitionValidation = {
    // 전시회 생성 검증
    validateCreate: validateWithDto(
        ExhibitionRequestDto,
        ExhibitionRequestDto.createSchema,
        { source: 'body', dtoProperty: 'exhibitionDto' }
    ),

    // 전시회 업데이트 검증
    validateUpdate: validateWithDto(
        ExhibitionRequestDto,
        ExhibitionRequestDto.updateSchema,
        { source: 'body', dtoProperty: 'exhibitionDto' }
    ),

    // 전시회 목록 쿼리 검증
    validateListQuery: validateWithDto(
        ExhibitionRequestDto,
        ExhibitionRequestDto.listQuerySchema,
        { source: 'query', dtoProperty: 'queryDto' }
    )
};

/**
 * 인증 도메인 검증 미들웨어
 */
export const AuthValidation = {
    // 비밀번호 재설정 요청 검증
    validatePasswordResetRequest: validateWithDto(
        AuthRequestDto,
        AuthRequestDto.passwordResetRequestSchema,
        { source: 'body', dtoProperty: 'authDto' }
    ),

    // 비밀번호 재설정 검증
    validatePasswordReset: validateWithDto(
        AuthRequestDto,
        AuthRequestDto.passwordResetSchema,
        { source: 'body', dtoProperty: 'authDto' }
    ),

    // 토큰 검증 요청
    validateTokenVerification: validateWithDto(
        AuthRequestDto,
        AuthRequestDto.tokenVerificationSchema,
        { source: 'body', dtoProperty: 'authDto' }
    ),

    // JWT 로그인 검증
    validateJwtLogin: validateWithDto(
        AuthRequestDto,
        AuthRequestDto.jwtLoginSchema,
        { source: 'body', dtoProperty: 'authDto' }
    ),

    // JWT 토큰 갱신 검증
    validateJwtRefresh: validateWithDto(
        AuthRequestDto,
        AuthRequestDto.jwtRefreshSchema,
        { source: 'body', dtoProperty: 'authDto' }
    ),

    // 이메일 인증 검증
    validateEmailVerification: validateWithDto(
        AuthRequestDto,
        AuthRequestDto.emailVerificationSchema,
        { source: 'body', dtoProperty: 'authDto' }
    )
};

/**
 * 관리자 도메인 검증 미들웨어
 */
export const AdminValidation = {
    // 사용자 관리 업데이트 검증
    validateUserManagementUpdate: validateWithDto(
        AdminRequestDto,
        AdminRequestDto.userManagementUpdateSchema,
        { source: 'body', dtoProperty: 'adminDto' }
    ),

    // 작품 관리 업데이트 검증
    validateArtworkManagementUpdate: validateWithDto(
        AdminRequestDto,
        AdminRequestDto.artworkManagementUpdateSchema,
        { source: 'body', dtoProperty: 'adminDto' }
    ),

    // 전시회 관리 업데이트 검증
    validateExhibitionManagementUpdate: validateWithDto(
        AdminRequestDto,
        AdminRequestDto.exhibitionManagementUpdateSchema,
        { source: 'body', dtoProperty: 'adminDto' }
    ),

    // 시스템 설정 업데이트 검증
    validateSystemSettingsUpdate: validateWithDto(
        AdminRequestDto,
        AdminRequestDto.systemSettingsUpdateSchema,
        { source: 'body', dtoProperty: 'adminDto' }
    ),

    // 목록 필터 검증
    validateListFilter: validateWithDto(
        AdminRequestDto,
        AdminRequestDto.listFilterSchema,
        { source: 'query', dtoProperty: 'filterDto' }
    ),

    // 비밀번호 초기화 검증
    validatePasswordReset: validateWithDto(
        AdminRequestDto,
        AdminRequestDto.passwordResetSchema,
        { source: 'body', dtoProperty: 'adminDto' }
    )
};

/**
 * 복합 검증 미들웨어
 * 여러 도메인의 검증을 조합하여 사용
 */
export const CompositeValidation = {
    // 사용자 등록 + 파일 업로드 (프로필 이미지)
    validateUserRegistrationWithFile: validateMultiple([
        {
            DtoClass: UserRequestDto,
            schemaMethod: UserRequestDto.getRegisterSchema,
            source: 'body',
            dtoProperty: 'userDto'
        }
        // 파일 검증은 별도 미들웨어에서 처리
    ]),

    // 작품 생성 + 이미지 업로드
    validateArtworkCreationWithImages: validateMultiple([
        {
            DtoClass: ArtworkRequestDto,
            schemaMethod: ArtworkRequestDto.createSchema,
            source: 'body',
            dtoProperty: 'artworkDto'
        }
        // 이미지 파일 검증은 별도 미들웨어에서 처리
    ]),

    // 관리자 권한 + 사용자 업데이트
    validateAdminUserUpdate: validateMultiple([
        {
            DtoClass: AdminRequestDto,
            schemaMethod: AdminRequestDto.userManagementUpdateSchema,
            source: 'body',
            dtoProperty: 'adminDto',
            condition: (req) => req.user && req.user.role === 'ADMIN'
        }
    ])
};

/**
 * 조건부 검증 미들웨어
 */
export const ConditionalValidation = {
    // 로그인한 사용자만 프로필 업데이트 검증
    validateProfileUpdateIfAuthenticated: validateIf(
        (req) => req.user && req.user.id,
        UserValidation.validateUpdateProfile
    ),

    // 관리자만 관리 기능 검증
    validateAdminOnlyOperations: validateIf(
        (req) => req.user && req.user.role === 'ADMIN',
        AdminValidation.validateUserManagementUpdate
    ),

    // 작품 소유자 또는 관리자만 작품 업데이트 검증
    validateArtworkUpdateIfOwnerOrAdmin: validateIf(
        (req) => {
            const user = req.user;
            const artworkId = req.params.id;
            // 실제 구현에서는 작품 소유자 확인 로직 필요
            return user && (user.role === 'ADMIN' || user.artworks?.includes(artworkId));
        },
        ArtworkValidation.validateUpdate
    )
};

/**
 * 통합 검증 미들웨어 내보내기
 */
export default {
    User: UserValidation,
    Artwork: ArtworkValidation,
    Exhibition: ExhibitionValidation,
    Auth: AuthValidation,
    Admin: AdminValidation,
    Composite: CompositeValidation,
    Conditional: ConditionalValidation
};

/**
 * 로그인 테스트용 대표 사용자 데이터
 * 각 역할별로 하나씩 선정된 실제 활성화된 계정들
 */

/**
 * 대표 사용자 계정 정보
 * 비밀번호는 모두 '1234'로 통일됨
 */
export const LOGIN_TEST_USERS = {
    // 관리자 계정
    ADMIN: {
        username: 'skkfntclbdmnsttrt',
        email: 'skkfntclbdmnsttrt@gmail.com',
        password: '1234',
        role: 'ADMIN',
        name: '성미화 관리자',
        description: '시스템 관리자 권한 테스트용'
    },

    // SKKU 멤버 계정
    SKKU_MEMBER: {
        username: 'duplicate1749455784069',
        email: 'duplicate1749455784069@skku.edu',
        password: '1234',
        role: 'SKKU_MEMBER',
        name: '성균관대 테스트 사용자',
        description: 'SKKU 멤버 권한 테스트용'
    },

    // 외부 멤버 계정
    EXTERNAL_MEMBER: {
        username: 'external1749455846376',
        email: 'external1749455846376@example.com',
        password: '1234',
        role: 'EXTERNAL_MEMBER',
        name: '외부 테스트 사용자',
        description: '외부 멤버 권한 테스트용'
    }
};

/**
 * 역할별 사용자 가져오기
 */
export function getUserByRole(role) {
    return LOGIN_TEST_USERS[role];
}

/**
 * 모든 테스트 사용자 가져오기
 */
export function getAllTestUsers() {
    return Object.values(LOGIN_TEST_USERS);
}

/**
 * 특정 권한이 필요한 기능 테스트를 위한 사용자 선택
 */
export function getUserForFeature(featureType) {
    const featureUserMapping = {
        // 관리자만 접근 가능한 기능들
        'admin_panel': LOGIN_TEST_USERS.ADMIN,
        'user_management': LOGIN_TEST_USERS.ADMIN,
        'system_settings': LOGIN_TEST_USERS.ADMIN,
        'artwork_approval': LOGIN_TEST_USERS.ADMIN,

        // SKKU 멤버 전용 기능들
        'skku_artwork_upload': LOGIN_TEST_USERS.SKKU_MEMBER,
        'skku_exhibition_create': LOGIN_TEST_USERS.SKKU_MEMBER,
        'club_features': LOGIN_TEST_USERS.SKKU_MEMBER,

        // 외부 멤버 접근 가능한 기능들
        'external_artwork_upload': LOGIN_TEST_USERS.EXTERNAL_MEMBER,
        'public_exhibition_view': LOGIN_TEST_USERS.EXTERNAL_MEMBER,

        // 모든 로그인 사용자 접근 가능한 기능들 (기본적으로 SKKU 멤버 사용)
        'profile_edit': LOGIN_TEST_USERS.SKKU_MEMBER,
        'artwork_view': LOGIN_TEST_USERS.SKKU_MEMBER,
        'exhibition_view': LOGIN_TEST_USERS.SKKU_MEMBER,
        'comment_write': LOGIN_TEST_USERS.SKKU_MEMBER
    };

    return featureUserMapping[featureType] || LOGIN_TEST_USERS.SKKU_MEMBER;
}

/**
 * 권한 레벨별 사용자 가져오기
 */
export function getUsersByPermissionLevel() {
    return {
        highest: LOGIN_TEST_USERS.ADMIN,           // 최고 권한
        medium: LOGIN_TEST_USERS.SKKU_MEMBER,      // 중간 권한
        basic: LOGIN_TEST_USERS.EXTERNAL_MEMBER    // 기본 권한
    };
}

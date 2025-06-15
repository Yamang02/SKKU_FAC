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
 * 사용자 수정/삭제 테스트 전용 사용자 데이터
 * 비밀번호는 'testpassword123'으로 통일됨
 */
export const USER_MODIFICATION_TEST_USERS = {
    // 프로필 수정 테스트용 사용자들
    MODIFY_SKKU: {
        username: 'skku2',
        email: 'skkutest1749612897486@skku.edu',
        password: '1234',
        role: 'SKKU_MEMBER',
        name: '성균관대 테스트 사용자2',
        description: 'SKKU 멤버 프로필 수정 테스트용',
        originalProfile: {
            department: '컴퓨터공학과',
            studentYear: '23',
            isClubMember: true
        },
        modifyProfile: {
            name: '수정된 성균관대 사용자2',
            department: '소프트웨어학과',
            studentYear: '22',
            isClubMember: false
        }
    },

    MODIFY_EXTERNAL: {
        username: 'external2',
        email: 'external1749612770942@example.com',
        password: '1234',
        role: 'EXTERNAL_MEMBER',
        name: '외부 테스트 사용자2',
        description: '외부 멤버 프로필 수정 테스트용',
        originalProfile: {
            affiliation: '외부 기관'
        },
        modifyProfile: {
            name: '수정된 외부 사용자2',
            affiliation: '수정된 외부 기관'
        }
    },

    // 계정 삭제 테스트용 사용자들 (인증된 사용자 사용)
    DELETE_SKKU: {
        username: 'skku1',
        email: 'skkutest1749612967060@skku.edu',
        password: '1234',
        role: 'SKKU_MEMBER',
        name: '성균관대 테스트 사용자1',
        description: 'SKKU 멤버 계정 삭제 테스트용'
    },

    DELETE_EXTERNAL: {
        username: 'external1',
        email: 'external1749612974850@example.com',
        password: '1234',
        role: 'EXTERNAL_MEMBER',
        name: '외부 테스트 사용자1',
        description: '외부 멤버 계정 삭제 테스트용'
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
 * 사용자 수정/삭제 테스트용 사용자 가져오기
 */
export function getModificationTestUsers() {
    return USER_MODIFICATION_TEST_USERS;
}

/**
 * 수정 테스트용 사용자 가져오기
 */
export function getModifyTestUser(userType) {
    const userMapping = {
        'skku': USER_MODIFICATION_TEST_USERS.MODIFY_SKKU,
        'external': USER_MODIFICATION_TEST_USERS.MODIFY_EXTERNAL
    };
    return userMapping[userType];
}

/**
 * 삭제 테스트용 사용자 가져오기
 */
export function getDeleteTestUser(userType) {
    const userMapping = {
        'skku': USER_MODIFICATION_TEST_USERS.DELETE_SKKU,
        'external': USER_MODIFICATION_TEST_USERS.DELETE_EXTERNAL
    };
    return userMapping[userType];
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
        'comment_write': LOGIN_TEST_USERS.SKKU_MEMBER,

        // 사용자 수정/삭제 테스트 기능들
        'profile_modification': USER_MODIFICATION_TEST_USERS.MODIFY_SKKU,
        'account_deletion': USER_MODIFICATION_TEST_USERS.DELETE_SKKU
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

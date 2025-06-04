/**
 * 간단한 테스트 데이터 생성 헬퍼
 * 복잡한 팩토리 패턴 없이 실용적인 테스트 데이터 제공
 */

// 기본 카운터 (고유 ID 생성용)
let counter = 1;

/**
 * 고유 ID 생성
 */
export const generateId = () => counter++;

/**
 * 기본 사용자 데이터 생성
 */
export const createTestUser = (overrides = {}) => ({
    id: generateId(),
    username: `testuser${generateId()}`,
    name: '테스트 사용자',
    email: `test${generateId()}@test.com`,
    password: 'Test123!@#',
    role: 'SKKU_MEMBER',
    department: '컴퓨터공학과',
    affiliation: '성균관대학교',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

/**
 * 관리자 사용자 데이터 생성
 */
export const createTestAdmin = (overrides = {}) =>
    createTestUser({
        role: 'ADMIN',
        username: `admin${generateId()}`,
        email: `admin${generateId()}@skku.edu`,
        ...overrides,
    });

/**
 * 기본 작품 데이터 생성
 */
export const createTestArtwork = (overrides = {}) => ({
    id: generateId(),
    title: `테스트 작품 ${generateId()}`,
    description: '테스트용 작품 설명입니다.',
    medium: '유화',
    dimensions: '50x70cm',
    creationYear: 2024,
    imageUrl: 'https://example.com/test-image.jpg',
    artistId: 1,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

/**
 * 기본 전시회 데이터 생성
 */
export const createTestExhibition = (overrides = {}) => ({
    id: generateId(),
    title: `테스트 전시회 ${generateId()}`,
    description: '테스트용 전시회 설명입니다.',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    location: '테스트 갤러리',
    isFeatured: false,
    submissionOpen: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

/**
 * 로그인 데이터 생성
 */
export const createLoginData = (overrides = {}) => ({
    username: `testuser${generateId()}`,
    password: 'Test123!@#',
    ...overrides,
});

/**
 * 회원가입 데이터 생성
 */
export const createSignupData = (overrides = {}) => ({
    username: `newuser${generateId()}`,
    name: '새로운 사용자',
    email: `newuser${generateId()}@test.com`,
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
    role: 'SKKU_MEMBER',
    department: '컴퓨터공학과',
    affiliation: '성균관대학교',
    ...overrides,
});

/**
 * 카운터 리셋 (테스트 간 독립성 보장)
 */
export const resetCounter = () => {
    counter = 1;
};

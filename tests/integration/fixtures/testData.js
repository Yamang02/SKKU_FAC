/**
 * 🧪 테스트 픽스처 데이터
 */
import bcrypt from 'bcrypt';
import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

/**
 * UUID 생성 헬퍼
 */
function generateUserId() {
    return `USER_${uuidv4()}`;
}

function generateExhibitionId() {
    return `EXHIBITION_${uuidv4()}`;
}

function generateArtworkId() {
    return `ARTWORK_${uuidv4()}`;
}

function generateSkkuProfileId() {
    return `SKKU_PROFILE_${uuidv4()}`;
}

/**
 * 테스트 사용자 데이터
 */
export const testUsers = {
    regularUser: {
        id: generateUserId(),
        username: 'testuser',
        email: 'test@skku.edu',
        password: 'testpassword',
        hashedPassword: '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z',
        name: 'Test User',
        role: 'SKKU_MEMBER',
        status: 'ACTIVE',
        emailVerified: true,
    },
    adminUser: {
        id: generateUserId(),
        username: 'testadmin',
        email: 'admin@skku.edu',
        password: 'adminpassword',
        hashedPassword: '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z',
        name: 'Test Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
    },
    inactiveUser: {
        id: generateUserId(),
        username: 'inactiveuser',
        email: 'inactive@skku.edu',
        password: 'testpassword',
        hashedPassword: '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z',
        name: 'Inactive User',
        role: 'SKKU_MEMBER',
        status: 'INACTIVE',
        emailVerified: false,
    },
    externalUser: {
        id: generateUserId(),
        username: 'externaluser',
        email: 'external@example.com',
        password: 'testpassword',
        hashedPassword: '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z',
        name: 'External User',
        role: 'EXTERNAL_MEMBER',
        status: 'ACTIVE',
        emailVerified: true,
    },
};

/**
 * 테스트 SKKU 사용자 프로필 데이터
 */
export const testSkkuProfiles = {
    regularProfile: {
        id: generateSkkuProfileId(),
        userId: testUsers.regularUser.id,
        department: 'Fine Art',
        studentYear: '2024',
        isClubMember: true,
    },
    adminProfile: {
        id: generateSkkuProfileId(),
        userId: testUsers.adminUser.id,
        department: 'Art Administration',
        studentYear: '2023',
        isClubMember: true,
    },
};

/**
 * 테스트 전시회 데이터
 */
export const testExhibitions = {
    activeExhibition: {
        id: generateExhibitionId(),
        title: 'Test Active Exhibition',
        description: 'This is a test active exhibition',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        location: 'Test Gallery A',
        exhibitionType: 'regular',
        isSubmissionOpen: true,
        isFeatured: false,
    },
    featuredExhibition: {
        id: generateExhibitionId(),
        title: 'Test Featured Exhibition',
        description: 'This is a test featured exhibition',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        location: 'Test Gallery B',
        exhibitionType: 'special',
        isSubmissionOpen: false,
        isFeatured: true,
    },
    pastExhibition: {
        id: generateExhibitionId(),
        title: 'Test Past Exhibition',
        description: 'This is a test past exhibition',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        location: 'Test Gallery C',
        exhibitionType: 'regular',
        isSubmissionOpen: false,
        isFeatured: false,
    },
};

/**
 * 테스트 작품 데이터
 */
export const testArtworks = {
    artwork1: {
        id: generateArtworkId(),
        title: 'Test Artwork 1',
        slug: 'test-artwork-1',
        description: 'This is the first test artwork',
        medium: 'Oil on Canvas',
        size: '100x80cm',
        year: '2024',
        imageUrl: 'https://example.com/test-image-1.jpg',
        isFeatured: false,
        userId: testUsers.regularUser.id,
        status: 'APPROVED',
    },
    artwork2: {
        id: generateArtworkId(),
        title: 'Test Artwork 2',
        slug: 'test-artwork-2',
        description: 'This is the second test artwork',
        medium: 'Acrylic on Canvas',
        size: '120x90cm',
        year: '2024',
        imageUrl: 'https://example.com/test-image-2.jpg',
        isFeatured: true,
        userId: testUsers.regularUser.id,
        status: 'APPROVED',
    },
    pendingArtwork: {
        id: generateArtworkId(),
        title: 'Test Pending Artwork',
        slug: 'test-pending-artwork',
        description: 'This is a pending test artwork',
        medium: 'Watercolor',
        size: '50x40cm',
        year: '2024',
        imageUrl: 'https://example.com/test-image-3.jpg',
        isFeatured: false,
        userId: testUsers.regularUser.id,
        status: 'PENDING',
    },
};

/**
 * API 테스트용 요청 데이터
 */
export const testApiRequests = {
    validSignup: {
        username: 'newuser',
        name: 'New Test User',
        email: 'newuser@skku.edu',
        password: 'newpassword',
        confirmPassword: 'newpassword',
        department: 'Digital Art',
        studentYear: '2024',
    },
    invalidSignup: {
        username: '',
        name: '',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456',
        department: '',
        studentYear: '',
    },
    validLogin: {
        email: 'test@skku.edu',
        password: 'testpassword',
    },
    invalidLogin: {
        email: 'test@skku.edu',
        password: 'wrongpassword',
    },
    validExhibition: {
        title: 'New Test Exhibition',
        description: 'A new exhibition for testing',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        location: 'New Test Gallery',
        exhibitionType: 'regular',
    },
    invalidExhibition: {
        title: '',
        description: '',
        startDate: 'invalid-date',
        endDate: 'invalid-date',
        location: '',
        exhibitionType: 'invalid',
    },
    validArtwork: {
        title: 'New Test Artwork',
        description: 'A new artwork for testing',
        medium: 'Mixed Media',
        size: '150x100cm',
        year: '2024',
    },
    invalidArtwork: {
        title: '',
        description: '',
        medium: '',
        size: '',
        year: 'invalid-year',
    },
};

/**
 * 테스트 응답 템플릿
 */
export const expectedResponses = {
    healthCheck: {
        status: 'OK',
        timestamp: expect.any(String),
        database: {
            status: 'connected',
        },
        redis: {
            status: 'connected',
        },
        uptime: expect.any(Number),
        environment: 'test',
        version: expect.any(String),
    },
    successResponse: {
        success: true,
        message: expect.any(String),
        data: expect.any(Object),
    },
    errorResponse: {
        success: false,
        error: expect.any(String),
        message: expect.any(String),
    },
    paginatedResponse: {
        success: true,
        data: expect.any(Array),
        pagination: {
            page: expect.any(Number),
            limit: expect.any(Number),
            total: expect.any(Number),
            totalPages: expect.any(Number),
        },
    },
};

/**
 * 테스트 환경 설정
 */
export const testConfig = {
    baseURL: 'http://localhost:3000',
    timeout: 30000,
    retries: 2,
    database: {
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: 'testpassword',
        database: 'skku_sfa_gallery_test',
    },
    redis: {
        url: 'redis://localhost:6380',
    },
};

/**
 * 비밀번호 해시 생성 헬퍼
 */
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * 테스트 데이터 생성 헬퍼
 */
export function createTestUser(overrides = {}) {
    return {
        ...testUsers.regularUser,
        id: generateUserId(),
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@skku.edu`,
        ...overrides,
    };
}

export function createTestExhibition(overrides = {}) {
    return {
        ...testExhibitions.activeExhibition,
        id: generateExhibitionId(),
        title: `Test Exhibition ${Date.now()}`,
        ...overrides,
    };
}

export function createTestArtwork(overrides = {}) {
    return {
        ...testArtworks.artwork1,
        id: generateArtworkId(),
        title: `Test Artwork ${Date.now()}`,
        slug: `test-artwork-${Date.now()}`,
        ...overrides,
    };
}

/**
 * 랜덤 테스트 데이터 생성
 */
export function generateRandomUser() {
    const timestamp = Date.now();
    return {
        id: generateUserId(),
        username: `testuser_${timestamp}`,
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@skku.edu`,
        password: 'testpassword',
        role: 'SKKU_MEMBER',
        status: 'ACTIVE',
        emailVerified: true,
    };
}

export function generateRandomExhibition() {
    const timestamp = Date.now();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    return {
        id: generateExhibitionId(),
        title: `Test Exhibition ${timestamp}`,
        description: `Test exhibition description ${timestamp}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        location: `Test Gallery ${timestamp}`,
        exhibitionType: 'regular',
        isSubmissionOpen: true,
        isFeatured: false,
    };
}

export function generateRandomArtwork(userId = null) {
    const timestamp = Date.now();
    return {
        id: generateArtworkId(),
        title: `Test Artwork ${timestamp}`,
        slug: `test-artwork-${timestamp}`,
        description: `Test artwork description ${timestamp}`,
        medium: 'Test Medium',
        size: '100x80cm',
        year: new Date().getFullYear().toString(),
        imageUrl: `https://example.com/test-${timestamp}.jpg`,
        isFeatured: false,
        userId: userId || generateUserId(),
        status: 'APPROVED',
    };
}

/**
 * 🎣 Playwright 테스트 훅 유틸리티
 * 테스트 데이터 시딩과 정리를 자동화하는 훅 시스템
 */
import { test } from '@playwright/test';
import testDataSeeder from './testDataSeeder.js';
import dockerTestSetup from './dockerTestSetup.js';

/**
 * 🧪 테스트 훅 설정 옵션
 */
const DEFAULT_HOOK_OPTIONS = {
    seedData: true, // 테스트 데이터 자동 시딩
    cleanupAfter: true, // 테스트 후 자동 정리
    quickCleanup: false, // 빠른 정리 모드 (트랜잭션 사용)
    seedTypes: ['users', 'exhibitions', 'artworks', 'relationships'], // 시딩할 데이터 타입
    isolateTests: true, // 테스트 간 격리
    retryOnFailure: true, // 실패 시 재시도
};

/**
 * 🔧 테스트 훅 관리자 클래스
 */
class TestHooks {
    constructor() {
        this.isInitialized = false;
        this.currentTestData = null;
        this.hookOptions = { ...DEFAULT_HOOK_OPTIONS };
    }

    /**
     * ⚙️ 훅 옵션 설정
     */
    configure(options = {}) {
        this.hookOptions = { ...DEFAULT_HOOK_OPTIONS, ...options };
        return this;
    }

    /**
     * 🚀 테스트 스위트 시작 전 초기화
     */
    async beforeAll() {
        console.log('🚀 Initializing test environment...');

        try {
            // Docker 테스트 환경 확인
            await dockerTestSetup.ensureTestEnvironment();

            // 테스트 데이터 시더 초기화
            await testDataSeeder.initialize();

            this.isInitialized = true;
            console.log('✅ Test environment initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize test environment:', error);
            throw error;
        }
    }

    /**
     * 🧹 테스트 스위트 종료 후 정리
     */
    async afterAll() {
        console.log('🧹 Cleaning up test environment...');

        try {
            if (this.isInitialized) {
                // 모든 테스트 데이터 정리
                await testDataSeeder.cleanup();

                // Docker 컨테이너 정리
                await dockerTestSetup.cleanup();
            }

            console.log('✅ Test environment cleanup completed');
        } catch (error) {
            console.error('❌ Error during test environment cleanup:', error);
            // 정리 실패는 로그만 남기고 계속 진행
        }
    }

    /**
     * 🔄 각 테스트 시작 전 설정
     */
    async beforeEach() {
        if (!this.isInitialized) {
            throw new Error('Test environment not initialized. Call beforeAll() first.');
        }

        try {
            // 테스트 격리를 위한 정리
            if (this.hookOptions.isolateTests) {
                if (this.hookOptions.quickCleanup) {
                    await testDataSeeder.quickCleanup();
                } else {
                    await testDataSeeder.cleanup();
                }
            }

            // 테스트 데이터 시딩
            if (this.hookOptions.seedData) {
                this.currentTestData = await this.seedTestData();
            }

            console.log('🔄 Test setup completed');
        } catch (error) {
            console.error('❌ Error during test setup:', error);

            if (this.hookOptions.retryOnFailure) {
                console.log('🔄 Retrying test setup...');
                await this.beforeEach(); // 재시도
            } else {
                throw error;
            }
        }
    }

    /**
     * 🧽 각 테스트 종료 후 정리
     */
    async afterEach() {
        try {
            if (this.hookOptions.cleanupAfter && this.currentTestData) {
                if (this.hookOptions.quickCleanup) {
                    await testDataSeeder.quickCleanup();
                } else {
                    await testDataSeeder.cleanup();
                }

                this.currentTestData = null;
            }

            console.log('🧽 Test cleanup completed');
        } catch (error) {
            console.error('❌ Error during test cleanup:', error);
            // 정리 실패는 로그만 남기고 계속 진행
        }
    }

    /**
     * 🌱 테스트 데이터 시딩
     */
    async seedTestData() {
        const seedTypes = this.hookOptions.seedTypes;
        const seededData = {};

        console.log(`🌱 Seeding test data: ${seedTypes.join(', ')}`);

        try {
            if (seedTypes.includes('users')) {
                await testDataSeeder.seedUsers();
                seededData.users = testDataSeeder.getSeededDataByType('users');
            }

            if (seedTypes.includes('exhibitions')) {
                await testDataSeeder.seedExhibitions();
                seededData.exhibitions = testDataSeeder.getSeededDataByType('exhibitions');
            }

            if (seedTypes.includes('artworks')) {
                await testDataSeeder.seedArtworks();
                seededData.artworks = testDataSeeder.getSeededDataByType('artworks');
            }

            if (seedTypes.includes('relationships')) {
                await testDataSeeder.seedArtworkExhibitionRelationships();
                seededData.relationships = testDataSeeder.getSeededDataByType('relationships');
            }

            console.log('✅ Test data seeding completed');
            return seededData;
        } catch (error) {
            console.error('❌ Error during test data seeding:', error);
            throw error;
        }
    }

    /**
     * 📊 현재 시딩된 데이터 조회
     */
    getCurrentTestData() {
        return this.currentTestData;
    }

    /**
     * 🎯 특정 타입의 시딩된 데이터 조회
     */
    getSeededData(type) {
        return testDataSeeder.getSeededDataByType(type);
    }

    /**
     * 👤 시딩된 사용자 조회
     */
    getSeededUser(key) {
        return testDataSeeder.getSeededUser(key);
    }

    /**
     * 🎨 시딩된 전시회 조회
     */
    getSeededExhibition(key) {
        return testDataSeeder.getSeededExhibition(key);
    }

    /**
     * 🖼️ 시딩된 작품 조회
     */
    getSeededArtwork(key) {
        return testDataSeeder.getSeededArtwork(key);
    }

    /**
     * 🔄 특정 타입 재시딩
     */
    async reseedData(type) {
        await testDataSeeder.reseedType(type);

        // 현재 테스트 데이터 업데이트
        if (this.currentTestData) {
            this.currentTestData[type] = testDataSeeder.getSeededDataByType(type);
        }
    }
}

// 싱글톤 인스턴스 생성
const testHooks = new TestHooks();

/**
 * 🎯 편의 함수들 - Playwright 테스트에서 직접 사용
 */

/**
 * 🚀 완전한 테스트 환경 설정 (모든 데이터 시딩)
 */
export const setupFullTestEnvironment = (options = {}) => {
    const hooks = testHooks.configure(options);

    test.beforeAll(async () => {
        await hooks.beforeAll();
    });

    test.beforeEach(async () => {
        await hooks.beforeEach();
    });

    test.afterEach(async () => {
        await hooks.afterEach();
    });

    test.afterAll(async () => {
        await hooks.afterAll();
    });

    return hooks;
};

/**
 * 🎯 최소한의 테스트 환경 설정 (데이터 시딩 없음)
 */
export const setupMinimalTestEnvironment = () => {
    return setupFullTestEnvironment({
        seedData: false,
        cleanupAfter: false,
        isolateTests: false,
    });
};

/**
 * 🔄 사용자 데이터만 시딩하는 환경
 */
export const setupUserOnlyTestEnvironment = () => {
    return setupFullTestEnvironment({
        seedTypes: ['users'],
        quickCleanup: true,
    });
};

/**
 * 🎨 전시회 관련 테스트 환경
 */
export const setupExhibitionTestEnvironment = () => {
    return setupFullTestEnvironment({
        seedTypes: ['users', 'exhibitions'],
        quickCleanup: true,
    });
};

/**
 * 🖼️ 작품 관련 테스트 환경
 */
export const setupArtworkTestEnvironment = () => {
    return setupFullTestEnvironment({
        seedTypes: ['users', 'exhibitions', 'artworks', 'relationships'],
        quickCleanup: true,
    });
};

/**
 * ⚡ 빠른 테스트 환경 (성능 최적화)
 */
export const setupFastTestEnvironment = () => {
    return setupFullTestEnvironment({
        quickCleanup: true,
        isolateTests: true,
        retryOnFailure: false,
    });
};

/**
 * 🧪 커스텀 테스트 환경 설정
 */
export const setupCustomTestEnvironment = customOptions => {
    return setupFullTestEnvironment(customOptions);
};

/**
 * 📊 테스트 데이터 접근 헬퍼
 */
export const getTestData = () => testHooks.getCurrentTestData();
export const getSeededUser = key => testHooks.getSeededUser(key);
export const getSeededExhibition = key => testHooks.getSeededExhibition(key);
export const getSeededArtwork = key => testHooks.getSeededArtwork(key);
export const reseedTestData = type => testHooks.reseedData(type);

/**
 * 🔧 직접 시더 접근 (고급 사용)
 */
export const getTestDataSeeder = () => testDataSeeder;
export const getDockerTestSetup = () => dockerTestSetup;

export default testHooks;

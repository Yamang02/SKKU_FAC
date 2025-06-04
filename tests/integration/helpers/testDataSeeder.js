/**
 * 🌱 테스트 데이터 시딩 및 정리 유틸리티
 * Playwright 테스트 훅과 Docker 테스트 환경에서 사용하는 데이터 관리 시스템
 */
import { v4 as uuidv4 } from 'uuid';
import dockerTestSetup from './dockerTestSetup.js';
import { testUsers, testExhibitions, testArtworks } from '../fixtures/testData.js';

/**
 * 🧪 테스트 데이터 시더 클래스
 */
class TestDataSeeder {
    constructor() {
        this.seededData = {
            users: [],
            exhibitions: [],
            artworks: [],
            relationships: []
        };
        this.mysqlConnection = null;
        this.redisClient = null;
    }

    /**
     * 🔌 데이터베이스 연결 초기화
     */
    async initialize() {
        const status = dockerTestSetup.getStatus();
        if (!status.mysqlConnected || !status.redisConnected) {
            throw new Error('Docker test environment not ready. Please ensure containers are running.');
        }

        this.mysqlConnection = dockerTestSetup.getMysqlConnection();
        this.redisClient = dockerTestSetup.getRedisClient();

        if (!this.mysqlConnection || !this.redisClient) {
            throw new Error('Failed to get database connections from dockerTestSetup');
        }
    }

    /**
     * 🌱 모든 테스트 데이터 시딩
     */
    async seedAll() {
        await this.initialize();

        console.log('🌱 Starting comprehensive test data seeding...');

        try {
            // 순서대로 시딩 (의존성 고려)
            await this.seedUsers();
            await this.seedExhibitions();
            await this.seedArtworks();
            await this.seedArtworkExhibitionRelationships();

            console.log('✅ All test data seeded successfully');
            return this.seededData;
        } catch (error) {
            console.error('❌ Error during test data seeding:', error);
            await this.cleanup(); // 실패 시 정리
            throw error;
        }
    }

    /**
     * 👥 사용자 데이터 시딩
     */
    async seedUsers() {
        console.log('👥 Seeding users...');

        for (const [key, userData] of Object.entries(testUsers)) {
            try {
                // UserAccount 생성
                const userAccountQuery = `
                    INSERT INTO user_accounts (id, username, email, password_hash, role, email_verified, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;

                await this.mysqlConnection.execute(userAccountQuery, [
                    userData.id,
                    userData.username,
                    userData.email,
                    userData.passwordHash,
                    userData.role,
                    userData.emailVerified
                ]);

                // SKKU 사용자인 경우 SkkuUserProfile 생성
                if (userData.role === 'SKKU_MEMBER' && userData.skkuProfile) {
                    const profileQuery = `
                        INSERT INTO skku_user_profiles (id, user_id, name, department, student_year, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                    `;

                    await this.mysqlConnection.execute(profileQuery, [
                        userData.skkuProfile.id,
                        userData.id,
                        userData.skkuProfile.name,
                        userData.skkuProfile.department,
                        userData.skkuProfile.studentYear
                    ]);
                }

                this.seededData.users.push({
                    key,
                    id: userData.id,
                    username: userData.username,
                    email: userData.email
                });

                console.log(`  ✅ User seeded: ${userData.username} (${userData.role})`);
            } catch (error) {
                console.error(`  ❌ Failed to seed user ${key}:`, error.message);
                throw error;
            }
        }
    }

    /**
     * 🎨 전시회 데이터 시딩
     */
    async seedExhibitions() {
        console.log('🎨 Seeding exhibitions...');

        for (const [key, exhibitionData] of Object.entries(testExhibitions)) {
            try {
                const query = `
                    INSERT INTO exhibitions (
                        id, title, slug, description, start_date, end_date,
                        location, exhibition_type, status, is_featured,
                        submission_open, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;

                await this.mysqlConnection.execute(query, [
                    exhibitionData.id,
                    exhibitionData.title,
                    exhibitionData.slug,
                    exhibitionData.description,
                    exhibitionData.startDate,
                    exhibitionData.endDate,
                    exhibitionData.location,
                    exhibitionData.exhibitionType,
                    exhibitionData.status,
                    exhibitionData.isFeatured,
                    exhibitionData.submissionOpen
                ]);

                this.seededData.exhibitions.push({
                    key,
                    id: exhibitionData.id,
                    title: exhibitionData.title,
                    slug: exhibitionData.slug
                });

                console.log(`  ✅ Exhibition seeded: ${exhibitionData.title}`);
            } catch (error) {
                console.error(`  ❌ Failed to seed exhibition ${key}:`, error.message);
                throw error;
            }
        }
    }

    /**
     * 🖼️ 작품 데이터 시딩
     */
    async seedArtworks() {
        console.log('🖼️ Seeding artworks...');

        for (const [key, artworkData] of Object.entries(testArtworks)) {
            try {
                const query = `
                    INSERT INTO artworks (
                        id, title, slug, description, medium, size, year,
                        artist_id, image_url, status, is_featured,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;

                await this.mysqlConnection.execute(query, [
                    artworkData.id,
                    artworkData.title,
                    artworkData.slug,
                    artworkData.description,
                    artworkData.medium,
                    artworkData.size,
                    artworkData.year,
                    artworkData.artistId,
                    artworkData.imageUrl,
                    artworkData.status,
                    artworkData.isFeatured
                ]);

                this.seededData.artworks.push({
                    key,
                    id: artworkData.id,
                    title: artworkData.title,
                    slug: artworkData.slug
                });

                console.log(`  ✅ Artwork seeded: ${artworkData.title}`);
            } catch (error) {
                console.error(`  ❌ Failed to seed artwork ${key}:`, error.message);
                throw error;
            }
        }
    }

    /**
     * 🔗 작품-전시회 관계 시딩
     */
    async seedArtworkExhibitionRelationships() {
        console.log('🔗 Seeding artwork-exhibition relationships...');

        // 일부 작품을 전시회에 연결
        const relationships = [
            { artworkKey: 'painting', exhibitionKey: 'currentExhibition' },
            { artworkKey: 'sculpture', exhibitionKey: 'currentExhibition' },
            { artworkKey: 'digitalArt', exhibitionKey: 'upcomingExhibition' }
        ];

        for (const rel of relationships) {
            try {
                const artwork = testArtworks[rel.artworkKey];
                const exhibition = testExhibitions[rel.exhibitionKey];

                if (!artwork || !exhibition) {
                    console.warn(`  ⚠️ Skipping relationship: ${rel.artworkKey} -> ${rel.exhibitionKey} (data not found)`);
                    continue;
                }

                const relationshipId = `ARTWORK_EXHIBITION_${uuidv4().replace(/-/g, '').substring(0, 8)}`;

                const query = `
                    INSERT INTO artwork_exhibition_relationships (
                        id, artwork_id, exhibition_id, created_at, updated_at
                    ) VALUES (?, ?, ?, NOW(), NOW())
                `;

                await this.mysqlConnection.execute(query, [
                    relationshipId,
                    artwork.id,
                    exhibition.id
                ]);

                this.seededData.relationships.push({
                    id: relationshipId,
                    artworkId: artwork.id,
                    exhibitionId: exhibition.id,
                    artworkTitle: artwork.title,
                    exhibitionTitle: exhibition.title
                });

                console.log(`  ✅ Relationship seeded: ${artwork.title} -> ${exhibition.title}`);
            } catch (error) {
                console.error(`  ❌ Failed to seed relationship ${rel.artworkKey} -> ${rel.exhibitionKey}:`, error.message);
                throw error;
            }
        }
    }

    /**
     * 🧹 모든 테스트 데이터 정리
     */
    async cleanup() {
        if (!this.mysqlConnection) {
            console.log('⚠️ No MySQL connection available for cleanup');
            return;
        }

        console.log('🧹 Cleaning up test data...');

        try {
            // 역순으로 정리 (의존성 고려)
            await this.cleanupArtworkExhibitionRelationships();
            await this.cleanupArtworks();
            await this.cleanupExhibitions();
            await this.cleanupUsers();
            await this.cleanupRedisCache();

            // 시딩된 데이터 기록 초기화
            this.seededData = {
                users: [],
                exhibitions: [],
                artworks: [],
                relationships: []
            };

            console.log('✅ Test data cleanup completed');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
            throw error;
        }
    }

    /**
     * 🧹 관계 데이터 정리
     */
    async cleanupArtworkExhibitionRelationships() {
        const relationshipIds = this.seededData.relationships.map(rel => rel.id);
        if (relationshipIds.length === 0) return;

        const placeholders = relationshipIds.map(() => '?').join(',');
        const query = `DELETE FROM artwork_exhibition_relationships WHERE id IN (${placeholders})`;

        await this.mysqlConnection.execute(query, relationshipIds);
        console.log(`  ✅ Cleaned up ${relationshipIds.length} artwork-exhibition relationships`);
    }

    /**
     * 🧹 작품 데이터 정리
     */
    async cleanupArtworks() {
        const artworkIds = this.seededData.artworks.map(artwork => artwork.id);
        if (artworkIds.length === 0) return;

        const placeholders = artworkIds.map(() => '?').join(',');
        const query = `DELETE FROM artworks WHERE id IN (${placeholders})`;

        await this.mysqlConnection.execute(query, artworkIds);
        console.log(`  ✅ Cleaned up ${artworkIds.length} artworks`);
    }

    /**
     * 🧹 전시회 데이터 정리
     */
    async cleanupExhibitions() {
        const exhibitionIds = this.seededData.exhibitions.map(exhibition => exhibition.id);
        if (exhibitionIds.length === 0) return;

        const placeholders = exhibitionIds.map(() => '?').join(',');
        const query = `DELETE FROM exhibitions WHERE id IN (${placeholders})`;

        await this.mysqlConnection.execute(query, exhibitionIds);
        console.log(`  ✅ Cleaned up ${exhibitionIds.length} exhibitions`);
    }

    /**
     * 🧹 사용자 데이터 정리
     */
    async cleanupUsers() {
        const userIds = this.seededData.users.map(user => user.id);
        if (userIds.length === 0) return;

        // SKKU 프로필 먼저 정리
        const skkuProfileQuery = `DELETE FROM skku_user_profiles WHERE user_id IN (${userIds.map(() => '?').join(',')})`;
        await this.mysqlConnection.execute(skkuProfileQuery, userIds);

        // 사용자 계정 정리
        const userAccountQuery = `DELETE FROM user_accounts WHERE id IN (${userIds.map(() => '?').join(',')})`;
        await this.mysqlConnection.execute(userAccountQuery, userIds);

        console.log(`  ✅ Cleaned up ${userIds.length} users and their profiles`);
    }

    /**
     * 🧹 Redis 캐시 정리
     */
    async cleanupRedisCache() {
        if (!this.redisClient) return;

        try {
            // 테스트 관련 캐시 키 패턴들
            const testPatterns = [
                'test:*',
                'session:test:*',
                'cache:test:*',
                'user:test:*',
                'exhibition:test:*',
                'artwork:test:*'
            ];

            for (const pattern of testPatterns) {
                const keys = await this.redisClient.keys(pattern);
                if (keys.length > 0) {
                    await this.redisClient.del(...keys);
                    console.log(`  ✅ Cleaned up ${keys.length} Redis keys matching ${pattern}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Redis cleanup warning:', error.message);
        }
    }

    /**
     * 📊 시딩된 데이터 정보 반환
     */
    getSeededData() {
        return { ...this.seededData };
    }

    /**
     * 🔍 특정 타입의 시딩된 데이터 조회
     */
    getSeededDataByType(type) {
        return this.seededData[type] || [];
    }

    /**
     * 🎯 특정 사용자 데이터 조회
     */
    getSeededUser(key) {
        return this.seededData.users.find(user => user.key === key);
    }

    /**
     * 🎨 특정 전시회 데이터 조회
     */
    getSeededExhibition(key) {
        return this.seededData.exhibitions.find(exhibition => exhibition.key === key);
    }

    /**
     * 🖼️ 특정 작품 데이터 조회
     */
    getSeededArtwork(key) {
        return this.seededData.artworks.find(artwork => artwork.key === key);
    }

    /**
     * 🔄 부분 재시딩 (특정 타입만)
     */
    async reseedType(type) {
        console.log(`🔄 Reseeding ${type}...`);

        switch (type) {
            case 'users':
                await this.cleanupUsers();
                await this.seedUsers();
                break;
            case 'exhibitions':
                await this.cleanupExhibitions();
                await this.seedExhibitions();
                break;
            case 'artworks':
                await this.cleanupArtworks();
                await this.seedArtworks();
                break;
            case 'relationships':
                await this.cleanupArtworkExhibitionRelationships();
                await this.seedArtworkExhibitionRelationships();
                break;
            default:
                throw new Error(`Unknown type: ${type}`);
        }

        console.log(`✅ ${type} reseeded successfully`);
    }

    /**
     * 🧪 테스트 격리를 위한 빠른 정리
     */
    async quickCleanup() {
        if (!this.mysqlConnection) return;

        try {
            // 트랜잭션으로 빠른 정리
            await this.mysqlConnection.execute('START TRANSACTION');

            await this.mysqlConnection.execute('DELETE FROM artwork_exhibition_relationships WHERE id LIKE "ARTWORK_EXHIBITION_%"');
            await this.mysqlConnection.execute('DELETE FROM artworks WHERE id LIKE "ARTWORK_%"');
            await this.mysqlConnection.execute('DELETE FROM exhibitions WHERE id LIKE "EXHIBITION_%"');
            await this.mysqlConnection.execute('DELETE FROM skku_user_profiles WHERE id LIKE "SKKU_PROFILE_%"');
            await this.mysqlConnection.execute('DELETE FROM user_accounts WHERE id LIKE "USER_%"');

            await this.mysqlConnection.execute('COMMIT');

            // Redis 빠른 정리
            if (this.redisClient) {
                await this.redisClient.flushdb();
            }

            console.log('⚡ Quick cleanup completed');
        } catch (error) {
            await this.mysqlConnection.execute('ROLLBACK');
            console.error('❌ Quick cleanup failed:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스 생성
const testDataSeeder = new TestDataSeeder();

export default testDataSeeder;

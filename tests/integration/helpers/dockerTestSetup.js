/**
 * 🐳 Docker 기반 테스트 환경 설정 헬퍼
 */
import { execSync } from 'child_process';
import mysql from 'mysql2/promise';
import { createClient } from 'redis';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Docker 테스트 환경 설정 클래스
 */
class DockerTestSetup {
    constructor() {
        this.testConfig = {
            mysql: {
                host: 'localhost',
                port: 3307, // 테스트용 포트
                user: 'root',
                password: 'testpassword',
                database: 'skku_sfa_gallery_test'
            },
            redis: {
                url: 'redis://localhost:6380' // 테스트용 포트
            },
            app: {
                url: 'http://localhost:3000'
            }
        };

        this.mysqlConnection = null;
        this.redisClient = null;
        this.isInitialized = false;
    }

    /**
     * 🔍 테스트 환경 확인 및 설정 (로컬/Docker 모두 지원)
     */
    async ensureTestEnvironment() {
        console.log('🔍 테스트 환경 확인 중...');

        try {
            // 먼저 로컬 환경에서 실제 연결 시도
            const actualStatus = await this.checkActualConnections();

            if (actualStatus.mysqlConnected && actualStatus.redisConnected) {
                console.log('✅ 로컬 테스트 환경 사용 가능');
                await this.initializeTestDatabase();
                return;
            }

            // 로컬 연결 실패 시 Docker 환경 시작 시도
            console.log('⚠️ 로컬 환경 연결 실패, Docker 환경 시작 시도...');
            await this.startTestEnvironment();

        } catch (error) {
            console.error('❌ 테스트 환경 설정 실패:', error.message);
            console.log('💡 해결 방법:');
            console.log('  1. 로컬 MySQL(포트 3307)과 Redis(포트 6380) 실행');
            console.log('  2. 또는 Docker 테스트 환경 실행: npm run docker:test:up');

            // 로컬에서 테스트하는 경우 환경 확인을 건너뛸 수 있는 옵션 제공
            if (process.env.SKIP_TEST_ENV_CHECK === 'true') {
                console.log('⚠️ SKIP_TEST_ENV_CHECK=true로 설정되어 환경 확인을 건너뜁니다.');
                return;
            }

            throw error;
        }
    }

    /**
     * 🚀 테스트 환경 시작
     */
    async startTestEnvironment() {
        console.log('🐳 Docker 테스트 환경 시작...');

        try {
            // Docker 컨테이너 시작
            execSync('docker-compose --profile test up -d mysql_test redis_test', {
                stdio: 'inherit',
                cwd: path.resolve(__dirname, '../../../')
            });

            // 컨테이너 준비 대기
            await this.waitForContainers();

            console.log('✅ Docker 테스트 환경 시작 완료');
        } catch (error) {
            console.error('❌ Docker 테스트 환경 시작 실패:', error.message);
            throw error;
        }
    }

    /**
     * ⏳ 컨테이너 준비 대기
     */
    async waitForContainers(maxRetries = 30, retryInterval = 2000) {
        console.log('⏳ 테스트 컨테이너 준비 대기 중...');

        for (let i = 0; i < maxRetries; i++) {
            try {
                // MySQL 연결 테스트
                const mysqlConnection = await mysql.createConnection({
                    host: this.testConfig.mysql.host,
                    port: this.testConfig.mysql.port,
                    user: this.testConfig.mysql.user,
                    password: this.testConfig.mysql.password
                });
                await mysqlConnection.ping();
                await mysqlConnection.end();

                // Redis 연결 테스트
                const redisClient = createClient({ url: this.testConfig.redis.url });
                await redisClient.connect();
                await redisClient.ping();
                await redisClient.disconnect();

                console.log('✅ 테스트 컨테이너 준비 완료');
                return;
            } catch (error) {
                console.log(`⏳ 컨테이너 준비 중... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }

        throw new Error('테스트 컨테이너 준비 시간 초과');
    }

    /**
     * 🗄️ 테스트 데이터베이스 초기화
     */
    async initializeTestDatabase() {
        console.log('🗄️ 테스트 데이터베이스 초기화...');

        try {
            // MySQL 연결
            this.mysqlConnection = await mysql.createConnection({
                host: this.testConfig.mysql.host,
                port: this.testConfig.mysql.port,
                user: this.testConfig.mysql.user,
                password: this.testConfig.mysql.password
            });

            // 테스트 데이터베이스 생성 (존재하지 않는 경우)
            await this.mysqlConnection.execute(
                `CREATE DATABASE IF NOT EXISTS ${this.testConfig.mysql.database}
                 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
            );

            // 데이터베이스 선택
            await this.mysqlConnection.execute(`USE ${this.testConfig.mysql.database}`);

            // Redis 연결
            this.redisClient = createClient({ url: this.testConfig.redis.url });
            await this.redisClient.connect();

            // Redis 테스트 데이터베이스 클리어
            await this.redisClient.flushDb();

            this.isInitialized = true;
            console.log('✅ 테스트 데이터베이스 초기화 완료');
        } catch (error) {
            console.error('❌ 테스트 데이터베이스 초기화 실패:', error.message);
            throw error;
        }
    }

    /**
     * 🌱 기본 테스트 데이터 시드
     */
    async seedTestData() {
        if (!this.isInitialized) {
            await this.initializeTestDatabase();
        }

        console.log('🌱 테스트 데이터 시드 중...');

        try {
            // 기본 테이블 생성 (간단한 버전)
            await this.createBasicTables();

            // 기본 테스트 사용자 생성
            await this.createTestUsers();

            console.log('✅ 테스트 데이터 시드 완료');
        } catch (error) {
            console.error('❌ 테스트 데이터 시드 실패:', error.message);
            throw error;
        }
    }

    /**
     * 📋 기본 테이블 생성
     */
    async createBasicTables() {
        const tables = [
            // UserAccount 테이블
            `CREATE TABLE IF NOT EXISTS user_accounts (
                id VARCHAR(100) PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                name VARCHAR(50) NOT NULL,
                role ENUM('ADMIN', 'SKKU_MEMBER', 'EXTERNAL_MEMBER') NOT NULL DEFAULT 'SKKU_MEMBER',
                status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNVERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
                last_login_at TIMESTAMP NULL,
                email_verified BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_account_email (email),
                INDEX idx_user_account_username (username),
                INDEX idx_user_account_role (role),
                INDEX idx_user_account_status (status)
            )`,

            // SkkuUserProfile 테이블
            `CREATE TABLE IF NOT EXISTS skku_user_profiles (
                id VARCHAR(100) PRIMARY KEY,
                user_id VARCHAR(100) NOT NULL UNIQUE,
                department VARCHAR(50),
                student_year VARCHAR(4),
                is_club_member BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE,
                INDEX idx_skku_profile_user (user_id)
            )`,

            // Exhibition 테이블
            `CREATE TABLE IF NOT EXISTS exhibitions (
                id VARCHAR(100) PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                location VARCHAR(255) NOT NULL,
                image_url VARCHAR(255),
                image_public_id VARCHAR(255),
                exhibition_type ENUM('regular', 'special') NOT NULL DEFAULT 'regular',
                is_submission_open BOOLEAN DEFAULT false,
                is_featured BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_exhibition_dates (start_date, end_date),
                INDEX idx_exhibition_type (exhibition_type),
                INDEX idx_exhibition_submission (is_submission_open)
            )`,

            // Artwork 테이블
            `CREATE TABLE IF NOT EXISTS artworks (
                id VARCHAR(100) PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                slug VARCHAR(150) NOT NULL UNIQUE,
                medium VARCHAR(50),
                size VARCHAR(50),
                year VARCHAR(50),
                description TEXT,
                image_url VARCHAR(255),
                image_public_id VARCHAR(255),
                is_featured BOOLEAN DEFAULT false,
                user_id VARCHAR(100) NOT NULL,
                status ENUM('PENDING', 'APPROVED', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'APPROVED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE,
                INDEX idx_artwork_user (user_id),
                INDEX idx_artwork_slug (slug),
                INDEX idx_artwork_status (status)
            )`
        ];

        for (const tableSQL of tables) {
            await this.mysqlConnection.execute(tableSQL);
        }
    }

    /**
     * 👥 테스트 사용자 생성
     */
    async createTestUsers() {
        // 기존 테스트 사용자 삭제
        await this.mysqlConnection.execute('DELETE FROM user_accounts WHERE email LIKE "%test%"');

        // 테스트 사용자 생성
        const testUsers = [
            {
                id: 'USER_test-user-001',
                username: 'testuser',
                email: 'test@skku.edu',
                password: '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', // 'testpassword'
                name: 'Test User',
                role: 'SKKU_MEMBER',
                status: 'ACTIVE',
                email_verified: true
            },
            {
                id: 'USER_test-admin-001',
                username: 'testadmin',
                email: 'admin@skku.edu',
                password: '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', // 'adminpassword'
                name: 'Test Admin',
                role: 'ADMIN',
                status: 'ACTIVE',
                email_verified: true
            },
            {
                id: 'USER_test-external-001',
                username: 'externaluser',
                email: 'external@example.com',
                password: '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', // 'testpassword'
                name: 'External User',
                role: 'EXTERNAL_MEMBER',
                status: 'ACTIVE',
                email_verified: true
            }
        ];

        for (const user of testUsers) {
            await this.mysqlConnection.execute(
                'INSERT INTO user_accounts (id, username, email, password, name, role, status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    user.id,
                    user.username,
                    user.email,
                    user.password,
                    user.name,
                    user.role,
                    user.status,
                    user.email_verified
                ]
            );
        }

        // SKKU 사용자 프로필 생성
        const skkuProfiles = [
            {
                id: 'SKKU_PROFILE_test-001',
                user_id: 'USER_test-user-001',
                department: 'Fine Art',
                student_year: '2024',
                is_club_member: true
            },
            {
                id: 'SKKU_PROFILE_test-002',
                user_id: 'USER_test-admin-001',
                department: 'Art Administration',
                student_year: '2023',
                is_club_member: true
            }
        ];

        for (const profile of skkuProfiles) {
            await this.mysqlConnection.execute(
                'INSERT INTO skku_user_profiles (id, user_id, department, student_year, is_club_member) VALUES (?, ?, ?, ?, ?)',
                [profile.id, profile.user_id, profile.department, profile.student_year, profile.is_club_member]
            );
        }
    }

    /**
     * 🧹 테스트 데이터 정리
     */
    async cleanupTestData() {
        console.log('🧹 테스트 데이터 정리...');

        try {
            if (this.mysqlConnection) {
                // 테이블 데이터 정리 (테이블 구조는 유지)
                // 외래키 제약조건 때문에 순서 중요
                const tables = ['artworks', 'skku_user_profiles', 'exhibitions', 'user_accounts'];
                for (const table of tables) {
                    await this.mysqlConnection.execute(`DELETE FROM ${table}`);
                    // AUTO_INCREMENT는 UUID 기반이므로 제거
                }
            }

            if (this.redisClient) {
                // Redis 데이터 정리
                await this.redisClient.flushDb();
            }

            console.log('✅ 테스트 데이터 정리 완료');
        } catch (error) {
            console.error('⚠️ 테스트 데이터 정리 중 오류:', error.message);
        }
    }

    /**
     * 🛑 테스트 환경 정리
     */
    async stopTestEnvironment() {
        console.log('🛑 Docker 테스트 환경 정리...');

        try {
            // 연결 종료
            if (this.mysqlConnection) {
                await this.mysqlConnection.end();
                this.mysqlConnection = null;
            }

            if (this.redisClient) {
                await this.redisClient.disconnect();
                this.redisClient = null;
            }

            // Docker 컨테이너 정리
            execSync('npm run docker:test:down', {
                stdio: 'inherit',
                cwd: path.resolve(__dirname, '../../../')
            });

            this.isInitialized = false;
            console.log('✅ Docker 테스트 환경 정리 완료');
        } catch (error) {
            console.error('⚠️ Docker 테스트 환경 정리 중 오류:', error.message);
        }
    }

    /**
     * 📊 현재 상태 확인
     */
    getStatus() {
        return {
            dockerRunning: this.isInitialized,
            mysqlConnected: !!this.mysqlConnection,
            redisConnected: !!this.redisClient,
            config: this.testConfig
        };
    }

    /**
     * 🔍 실제 연결 상태 확인 (비동기)
     */
    async checkActualConnections() {
        const status = {
            mysqlConnected: false,
            redisConnected: false
        };

        // MySQL 연결 테스트
        try {
            const mysql = require('mysql2/promise');
            const testConnection = await mysql.createConnection({
                host: this.testConfig.mysql.host,
                port: this.testConfig.mysql.port,
                user: this.testConfig.mysql.user,
                password: this.testConfig.mysql.password
            });
            await testConnection.ping();
            await testConnection.end();
            status.mysqlConnected = true;
        } catch (error) {
            console.log('MySQL 연결 실패:', error.message);
        }

        // Redis 연결 테스트
        try {
            const { createClient } = require('redis');
            const testClient = createClient({ url: this.testConfig.redis.url });
            await testClient.connect();
            await testClient.ping();
            await testClient.disconnect();
            status.redisConnected = true;
        } catch (error) {
            console.log('Redis 연결 실패:', error.message);
        }

        return status;
    }

    /**
     * 🔗 MySQL 연결 반환
     */
    getMysqlConnection() {
        return this.mysqlConnection;
    }

    /**
     * 🔗 Redis 클라이언트 반환
     */
    getRedisClient() {
        return this.redisClient;
    }

    /**
     * 🧪 특정 테이블 데이터 정리
     */
    async clearTable(tableName) {
        if (!this.mysqlConnection) {
            throw new Error('MySQL 연결이 없습니다');
        }

        await this.mysqlConnection.execute(`DELETE FROM ${tableName}`);
        await this.mysqlConnection.execute(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
    }

    /**
     * 📝 테스트 데이터 삽입 헬퍼
     */
    async insertTestData(tableName, data) {
        if (!this.mysqlConnection) {
            throw new Error('MySQL 연결이 없습니다');
        }

        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');

        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        const [result] = await this.mysqlConnection.execute(sql, values);

        return result.insertId;
    }
}

// 싱글톤 인스턴스 생성
const dockerTestSetup = new DockerTestSetup();

export default dockerTestSetup;

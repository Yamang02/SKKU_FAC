#!/usr/bin/env node

/**
 * 테스트 파일 재구성 스크립트
 * 현재 테스트 파일들을 권장 디렉토리 구조로 이동시킵니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정
const CONFIG = {
    DRY_RUN: process.argv.includes('--dry-run'),
    VERBOSE: process.argv.includes('--verbose'),
    BACKUP: process.argv.includes('--backup')
};

/**
 * 로그 출력 함수
 */
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * 디렉토리 생성
 */
function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        if (!CONFIG.DRY_RUN) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        if (CONFIG.VERBOSE) {
            log(`디렉토리 생성: ${dirPath}`);
        }
        return true;
    }
    return false;
}

/**
 * 파일 이동
 */
function moveFile(sourcePath, targetPath) {
    try {
        if (!CONFIG.DRY_RUN) {
            // 대상 디렉토리 생성
            ensureDirectory(path.dirname(targetPath));

            // 파일 이동
            fs.renameSync(sourcePath, targetPath);
        }

        log(`파일 이동: ${sourcePath} → ${targetPath}`, 'success');
        return true;
    } catch (error) {
        log(`파일 이동 실패: ${sourcePath} → ${targetPath} (${error.message})`, 'error');
        return false;
    }
}

/**
 * 파일 복사 (백업용)
 */
function copyFile(sourcePath, targetPath) {
    try {
        if (!CONFIG.DRY_RUN) {
            ensureDirectory(path.dirname(targetPath));
            fs.copyFileSync(sourcePath, targetPath);
        }

        if (CONFIG.VERBOSE) {
            log(`파일 복사: ${sourcePath} → ${targetPath}`);
        }
        return true;
    } catch (error) {
        log(`파일 복사 실패: ${sourcePath} → ${targetPath} (${error.message})`, 'error');
        return false;
    }
}

/**
 * 현재 테스트 파일 매핑 정의
 */
const TEST_FILE_MAPPING = {
    // E2E 테스트
    'auth-tests.spec.js': 'e2e/auth/auth-flow.spec.js',
    'signup-test.spec.js': 'e2e/auth/signup.spec.js',
    'simple-signup-test.spec.js': 'e2e/auth/signup-simple.spec.js',
    'user-role-tests.spec.js': 'e2e/auth/user-roles.spec.js',

    'artwork-tests.spec.js': 'e2e/artwork/artwork-management.spec.js',
    'exhibition-tests.spec.js': 'e2e/exhibition/exhibition-management.spec.js',

    // 단위 테스트
    'validation-middleware.spec.js': 'unit/middleware/validation.spec.js',

    // 통합 테스트
    'basic-functionality.spec.js': 'integration/basic-functionality.spec.js',

    // 헬퍼 파일들
    'helpers/test-helpers.js': 'helpers/test-helpers.js'
};

/**
 * 새로운 디렉토리 구조 생성
 */
function createNewStructure(testsDir) {
    const directories = [
        'unit/middleware',
        'unit/services',
        'unit/utils',
        'integration/api',
        'integration/database',
        'e2e/auth',
        'e2e/artwork',
        'e2e/exhibition',
        'e2e/admin',
        'performance',
        'accessibility',
        'visual',
        'fixtures',
        'helpers',
        'config',
        'docs'
    ];

    let createdCount = 0;

    for (const dir of directories) {
        const fullPath = path.join(testsDir, dir);
        if (ensureDirectory(fullPath)) {
            createdCount++;
        }
    }

    if (createdCount > 0) {
        log(`새로운 디렉토리 구조 생성: ${createdCount}개 디렉토리`, 'success');
    }
}

/**
 * 테스트 파일들 이동
 */
function moveTestFiles(testsDir) {
    let movedCount = 0;
    let failedCount = 0;

    for (const [sourceFile, targetFile] of Object.entries(TEST_FILE_MAPPING)) {
        const sourcePath = path.join(testsDir, sourceFile);
        const targetPath = path.join(testsDir, targetFile);

        if (fs.existsSync(sourcePath)) {
            // 백업 생성 (옵션)
            if (CONFIG.BACKUP) {
                const backupPath = path.join(testsDir, 'backup', sourceFile);
                copyFile(sourcePath, backupPath);
            }

            // 파일 이동
            if (moveFile(sourcePath, targetPath)) {
                movedCount++;
            } else {
                failedCount++;
            }
        } else {
            if (CONFIG.VERBOSE) {
                log(`파일이 존재하지 않음: ${sourcePath}`, 'warn');
            }
        }
    }

    log(`파일 이동 완료: ${movedCount}개 성공, ${failedCount}개 실패`,
        failedCount > 0 ? 'warn' : 'success');
}

/**
 * 문서 파일들 이동
 */
function moveDocumentationFiles(testsDir) {
    const docFiles = [
        'README.md',
        'test-plan.md',
        'test-structure-guide.md'
    ];

    let movedCount = 0;

    for (const docFile of docFiles) {
        const sourcePath = path.join(testsDir, docFile);
        const targetPath = path.join(testsDir, 'docs', docFile);

        if (fs.existsSync(sourcePath)) {
            if (moveFile(sourcePath, targetPath)) {
                movedCount++;
            }
        }
    }

    if (movedCount > 0) {
        log(`문서 파일 이동 완료: ${movedCount}개`, 'success');
    }
}

/**
 * 새로운 설정 파일들 생성
 */
function createConfigFiles(testsDir) {
    const configDir = path.join(testsDir, 'config');

    // Jest 설정 파일 생성
    const jestConfig = `export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/../unit', '<rootDir>/../integration'],
  testMatch: ['**/*.spec.js', '**/*.test.js'],
  collectCoverageFrom: [
    '<rootDir>/../../src/**/*.js',
    '!<rootDir>/../../src/**/*.spec.js',
    '!<rootDir>/../../src/**/*.test.js'
  ],
  coverageDirectory: '<rootDir>/../../test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test-env.js']
};`;

    // 테스트 환경 설정 파일 생성
    const testEnv = `/**
 * 테스트 환경 설정
 */

// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// 전역 테스트 설정
global.TEST_TIMEOUT = 30000;

// 테스트 전 설정
beforeAll(async () => {
  // 데이터베이스 초기화 등
});

// 테스트 후 정리
afterAll(async () => {
  // 리소스 정리
});`;

    if (!CONFIG.DRY_RUN) {
        fs.writeFileSync(path.join(configDir, 'jest.config.js'), jestConfig);
        fs.writeFileSync(path.join(configDir, 'test-env.js'), testEnv);
    }

    log('설정 파일 생성 완료', 'success');
}

/**
 * 새로운 README 파일 생성
 */
function createNewReadme(testsDir) {
    const readmeContent = `# 테스트 가이드

## 📁 디렉토리 구조

- \`unit/\`: 단위 테스트
- \`integration/\`: 통합 테스트
- \`e2e/\`: End-to-End 테스트
- \`performance/\`: 성능 테스트
- \`accessibility/\`: 접근성 테스트
- \`visual/\`: 시각적 회귀 테스트
- \`fixtures/\`: 테스트 데이터
- \`helpers/\`: 테스트 헬퍼 함수
- \`config/\`: 테스트 설정
- \`docs/\`: 테스트 문서

## 🚀 테스트 실행

\`\`\`bash
# 전체 테스트
npm test

# 단위 테스트
npm run test:unit

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 도메인별 테스트
npm run test:auth
npm run test:artwork
npm run test:exhibition
\`\`\`

## 📖 자세한 내용

자세한 테스트 가이드는 \`docs/\` 디렉토리의 문서들을 참고하세요.
`;

    if (!CONFIG.DRY_RUN) {
        fs.writeFileSync(path.join(testsDir, 'README.md'), readmeContent);
    }

    log('새로운 README 파일 생성 완료', 'success');
}

/**
 * package.json 스크립트 업데이트 제안
 */
function suggestPackageJsonUpdates() {
    const suggestedScripts = {
        'test': 'npm run test:unit && npm run test:integration && npm run test:e2e',
        'test:unit': 'jest tests/unit --coverage',
        'test:integration': 'jest tests/integration',
        'test:e2e': 'playwright test tests/e2e',
        'test:e2e:headed': 'playwright test tests/e2e --headed',
        'test:e2e:debug': 'playwright test tests/e2e --debug',
        'test:performance': 'playwright test tests/performance',
        'test:accessibility': 'playwright test tests/accessibility',
        'test:visual': 'playwright test tests/visual',
        'test:auth': 'playwright test tests/e2e/auth',
        'test:artwork': 'playwright test tests/e2e/artwork',
        'test:exhibition': 'playwright test tests/e2e/exhibition',
        'test:admin': 'playwright test tests/e2e/admin',
        'test:smoke': 'playwright test --grep=\'@smoke\'',
        'test:regression': 'playwright test --grep=\'@regression\'',
        'test:critical': 'playwright test --grep=\'@critical\'',
        'test:cleanup': 'node scripts/cleanup-test-results.js',
        'test:reorganize': 'node scripts/reorganize-tests.js',
        'test:report': 'playwright show-report'
    };

    log('📝 package.json에 추가할 스크립트 제안:');
    console.log(JSON.stringify(suggestedScripts, null, 2));
}

/**
 * 메인 함수
 */
function main() {
    const startTime = Date.now();

    log('🔄 테스트 파일 재구성 시작');

    if (CONFIG.DRY_RUN) {
        log('⚠️ DRY RUN 모드: 실제 변경하지 않고 시뮬레이션만 실행합니다');
    }

    if (CONFIG.BACKUP) {
        log('💾 백업 모드: 원본 파일들을 백업합니다');
    }

    const projectRoot = path.resolve(__dirname, '..');
    const testsDir = path.join(projectRoot, 'tests');

    // 1. 새로운 디렉토리 구조 생성
    createNewStructure(testsDir);

    // 2. 테스트 파일들 이동
    moveTestFiles(testsDir);

    // 3. 문서 파일들 이동
    moveDocumentationFiles(testsDir);

    // 4. 설정 파일들 생성
    createConfigFiles(testsDir);

    // 5. 새로운 README 생성
    createNewReadme(testsDir);

    // 6. package.json 업데이트 제안
    suggestPackageJsonUpdates();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log(`🎉 테스트 재구성 완료 (${duration}초)`, 'success');

    if (CONFIG.DRY_RUN) {
        log('실제 적용하려면 --dry-run 옵션 없이 다시 실행하세요');
    }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { moveFile, ensureDirectory };

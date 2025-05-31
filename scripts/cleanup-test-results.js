#!/usr/bin/env node

/**
 * 테스트 결과물 자동 정리 스크립트
 * 오래된 테스트 결과물을 삭제하고 디스크 공간을 확보합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정
const CONFIG = {
    RETENTION_DAYS: 7,                    // 보관 기간 (일)
    TEST_RESULTS_DIR: 'test-results',     // 테스트 결과 디렉토리
    SCREENSHOTS_RETENTION_DAYS: 3,       // 스크린샷 보관 기간 (일)
    VIDEOS_RETENTION_DAYS: 1,            // 비디오 보관 기간 (일)
    DRY_RUN: process.argv.includes('--dry-run'), // 실제 삭제하지 않고 시뮬레이션만
    VERBOSE: process.argv.includes('--verbose')   // 상세 로그 출력
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
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 디렉토리가 존재하는지 확인
 */
function directoryExists(dirPath) {
    try {
        return fs.statSync(dirPath).isDirectory();
    } catch (error) {
        return false;
    }
}

/**
 * 파일/디렉토리 삭제
 */
function deleteFileOrDirectory(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(filePath);
        }
        return true;
    } catch (error) {
        log(`삭제 실패: ${filePath} - ${error.message}`, 'error');
        return false;
    }
}

/**
 * 특정 디렉토리에서 오래된 파일들 정리
 */
function cleanupDirectory(dirPath, retentionDays, description) {
    if (!directoryExists(dirPath)) {
        if (CONFIG.VERBOSE) {
            log(`디렉토리가 존재하지 않음: ${dirPath}`);
        }
        return { deletedCount: 0, freedSpace: 0 };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let deletedCount = 0;
    let freedSpace = 0;

    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);

            try {
                const stats = fs.statSync(itemPath);

                if (stats.mtime < cutoffDate) {
                    const size = stats.isDirectory() ? getDirSize(itemPath) : stats.size;

                    if (CONFIG.VERBOSE) {
                        log(`삭제 대상: ${itemPath} (${formatBytes(size)}, ${stats.mtime.toISOString()})`);
                    }

                    if (!CONFIG.DRY_RUN) {
                        if (deleteFileOrDirectory(itemPath)) {
                            deletedCount++;
                            freedSpace += size;
                        }
                    } else {
                        deletedCount++;
                        freedSpace += size;
                    }
                }
            } catch (error) {
                log(`파일 정보 읽기 실패: ${itemPath} - ${error.message}`, 'error');
            }
        }
    } catch (error) {
        log(`디렉토리 읽기 실패: ${dirPath} - ${error.message}`, 'error');
    }

    if (deletedCount > 0) {
        const action = CONFIG.DRY_RUN ? '삭제 예정' : '삭제 완료';
        log(`${description}: ${deletedCount}개 항목 ${action} (${formatBytes(freedSpace)} 확보)`, 'success');
    } else {
        if (CONFIG.VERBOSE) {
            log(`${description}: 삭제할 항목 없음`);
        }
    }

    return { deletedCount, freedSpace };
}

/**
 * 디렉토리 크기 계산
 */
function getDirSize(dirPath) {
    let totalSize = 0;

    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                totalSize += getDirSize(itemPath);
            } else {
                totalSize += stats.size;
            }
        }
    } catch (error) {
        // 에러 무시 (권한 문제 등)
    }

    return totalSize;
}

/**
 * 빈 디렉토리 정리
 */
function cleanupEmptyDirectories(dirPath) {
    if (!directoryExists(dirPath)) {
        return 0;
    }

    let removedCount = 0;

    try {
        const items = fs.readdirSync(dirPath);

        // 하위 디렉토리부터 정리
        for (const item of items) {
            const itemPath = path.join(dirPath, item);

            try {
                const stats = fs.statSync(itemPath);
                if (stats.isDirectory()) {
                    removedCount += cleanupEmptyDirectories(itemPath);
                }
            } catch (error) {
                // 파일이 이미 삭제된 경우 등
            }
        }

        // 현재 디렉토리가 비어있는지 확인
        const currentItems = fs.readdirSync(dirPath);
        if (currentItems.length === 0) {
            if (CONFIG.VERBOSE) {
                log(`빈 디렉토리 삭제: ${dirPath}`);
            }

            if (!CONFIG.DRY_RUN) {
                fs.rmdirSync(dirPath);
            }
            removedCount++;
        }
    } catch (error) {
        // 에러 무시
    }

    return removedCount;
}

/**
 * 메인 정리 함수
 */
function main() {
    const startTime = Date.now();

    log('🧹 테스트 결과물 정리 시작');

    if (CONFIG.DRY_RUN) {
        log('⚠️ DRY RUN 모드: 실제 삭제하지 않고 시뮬레이션만 실행합니다');
    }

    const projectRoot = path.resolve(__dirname, '..');
    const testResultsPath = path.join(projectRoot, CONFIG.TEST_RESULTS_DIR);

    let totalDeleted = 0;
    let totalFreedSpace = 0;

    // 1. 일반 테스트 결과 정리
    const generalResults = cleanupDirectory(
        testResultsPath,
        CONFIG.RETENTION_DAYS,
        '일반 테스트 결과'
    );
    totalDeleted += generalResults.deletedCount;
    totalFreedSpace += generalResults.freedSpace;

    // 2. 스크린샷 정리
    const screenshotsPath = path.join(testResultsPath, 'screenshots');
    const screenshotResults = cleanupDirectory(
        screenshotsPath,
        CONFIG.SCREENSHOTS_RETENTION_DAYS,
        '스크린샷'
    );
    totalDeleted += screenshotResults.deletedCount;
    totalFreedSpace += screenshotResults.freedSpace;

    // 3. 비디오 정리
    const videosPath = path.join(testResultsPath, 'videos');
    const videoResults = cleanupDirectory(
        videosPath,
        CONFIG.VIDEOS_RETENTION_DAYS,
        '비디오'
    );
    totalDeleted += videoResults.deletedCount;
    totalFreedSpace += videoResults.freedSpace;

    // 4. 트레이스 파일 정리
    const tracesPath = path.join(testResultsPath, 'traces');
    const traceResults = cleanupDirectory(
        tracesPath,
        CONFIG.VIDEOS_RETENTION_DAYS,
        '트레이스 파일'
    );
    totalDeleted += traceResults.deletedCount;
    totalFreedSpace += traceResults.freedSpace;

    // 5. 빈 디렉토리 정리
    const emptyDirsRemoved = cleanupEmptyDirectories(testResultsPath);
    if (emptyDirsRemoved > 0) {
        log(`빈 디렉토리 ${emptyDirsRemoved}개 정리 완료`, 'success');
    }

    // 결과 요약
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('📊 정리 완료 요약:');
    log(`   • 삭제된 항목: ${totalDeleted}개`);
    log(`   • 확보된 공간: ${formatBytes(totalFreedSpace)}`);
    log(`   • 실행 시간: ${duration}초`);

    if (totalDeleted === 0) {
        log('정리할 항목이 없습니다', 'success');
    }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { cleanupDirectory, formatBytes };

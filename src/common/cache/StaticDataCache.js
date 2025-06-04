/**
 * 정적 데이터 캐싱 유틸리티
 * 자주 조회되지만 거의 변경되지 않는 데이터를 캐싱
 */

import getCacheManager from './getCacheManager.js';
import logger from '../utils/Logger.js';

class StaticDataCache {
    constructor() {
        this.cache = getCacheManager();
        this.defaultTTL = 3600; // 1시간
        this.keyPrefix = 'static_data';
    }

    /**
     * 정적 데이터 조회 (캐시 먼저, 없으면 DB 조회 후 캐싱)
     * @param {string} key - 캐시 키
     * @param {function} dataLoader - 데이터 로더 함수
     * @param {number} ttl - TTL (초)
     * @returns {Promise<any>} 캐시된 데이터 또는 새로 로드된 데이터
     */
    async getOrLoad(key, dataLoader, ttl = this.defaultTTL) {
        try {
            const cacheKey = this._createKey(key);

            // 캐시에서 먼저 조회
            const cachedData = await this.cache.get(cacheKey);
            if (cachedData !== null) {
                logger.debug('정적 데이터 캐시 히트', { key: cacheKey });
                return cachedData;
            }

            // 캐시에 없으면 데이터 로더 실행
            logger.debug('정적 데이터 캐시 미스, 새로 로드', { key: cacheKey });
            const data = await dataLoader();

            // 데이터가 있으면 캐시에 저장
            if (data !== null && data !== undefined) {
                await this.cache.set(cacheKey, data, ttl);
                logger.debug('정적 데이터 캐시 저장 완료', {
                    key: cacheKey,
                    ttl,
                    dataSize: JSON.stringify(data).length
                });
            }

            return data;
        } catch (error) {
            logger.error('정적 데이터 캐시 오류', {
                error: error.message,
                key
            });
            // 캐시 오류가 있어도 데이터 로더는 실행
            return await dataLoader();
        }
    }

    /**
     * 전시회 통계 캐싱
     * @param {function} statsLoader - 통계 로더 함수
     * @returns {Promise<object>} 전시회 통계
     */
    async getExhibitionStats(statsLoader) {
        return this.getOrLoad('exhibition_stats', statsLoader, 1800); // 30분
    }

    /**
     * 작품 통계 캐싱
     * @param {function} statsLoader - 통계 로더 함수
     * @returns {Promise<object>} 작품 통계
     */
    async getArtworkStats(statsLoader) {
        return this.getOrLoad('artwork_stats', statsLoader, 1800); // 30분
    }

    /**
     * 주요 전시회 목록 캐싱
     * @param {function} featuredLoader - 주요 전시회 로더 함수
     * @returns {Promise<Array>} 주요 전시회 목록
     */
    async getFeaturedExhibitions(featuredLoader) {
        return this.getOrLoad('featured_exhibitions', featuredLoader, 900); // 15분
    }

    /**
     * 추천 작품 목록 캐싱
     * @param {function} recommendedLoader - 추천 작품 로더 함수
     * @returns {Promise<Array>} 추천 작품 목록
     */
    async getRecommendedArtworks(recommendedLoader) {
        return this.getOrLoad('recommended_artworks', recommendedLoader, 900); // 15분
    }

    /**
     * 최근 작품 목록 캐싱
     * @param {function} recentLoader - 최근 작품 로더 함수
     * @returns {Promise<Array>} 최근 작품 목록
     */
    async getRecentArtworks(recentLoader) {
        return this.getOrLoad('recent_artworks', recentLoader, 600); // 10분
    }

    /**
     * 사용자 통계 캐싱
     * @param {function} userStatsLoader - 사용자 통계 로더 함수
     * @returns {Promise<object>} 사용자 통계
     */
    async getUserStats(userStatsLoader) {
        return this.getOrLoad('user_stats', userStatsLoader, 3600); // 1시간
    }

    /**
     * 시스템 설정 캐싱
     * @param {function} configLoader - 설정 로더 함수
     * @returns {Promise<object>} 시스템 설정
     */
    async getSystemConfig(configLoader) {
        return this.getOrLoad('system_config', configLoader, 7200); // 2시간
    }

    /**
     * 특정 키의 캐시 무효화
     * @param {string} key - 무효화할 키
     * @returns {Promise<boolean>} 성공 여부
     */
    async invalidate(key) {
        try {
            const cacheKey = this._createKey(key);
            const success = await this.cache.del(cacheKey);

            if (success) {
                logger.info('정적 데이터 캐시 무효화', { key: cacheKey });
            } else {
                logger.debug('정적 데이터 캐시 무효화: 키 없음', { key: cacheKey });
            }

            return success;
        } catch (error) {
            logger.error('정적 데이터 캐시 무효화 실패', {
                error: error.message,
                key
            });
            return false;
        }
    }

    /**
     * 여러 키 무효화
     * @param {Array<string>} keys - 무효화할 키 목록
     * @returns {Promise<number>} 성공한 무효화 수
     */
    async invalidateMultiple(keys) {
        const results = await Promise.allSettled(keys.map(key => this.invalidate(key)));

        const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;

        logger.info('정적 데이터 다중 캐시 무효화', {
            총요청: keys.length,
            성공: successCount,
            실패: keys.length - successCount
        });

        return successCount;
    }

    /**
     * 패턴으로 캐시 무효화
     * @param {string} pattern - 무효화할 패턴 (예: "stats_*")
     * @returns {Promise<number>} 삭제된 캐시 수
     */
    async invalidatePattern(pattern) {
        try {
            const fullPattern = `${this.keyPrefix}:${pattern}`;
            const deletedCount = await this.cache.delByPattern(fullPattern);

            logger.info('정적 데이터 패턴 캐시 무효화', {
                pattern: fullPattern,
                deletedCount
            });

            return deletedCount;
        } catch (error) {
            logger.error('정적 데이터 패턴 캐시 무효화 실패', {
                error: error.message,
                pattern
            });
            return 0;
        }
    }

    /**
     * 모든 정적 데이터 캐시 무효화
     * @returns {Promise<number>} 삭제된 캐시 수
     */
    async invalidateAll() {
        return this.invalidatePattern('*');
    }

    /**
     * 캐시 키 생성
     * @param {string} key - 원본 키
     * @returns {string} 완전한 캐시 키
     */
    _createKey(key) {
        return `${this.keyPrefix}:${key}`;
    }

    /**
     * 캐시 통계 조회
     * @returns {Promise<object>} 캐시 통계
     */
    async getStats() {
        try {
            const allStats = await this.cache.getStats();

            // 정적 데이터 캐시 관련 통계만 필터링
            const staticStats = {
                ...allStats,
                keys: (allStats.keys || []).filter(key => key.startsWith(this.keyPrefix))
            };

            return staticStats;
        } catch (error) {
            logger.error('정적 데이터 캐시 통계 조회 실패', {
                error: error.message
            });
            return { error: error.message };
        }
    }

    /**
     * 프리로드 - 자주 사용되는 데이터 미리 캐싱
     * @param {object} loaders - 데이터 로더 함수들
     * @returns {Promise<object>} 프리로드 결과
     */
    async preload(loaders = {}) {
        const results = {};
        const promises = [];

        // 공통적으로 자주 사용되는 데이터들
        const commonLoaders = {
            featured_exhibitions: loaders.featuredExhibitions,
            recent_artworks: loaders.recentArtworks,
            exhibition_stats: loaders.exhibitionStats,
            artwork_stats: loaders.artworkStats,
            ...loaders
        };

        // 병렬로 프리로드 실행
        for (const [key, loader] of Object.entries(commonLoaders)) {
            if (typeof loader === 'function') {
                promises.push(
                    this.getOrLoad(key, loader)
                        .then(data => ({ key, status: 'success', data }))
                        .catch(error => ({ key, status: 'error', error: error.message }))
                );
            }
        }

        const settledResults = await Promise.allSettled(promises);

        // 결과 정리
        settledResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results[result.value.key] = result.value;
            } else {
                results[`error_${index}`] = {
                    status: 'error',
                    error: result.reason.message
                };
            }
        });

        const successCount = Object.values(results).filter(r => r.status === 'success').length;

        logger.info('정적 데이터 프리로드 완료', {
            총요청: promises.length,
            성공: successCount,
            실패: promises.length - successCount
        });

        return results;
    }
}

// 싱글톤 인스턴스 생성
const staticDataCache = new StaticDataCache();
export default staticDataCache;

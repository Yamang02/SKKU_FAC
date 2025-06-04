import redisClient from '../redis/RedisClient.js';
import logger from '../../common/utils/Logger.js';
import Config from '../../config/Config.js';

/**
 * Redis 기반 캐싱 서비스
 * 데이터베이스 쿼리 결과를 캐싱하여 성능을 향상시킵니다.
 */
export default class CacheService {
    constructor() {
        this.config = Config.getInstance();
        this.redisConfig = this.config.getRedisConfig();
        this.defaultTTL = this.redisConfig.ttl || 3600; // 기본 1시간
        this.keyPrefix = this.redisConfig.prefix || 'cache:';
    }

    /**
     * 캐시 키 생성
     * @param {string} namespace - 네임스페이스 (예: 'exhibition', 'artwork')
     * @param {string} key - 캐시 키
     * @returns {string} 완전한 캐시 키
     */
    generateKey(namespace, key) {
        return `${this.keyPrefix}${namespace}:${key}`;
    }

    /**
     * 캐시에서 데이터 조회
     * @param {string} namespace - 네임스페이스
     * @param {string} key - 캐시 키
     * @returns {Promise<any|null>} 캐시된 데이터 또는 null
     */
    async get(namespace, key) {
        try {
            if (!redisClient.isClientConnected()) {
                logger.warn('Redis 클라이언트가 연결되지 않음. 캐시 조회 건너뜀.');
                return null;
            }

            const fullKey = this.generateKey(namespace, key);
            const cachedData = await redisClient.getClient().get(fullKey);

            if (cachedData) {
                logger.debug(`캐시 히트: ${fullKey}`);
                return JSON.parse(cachedData);
            }

            logger.debug(`캐시 미스: ${fullKey}`);
            return null;
        } catch (error) {
            logger.error('캐시 조회 오류:', error);
            return null;
        }
    }

    /**
     * 캐시에 데이터 저장
     * @param {string} namespace - 네임스페이스
     * @param {string} key - 캐시 키
     * @param {any} data - 저장할 데이터
     * @param {number} ttl - TTL (초 단위, 선택적)
     * @returns {Promise<boolean>} 저장 성공 여부
     */
    async set(namespace, key, data, ttl = null) {
        try {
            if (!redisClient.isClientConnected()) {
                logger.warn('Redis 클라이언트가 연결되지 않음. 캐시 저장 건너뜀.');
                return false;
            }

            const fullKey = this.generateKey(namespace, key);
            const serializedData = JSON.stringify(data);
            const expireTime = ttl || this.defaultTTL;

            await redisClient.getClient().setEx(fullKey, expireTime, serializedData);
            logger.debug(`캐시 저장: ${fullKey} (TTL: ${expireTime}초)`);
            return true;
        } catch (error) {
            logger.error('캐시 저장 오류:', error);
            return false;
        }
    }

    /**
     * 캐시 삭제
     * @param {string} namespace - 네임스페이스
     * @param {string} key - 캐시 키
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(namespace, key) {
        try {
            if (!redisClient.isClientConnected()) {
                logger.warn('Redis 클라이언트가 연결되지 않음. 캐시 삭제 건너뜀.');
                return false;
            }

            const fullKey = this.generateKey(namespace, key);
            const result = await redisClient.getClient().del(fullKey);
            logger.debug(`캐시 삭제: ${fullKey}`);
            return result > 0;
        } catch (error) {
            logger.error('캐시 삭제 오류:', error);
            return false;
        }
    }

    /**
     * 패턴으로 캐시 삭제 (네임스페이스 전체 삭제 등)
     * @param {string} pattern - 삭제할 키 패턴
     * @returns {Promise<number>} 삭제된 키 개수
     */
    async deleteByPattern(pattern) {
        try {
            if (!redisClient.isClientConnected()) {
                logger.warn('Redis 클라이언트가 연결되지 않음. 패턴 캐시 삭제 건너뜀.');
                return 0;
            }

            const fullPattern = `${this.keyPrefix}${pattern}`;
            const keys = await redisClient.getClient().keys(fullPattern);

            if (keys.length === 0) {
                return 0;
            }

            const result = await redisClient.getClient().del(keys);
            logger.debug(`패턴 캐시 삭제: ${fullPattern} (${result}개 키 삭제)`);
            return result;
        } catch (error) {
            logger.error('패턴 캐시 삭제 오류:', error);
            return 0;
        }
    }

    /**
     * 캐시 존재 여부 확인
     * @param {string} namespace - 네임스페이스
     * @param {string} key - 캐시 키
     * @returns {Promise<boolean>} 존재 여부
     */
    async exists(namespace, key) {
        try {
            if (!redisClient.isClientConnected()) {
                return false;
            }

            const fullKey = this.generateKey(namespace, key);
            const result = await redisClient.getClient().exists(fullKey);
            return result === 1;
        } catch (error) {
            logger.error('캐시 존재 확인 오류:', error);
            return false;
        }
    }

    /**
     * 캐시 TTL 조회
     * @param {string} namespace - 네임스페이스
     * @param {string} key - 캐시 키
     * @returns {Promise<number>} TTL (초 단위, -1: 만료시간 없음, -2: 키 없음)
     */
    async getTTL(namespace, key) {
        try {
            if (!redisClient.isClientConnected()) {
                return -2;
            }

            const fullKey = this.generateKey(namespace, key);
            return await redisClient.getClient().ttl(fullKey);
        } catch (error) {
            logger.error('캐시 TTL 조회 오류:', error);
            return -2;
        }
    }

    /**
     * 캐시 통계 조회
     * @returns {Promise<Object>} 캐시 통계
     */
    async getStats() {
        try {
            if (!redisClient.isClientConnected()) {
                return { connected: false };
            }

            const info = await redisClient.getClient().info('memory');
            const keyCount = await redisClient.getClient().dbSize();

            return {
                connected: true,
                keyCount,
                memoryInfo: info,
                prefix: this.keyPrefix,
                defaultTTL: this.defaultTTL
            };
        } catch (error) {
            logger.error('캐시 통계 조회 오류:', error);
            return { connected: false, error: error.message };
        }
    }

    // 네임스페이스별 캐시 무효화 메서드들

    /**
     * 전시회 관련 캐시 무효화
     * @param {string} exhibitionId - 전시회 ID (선택적)
     */
    async invalidateExhibitionCache(exhibitionId = null) {
        if (exhibitionId) {
            await this.deleteByPattern(`exhibition:${exhibitionId}:*`);
            await this.delete('exhibition', exhibitionId);
        } else {
            await this.deleteByPattern('exhibition:*');
        }

        // 관련 캐시도 무효화
        await this.deleteByPattern('featured_exhibitions:*');
        await this.deleteByPattern('submittable_exhibitions:*');

        logger.info(`전시회 캐시 무효화 완료 ${exhibitionId ? `(ID: ${exhibitionId})` : '(전체)'}`);
    }

    /**
     * 작품 관련 캐시 무효화
     * @param {string} artworkId - 작품 ID (선택적)
     */
    async invalidateArtworkCache(artworkId = null) {
        if (artworkId) {
            await this.deleteByPattern(`artwork:${artworkId}:*`);
            await this.delete('artwork', artworkId);
        } else {
            await this.deleteByPattern('artwork:*');
        }

        // 관련 캐시도 무효화
        await this.deleteByPattern('featured_artworks:*');
        await this.deleteByPattern('exhibition_artworks:*');

        logger.info(`작품 캐시 무효화 완료 ${artworkId ? `(ID: ${artworkId})` : '(전체)'}`);
    }

    /**
     * 사용자 관련 캐시 무효화
     * @param {string} userId - 사용자 ID (선택적)
     */
    async invalidateUserCache(userId = null) {
        if (userId) {
            await this.deleteByPattern(`user:${userId}:*`);
            await this.delete('user', userId);
        } else {
            await this.deleteByPattern('user:*');
        }

        logger.info(`사용자 캐시 무효화 완료 ${userId ? `(ID: ${userId})` : '(전체)'}`);
    }

    /**
     * 공지사항 관련 캐시 무효화
     */
    async invalidateNoticeCache() {
        await this.deleteByPattern('notice:*');
        await this.deleteByPattern('important_notices:*');

        logger.info('공지사항 캐시 무효화 완료');
    }
}

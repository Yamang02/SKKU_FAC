/**
 * 캐시 기능이 통합된 Repository 기본 클래스
 * BaseRepository를 확장하여 자주 사용되는 쿼리에 캐싱 적용
 */

import BaseRepository from '../../infrastructure/db/repository/BaseRepository.js';
import getCacheManager from './getCacheManager.js';
import logger from '../utils/Logger.js';

class CachedRepository extends BaseRepository {
    constructor(model) {
        super(model);
        this.cache = getCacheManager();
        this.defaultTTL = 300; // 5분
        this.shortTTL = 60; // 1분 (빈번하게 변경되는 데이터)
        this.longTTL = 3600; // 1시간 (거의 변경되지 않는 데이터)
    }

    /**
     * 캐시 키 생성 헬퍼
     * @param {string} method - 메서드명
     * @param {object} params - 쿼리 파라미터
     * @returns {string} 캐시 키
     */
    async _createCacheKey(method, params = {}) {
        const modelName = this.model.name.toLowerCase();
        const paramString = JSON.stringify(params, (key, value) => {
            // 불필요한 객체 참조 제거
            if (typeof value === 'object' && value !== null && value.constructor === Object) {
                return Object.keys(value)
                    .sort()
                    .reduce((sorted, key) => {
                        sorted[key] = value[key];
                        return sorted;
                    }, {});
            }
            return value;
        });

        // MD5 해시를 사용하여 긴 파라미터 문자열을 짧게 만듦
        const crypto = await import('crypto');
        const hash = crypto.createHash('md5').update(paramString).digest('hex');

        return this.cache.createKey(modelName, method, hash);
    }

    /**
     * 캐시 무효화 헬퍼
     * @param {string} pattern - 무효화할 패턴
     */
    async _invalidateCache(pattern = null) {
        try {
            const modelName = this.model.name.toLowerCase();
            const invalidationPattern = pattern || `${modelName}:*`;

            const deletedCount = await this.cache.delByPattern(invalidationPattern);

            if (deletedCount > 0) {
                logger.debug('캐시 무효화 완료', {
                    model: modelName,
                    pattern: invalidationPattern,
                    deletedCount
                });
            }
        } catch (error) {
            logger.warn('캐시 무효화 실패', {
                error: error.message,
                pattern
            });
        }
    }

    /**
     * ID로 단일 레코드 조회 (캐시 적용)
     * @param {number|string} id - 조회할 레코드의 ID
     * @param {object} options - 조회 옵션
     * @returns {Promise<object|null>} 조회된 레코드 또는 null
     */
    async findById(id, options = {}) {
        // 트랜잭션이 있거나 특별한 옵션이 있으면 캐시 건너뛰기
        if (options.transaction || options.lock || options.paranoid === false) {
            return await super.findById(id, options);
        }

        const cacheKey = await this._createCacheKey('findById', { id, options });

        return await this.cache.wrap(
            cacheKey,
            async () => {
                const result = await super.findById(id, options);
                logger.debug('데이터베이스에서 조회 후 캐시 저장', {
                    model: this.model.name,
                    method: 'findById',
                    id,
                    found: !!result
                });
                return result;
            },
            this.defaultTTL
        );
    }

    /**
     * 조건에 맞는 단일 레코드 조회 (캐시 적용)
     * @param {object} where - 조회 조건
     * @param {object} options - 조회 옵션
     * @returns {Promise<object|null>} 조회된 레코드 또는 null
     */
    async findOne(where = {}, options = {}) {
        // 트랜잭션이 있거나 특별한 옵션이 있으면 캐시 건너뛰기
        if (options.transaction || options.lock || options.paranoid === false) {
            return await super.findOne(where, options);
        }

        const cacheKey = await this._createCacheKey('findOne', { where, options });

        return await this.cache.wrap(
            cacheKey,
            async () => {
                const result = await super.findOne(where, options);
                logger.debug('데이터베이스에서 조회 후 캐시 저장', {
                    model: this.model.name,
                    method: 'findOne',
                    found: !!result
                });
                return result;
            },
            this.defaultTTL
        );
    }

    /**
     * 조건에 맞는 모든 레코드 조회 (캐시 적용)
     * @param {object} options - 조회 옵션
     * @returns {Promise<object>} 조회 결과
     */
    async findAll(options = {}) {
        // 트랜잭션이 있거나 특별한 옵션이 있으면 캐시 건너뛰기
        if (options.transaction || options.lock || options.paranoid === false) {
            return await super.findAll(options);
        }

        // 페이지네이션이 있는 경우 첫 페이지만 캐시 (성능상 이유)
        const shouldCache = !options.pagination || options.page === 1 || !options.page;

        if (!shouldCache) {
            return await super.findAll(options);
        }

        const cacheKey = await this._createCacheKey('findAll', options);

        return await this.cache.wrap(
            cacheKey,
            async () => {
                const result = await super.findAll(options);
                logger.debug('데이터베이스에서 조회 후 캐시 저장', {
                    model: this.model.name,
                    method: 'findAll',
                    total: result.total || result.items?.length
                });
                return result;
            },
            this.shortTTL
        ); // 목록은 더 짧은 TTL 사용
    }

    /**
     * 배치로 여러 ID의 레코드 조회 (캐시 적용)
     * @param {Array} ids - 조회할 ID 배열
     * @param {object} options - 조회 옵션
     * @returns {Promise<Array>} 조회된 레코드 배열
     */
    async findByIds(ids, options = {}) {
        if (!ids || ids.length === 0) {
            return [];
        }

        // 트랜잭션이 있거나 특별한 옵션이 있으면 캐시 건너뛰기
        if (options.transaction || options.lock || options.paranoid === false) {
            return await super.findByIds(ids, options);
        }

        const cacheKey = await this._createCacheKey('findByIds', { ids: ids.sort(), options });

        return await this.cache.wrap(
            cacheKey,
            async () => {
                const result = await super.findByIds(ids, options);
                logger.debug('데이터베이스에서 조회 후 캐시 저장', {
                    model: this.model.name,
                    method: 'findByIds',
                    idsCount: ids.length,
                    foundCount: result.length
                });
                return result;
            },
            this.defaultTTL
        );
    }

    /**
     * 레코드 생성 (캐시 무효화)
     * @param {object} data - 생성할 데이터
     * @param {object} options - 생성 옵션
     * @returns {Promise<object>} 생성된 레코드
     */
    async create(data, options = {}) {
        const result = await super.create(data, options);

        // 캐시 무효화
        await this._invalidateCache();

        logger.debug('레코드 생성 후 캐시 무효화', {
            model: this.model.name,
            id: result.id
        });

        return result;
    }

    /**
     * 레코드 업데이트 (캐시 무효화)
     * @param {number|string} id - 업데이트할 레코드 ID
     * @param {object} data - 업데이트할 데이터
     * @param {object} options - 업데이트 옵션
     * @returns {Promise<object>} 업데이트된 레코드
     */
    async update(id, data, options = {}) {
        const result = await super.update(id, data, options);

        // 캐시 무효화
        await this._invalidateCache();

        logger.debug('레코드 업데이트 후 캐시 무효화', {
            model: this.model.name,
            id
        });

        return result;
    }

    /**
     * 레코드 삭제 (캐시 무효화)
     * @param {number|string} id - 삭제할 레코드 ID
     * @param {object} options - 삭제 옵션
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(id, options = {}) {
        const result = await super.delete(id, options);

        // 캐시 무효화
        await this._invalidateCache();

        logger.debug('레코드 삭제 후 캐시 무효화', {
            model: this.model.name,
            id
        });

        return result;
    }

    /**
     * 조건에 맞는 레코드 수 계산 (캐시 적용)
     * @param {object} where - 계산 조건
     * @param {object} options - 계산 옵션
     * @returns {Promise<number>} 레코드 수
     */
    async count(where = {}, options = {}) {
        // 트랜잭션이 있으면 캐시 건너뛰기
        if (options.transaction) {
            return await super.count(where, options);
        }

        const cacheKey = await this._createCacheKey('count', { where, options });

        return await this.cache.wrap(
            cacheKey,
            async () => {
                const result = await super.count(where, options);
                logger.debug('데이터베이스에서 카운트 후 캐시 저장', {
                    model: this.model.name,
                    count: result
                });
                return result;
            },
            this.defaultTTL
        );
    }

    /**
     * 특정 필드로 그룹핑된 결과 조회 (캐시 적용)
     * @param {string} field - 그룹핑할 필드
     * @param {object} options - 조회 옵션
     * @returns {Promise<Array>} 그룹핑된 결과
     */
    async findAllGroupedBy(field, options = {}) {
        // 트랜잭션이 있으면 캐시 건너뛰기
        if (options.transaction) {
            return await super.findAll({
                ...options,
                group: [field],
                attributes: [field, [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count']]
            });
        }

        const cacheKey = await this._createCacheKey('findAllGroupedBy', { field, options });

        return await this.cache.wrap(
            cacheKey,
            async () => {
                const result = await super.findAll({
                    ...options,
                    group: [field],
                    attributes: [field, [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count']]
                });
                logger.debug('데이터베이스에서 그룹핑 조회 후 캐시 저장', {
                    model: this.model.name,
                    field,
                    groupCount: result.items?.length || 0
                });
                return result;
            },
            this.longTTL
        ); // 통계성 데이터는 긴 TTL 사용
    }

    /**
     * 캐시 상태 조회
     * @returns {Promise<object>} 캐시 상태 정보
     */
    async getCacheStats() {
        const stats = await this.cache.getStats();
        return {
            ...stats,
            model: this.model.name,
            ttlSettings: {
                default: this.defaultTTL,
                short: this.shortTTL,
                long: this.longTTL
            }
        };
    }

    /**
     * 모델별 캐시 수동 무효화
     * @param {string} pattern - 특정 패턴 (선택사항)
     * @returns {Promise<number>} 삭제된 캐시 수
     */
    async clearCache(pattern = null) {
        const modelName = this.model.name.toLowerCase();
        const finalPattern = pattern || `${modelName}:*`;

        const deletedCount = await this.cache.delByPattern(finalPattern);

        logger.info('캐시 수동 무효화 완료', {
            model: modelName,
            pattern: finalPattern,
            deletedCount
        });

        return deletedCount;
    }
}

export default CachedRepository;

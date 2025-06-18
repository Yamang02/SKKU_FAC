import { Op } from 'sequelize';
import { db } from '../adapter/MySQLDatabase.js';
import logger from '../../../common/utils/Logger.js';

/**
 * BaseRepository 클래스
 * 모든 Repository가 상속받을 기본 클래스로, 공통 CRUD 작업과 고급 쿼리 기능을 제공합니다.
 */
export default class BaseRepository {
    /**
     * @param {Model} model - Sequelize 모델 클래스
     */
    constructor(model) {
        if (!model) {
            throw new Error('Model is required for BaseRepository');
        }
        this.model = model;
    }

    /**
     * ID로 단일 레코드 조회
     * @param {number|string} id - 조회할 레코드의 ID
     * @param {object} options - 조회 옵션
     * @param {Array} options.include - 포함할 관계 모델들
     * @param {Array} options.attributes - 선택할 속성들
     * @param {object} options.transaction - 트랜잭션 객체
     * @param {string|Array} options.scope - 적용할 스코프
     * @returns {Promise<object|null>} 조회된 레코드 또는 null
     */
    async findById(id, options = {}) {
        const queryOptions = this._buildQueryOptions(options);

        if (options.scope) {
            return await this.model.scope(options.scope).findByPk(id, queryOptions);
        }

        return await this.model.findByPk(id, queryOptions);
    }

    /**
     * 조건에 맞는 단일 레코드 조회
     * @param {object} where - 조회 조건
     * @param {object} options - 조회 옵션
     * @returns {Promise<object|null>} 조회된 레코드 또는 null
     */
    async findOne(where = {}, options = {}) {
        const queryOptions = this._buildQueryOptions({
            ...options,
            where
        });

        if (options.scope) {
            return await this.model.scope(options.scope).findOne(queryOptions);
        }

        return await this.model.findOne(queryOptions);
    }

    /**
     * 조건에 맞는 모든 레코드 조회 (페이지네이션 지원)
     * @param {object} options - 조회 옵션
     * @param {object} options.where - 조회 조건
     * @param {number} options.page - 페이지 번호 (기본값: 1)
     * @param {number} options.limit - 페이지당 레코드 수 (기본값: 10)
     * @param {Array} options.order - 정렬 조건 (기본값: [['createdAt', 'DESC']])
     * @param {Array} options.include - 포함할 관계 모델들
     * @param {Array} options.attributes - 선택할 속성들
     * @param {object} options.transaction - 트랜잭션 객체
     * @param {string|Array} options.scope - 적용할 스코프
     * @param {boolean} options.pagination - 페이지네이션 사용 여부 (기본값: true)
     * @returns {Promise<object>} 조회 결과 { items, total, page, totalPages, hasNext, hasPrev }
     */
    async findAll(options = {}) {
        const {
            where = {},
            page = 1,
            limit = 10,
            order = [['createdAt', 'DESC']],
            pagination = true,
            scope,
            ...queryOptions
        } = options;

        const baseQueryOptions = this._buildQueryOptions({
            where,
            order,
            ...queryOptions
        });

        let model = this.model;
        if (scope) {
            model = this.model.scope(scope);
        }

        if (!pagination) {
            const items = await model.findAll(baseQueryOptions);
            return {
                items,
                total: items.length,
                pagination: false
            };
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await model.findAndCountAll({
            ...baseQueryOptions,
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true // 관계 조회 시 중복 카운트 방지
        });

        const totalPages = Math.ceil(count / limit);

        return {
            items: rows,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    /**
     * 새 레코드 생성
     * @param {object} data - 생성할 데이터
     * @param {object} options - 생성 옵션
     * @param {object} options.transaction - 트랜잭션 객체
     * @param {Array} options.include - 포함할 관계 모델들 (bulk create 시)
     * @returns {Promise<object>} 생성된 레코드
     */
    async create(data, options = {}) {
        const createOptions = this._buildQueryOptions(options);

        // 타임스탬프 자동 설정
        const now = new Date();
        const dataWithTimestamps = {
            ...data,
            createdAt: data.createdAt || now,
            updatedAt: data.updatedAt || now
        };

        return await this.model.create(dataWithTimestamps, createOptions);
    }

    /**
     * 여러 레코드 일괄 생성
     * @param {Array} dataArray - 생성할 데이터 배열
     * @param {object} options - 생성 옵션
     * @returns {Promise<Array>} 생성된 레코드들
     */
    async bulkCreate(dataArray, options = {}) {
        const createOptions = this._buildQueryOptions(options);

        // 타임스탬프 자동 설정
        const now = new Date();
        const dataWithTimestamps = dataArray.map(data => ({
            ...data,
            createdAt: data.createdAt || now,
            updatedAt: data.updatedAt || now
        }));

        return await this.model.bulkCreate(dataWithTimestamps, createOptions);
    }

    /**
     * ID로 레코드 업데이트
     * @param {number|string} id - 업데이트할 레코드의 ID
     * @param {object} data - 업데이트할 데이터
     * @param {object} options - 업데이트 옵션
     * @param {object} options.transaction - 트랜잭션 객체
     * @param {boolean} options.returning - 업데이트된 레코드 반환 여부 (기본값: true)
     * @returns {Promise<object|Array>} 업데이트된 레코드 또는 영향받은 행 수
     */
    async updateById(id, data, options = {}) {
        const { returning = true, ...updateOptions } = options;
        const queryOptions = this._buildQueryOptions(updateOptions);

        // 타임스탬프 자동 설정
        const dataWithTimestamp = {
            ...data,
            updatedAt: new Date()
        };

        if (returning) {
            const record = await this.findById(id, { transaction: options.transaction });
            if (!record) {
                return null;
            }

            await record.update(dataWithTimestamp, queryOptions);
            return record;
        } else {
            const [affectedCount] = await this.model.update(dataWithTimestamp, {
                where: { id },
                ...queryOptions
            });
            return affectedCount;
        }
    }

    /**
     * 조건에 맞는 레코드들 업데이트
     * @param {object} where - 업데이트 조건
     * @param {object} data - 업데이트할 데이터
     * @param {object} options - 업데이트 옵션
     * @returns {Promise<number>} 영향받은 행 수
     */
    async updateWhere(where, data, options = {}) {
        const queryOptions = this._buildQueryOptions(options);

        // 타임스탬프 자동 설정
        const dataWithTimestamp = {
            ...data,
            updatedAt: new Date()
        };

        const [affectedCount] = await this.model.update(dataWithTimestamp, {
            where,
            ...queryOptions
        });

        return affectedCount;
    }

    /**
     * ID로 레코드 삭제
     * @param {number|string} id - 삭제할 레코드의 ID
     * @param {object} options - 삭제 옵션
     * @param {object} options.transaction - 트랜잭션 객체
     * @param {boolean} options.force - 강제 삭제 여부 (paranoid 모델용)
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteById(id, options = {}) {
        const queryOptions = this._buildQueryOptions(options);

        const record = await this.findById(id, { transaction: options.transaction });
        if (!record) {
            return false;
        }

        await record.destroy(queryOptions);
        return true;
    }

    /**
     * 조건에 맞는 레코드들 삭제
     * @param {object} where - 삭제 조건
     * @param {object} options - 삭제 옵션
     * @returns {Promise<number>} 삭제된 행 수
     */
    async deleteWhere(where, options = {}) {
        const queryOptions = this._buildQueryOptions(options);

        return await this.model.destroy({
            where,
            ...queryOptions
        });
    }

    /**
     * 레코드 개수 조회
     * @param {object} where - 조회 조건
     * @param {object} options - 조회 옵션
     * @returns {Promise<number>} 레코드 개수
     */
    async count(where = {}, options = {}) {
        const queryOptions = this._buildQueryOptions({
            where,
            ...options
        });

        return await this.model.count(queryOptions);
    }

    /**
     * 레코드 존재 여부 확인
     * @param {object} where - 조회 조건
     * @param {object} options - 조회 옵션
     * @returns {Promise<boolean>} 존재 여부
     */
    async exists(where, options = {}) {
        const count = await this.count(where, options);
        return count > 0;
    }

    /**
     * 트랜잭션 실행
     * @param {Function} callback - 트랜잭션 내에서 실행할 함수
     * @param {object} options - 트랜잭션 옵션
     * @returns {Promise<any>} 콜백 함수의 반환값
     */
    async transaction(callback, options = {}) {
        return await db.transaction(options, callback);
    }

    /**
     * 원시 SQL 쿼리 실행
     * @param {string} sql - 실행할 SQL 쿼리
     * @param {object} options - 쿼리 옵션
     * @returns {Promise<any>} 쿼리 결과
     */
    async rawQuery(sql, options = {}) {
        return await db.query(sql, {
            type: db.QueryTypes.SELECT,
            ...options
        });
    }

    /**
     * 검색 조건 빌더 (키워드 검색용)
     * @param {string} keyword - 검색 키워드
     * @param {Array} searchFields - 검색할 필드들
     * @returns {object} Sequelize where 조건
     */
    buildSearchCondition(keyword, searchFields = []) {
        if (!keyword || !searchFields.length) {
            return {};
        }

        return {
            [Op.or]: searchFields.map(field => ({
                [field]: { [Op.like]: `%${keyword}%` }
            }))
        };
    }

    /**
     * 날짜 범위 조건 빌더
     * @param {string} field - 날짜 필드명
     * @param {Date|string} startDate - 시작 날짜
     * @param {Date|string} endDate - 종료 날짜
     * @returns {object} Sequelize where 조건
     */
    buildDateRangeCondition(field, startDate, endDate) {
        const condition = {};

        if (startDate || endDate) {
            condition[field] = {};

            if (startDate) {
                condition[field][Op.gte] = new Date(startDate);
            }

            if (endDate) {
                condition[field][Op.lte] = new Date(endDate);
            }
        }

        return condition;
    }

    /**
     * 쿼리 옵션 빌더 (내부 사용)
     * @param {object} options - 원본 옵션
     * @returns {object} 정제된 쿼리 옵션
     * @private
     */
    _buildQueryOptions(options = {}) {
        const { where, include, attributes, order, transaction, paranoid, raw, nest, ...otherOptions } = options;

        const queryOptions = { ...otherOptions };

        if (where) queryOptions.where = where;
        if (include) queryOptions.include = include;
        if (attributes) queryOptions.attributes = attributes;
        if (order) queryOptions.order = order;
        if (transaction) queryOptions.transaction = transaction;
        if (paranoid !== undefined) queryOptions.paranoid = paranoid;
        if (raw !== undefined) queryOptions.raw = raw;
        if (nest !== undefined) queryOptions.nest = nest;

        return queryOptions;
    }

    /**
     * 모델 인스턴스 반환 (고급 사용자용)
     * @returns {Model} Sequelize 모델 인스턴스
     */
    getModel() {
        return this.model;
    }

    /**
     * 데이터베이스 인스턴스 반환 (고급 사용자용)
     * @returns {Sequelize} Sequelize 데이터베이스 인스턴스
     */
    getDatabase() {
        return db;
    }

    /**
     * 배치로 여러 ID의 레코드 조회 (N+1 문제 해결)
     * @param {Array} ids - 조회할 ID 배열
     * @param {object} options - 조회 옵션
     * @returns {Promise<Array>} 조회된 레코드 배열
     */
    async findByIds(ids, options = {}) {
        if (!ids || ids.length === 0) {
            return [];
        }

        const queryOptions = this._buildQueryOptions({
            ...options,
            where: {
                id: { [Op.in]: ids },
                ...(options.where || {})
            }
        });

        const results = await this.model.findAll(queryOptions);

        // ID 순서대로 정렬하여 반환
        const resultMap = new Map(results.map(item => [item.id, item]));
        return ids.map(id => resultMap.get(id)).filter(Boolean);
    }

    /**
     * 최적화된 관계 조회 (선택적 eager loading)
     * @param {object} options - 조회 옵션
     * @param {Array} options.includes - 포함할 관계 설정
     * @param {boolean} options.optimized - 최적화 모드 사용 여부
     * @returns {Promise<object>} 조회 결과
     */
    async findAllOptimized(options = {}) {
        const { includes = [], optimized = true, ...baseOptions } = options;

        if (!optimized || includes.length === 0) {
            return await this.findAll(baseOptions);
        }

        // 최적화된 include 설정
        const optimizedIncludes = includes.map(include => {
            if (typeof include === 'string') {
                // 문자열인 경우 기본 설정으로 변환
                return { association: include, required: false };
            }

            return {
                ...include,
                // 기본적으로 LEFT JOIN 사용 (required: false)
                required: include.required !== undefined ? include.required : false,
                // 중복 제거를 위한 설정
                duplicating: false
            };
        });

        return await this.findAll({
            ...baseOptions,
            include: optimizedIncludes
        });
    }

    /**
     * Raw SQL 쿼리 실행
     * @param {string} sql - 실행할 SQL 쿼리
     * @param {object} options - 쿼리 옵션
     * @param {Array} options.replacements - 바인딩 파라미터
     * @param {string} options.type - 쿼리 타입 (SELECT, INSERT, UPDATE, DELETE)
     * @returns {Promise<Array>} 쿼리 결과
     */
    async executeRawQuery(sql, options = {}) {
        const { replacements = [], type = 'SELECT' } = options;

        try {
            const [results, metadata] = await this.model.sequelize.query(sql, {
                replacements,
                type: this.model.sequelize.QueryTypes[type],
                raw: true,
                nest: true
            });

            return type === 'SELECT' ? results : { results, metadata };
        } catch (error) {
            logger.error('Raw SQL 쿼리 실행 실패:', { sql, replacements, error: error.message });
            throw error;
        }
    }

    /**
     * 집계 쿼리 최적화
     * @param {object} options - 집계 옵션
     * @param {string} options.field - 집계할 필드
     * @param {string} options.fn - 집계 함수 (COUNT, SUM, AVG, MAX, MIN)
     * @param {object} options.where - 조건
     * @param {Array} options.group - 그룹화 필드
     * @returns {Promise<Array|number>} 집계 결과
     */
    async aggregate(options = {}) {
        const { field = '*', fn = 'COUNT', where = {}, group = [] } = options;

        const aggregateOptions = {
            where,
            raw: true
        };

        if (group.length > 0) {
            aggregateOptions.group = group;
            aggregateOptions.attributes = [
                ...group,
                [this.model.sequelize.fn(fn, this.model.sequelize.col(field)), 'value']
            ];

            return await this.model.findAll(aggregateOptions);
        } else {
            return await this.model[fn.toLowerCase()](field, aggregateOptions);
        }
    }

    /**
     * 페이지네이션 최적화 (커서 기반)
     * @param {object} options - 페이지네이션 옵션
     * @param {string} options.cursor - 커서 값
     * @param {number} options.limit - 제한 수
     * @param {string} options.cursorField - 커서 필드 (기본: 'id')
     * @param {string} options.direction - 방향 ('ASC' 또는 'DESC')
     * @returns {Promise<object>} 페이지네이션 결과
     */
    async findWithCursor(options = {}) {
        const { cursor, limit = 10, cursorField = 'id', direction = 'ASC', where = {}, ...queryOptions } = options;

        const cursorWhere = { ...where };

        if (cursor) {
            const operator = direction === 'ASC' ? Op.gt : Op.lt;
            cursorWhere[cursorField] = { [operator]: cursor };
        }

        const results = await this.findAll({
            ...queryOptions,
            where: cursorWhere,
            limit: limit + 1, // 다음 페이지 존재 여부 확인을 위해 +1
            order: [[cursorField, direction]],
            pagination: false
        });

        const items = results.items || results;
        const hasNext = items.length > limit;

        if (hasNext) {
            items.pop(); // 마지막 항목 제거
        }

        const nextCursor = items.length > 0 ? items[items.length - 1][cursorField] : null;

        return {
            items,
            hasNext,
            nextCursor,
            limit
        };
    }

    /**
     * 관계 데이터 사전 로딩 (N+1 문제 해결)
     * @param {Array} items - 기본 데이터 배열
     * @param {string} relationField - 관계 필드명
     * @param {string} foreignKey - 외래키 필드명
     * @param {object} RelatedModel - 관련 모델
     * @param {object} options - 추가 옵션
     * @returns {Promise<Array>} 관계 데이터가 포함된 배열
     */
    async preloadRelations(items, relationField, foreignKey, RelatedModel, options = {}) {
        if (!items || items.length === 0) {
            return items;
        }

        // 외래키 값들 추출
        const foreignKeys = [...new Set(items.map(item => item[foreignKey]).filter(Boolean))];

        if (foreignKeys.length === 0) {
            return items;
        }

        // 관련 데이터 배치 조회
        const relatedItems = await RelatedModel.findAll({
            where: { id: { [Op.in]: foreignKeys } },
            ...options
        });

        // 관련 데이터 매핑
        const relatedMap = new Map(relatedItems.map(item => [item.id, item]));

        // 원본 데이터에 관계 데이터 추가
        return items.map(item => ({
            ...(item.toJSON ? item.toJSON() : item),
            [relationField]: relatedMap.get(item[foreignKey]) || null
        }));
    }
}

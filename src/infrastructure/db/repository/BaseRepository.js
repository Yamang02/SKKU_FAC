import { Op } from 'sequelize';
import { db } from '../adapter/MySQLDatabase.js';

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
            const [affectedCount] = await this.model.update(
                dataWithTimestamp,
                {
                    where: { id },
                    ...queryOptions
                }
            );
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

        const [affectedCount] = await this.model.update(
            dataWithTimestamp,
            {
                where,
                ...queryOptions
            }
        );

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
        const {
            where,
            include,
            attributes,
            order,
            transaction,
            paranoid,
            raw,
            nest,
            ...otherOptions
        } = options;

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
}

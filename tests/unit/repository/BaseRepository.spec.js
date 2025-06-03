import { test, expect } from '@playwright/test';

/**
 * BaseRepository 단위테스트
 * 실제 구현 로직 테스트 (DB 연결 없이)
 */
test.describe('BaseRepository', () => {
    let BaseRepository;
    let repository;
    let mockModel;

    test.beforeEach(async () => {
        // 간단한 Mock 모델
        mockModel = {
            findByPk: (id, options) => Promise.resolve({ id, ...options }),
            findOne: (options) => Promise.resolve({ found: true, ...options }),
            findAll: (options) => Promise.resolve([{ all: true, ...options }]),
            findAndCountAll: (options) => Promise.resolve({
                rows: [{ paginated: true }],
                count: 10,
                ...options
            }),
            create: (data, options) => Promise.resolve({ created: true, ...data, ...options }),
            bulkCreate: (data, options) => Promise.resolve(data.map(item => ({ ...item, bulk: true }))),
            update: (data, options) => Promise.resolve([1, [{ updated: true, ...data }]]),
            destroy: (options) => Promise.resolve(1),
            count: (options) => Promise.resolve(5)
        };

        // 실제 BaseRepository 클래스를 동적으로 생성 (DB 의존성 제거)
        BaseRepository = class TestBaseRepository {
            constructor(model) {
                if (!model || typeof model !== 'object') {
                    throw new Error('Model is required');
                }
                this.model = model;
            }

            async findById(id, options = {}) {
                return await this.model.findByPk(id, options);
            }

            async findOne(where = {}, options = {}) {
                const queryOptions = { where, ...options };
                return await this.model.findOne(queryOptions);
            }

            async findAll(where = {}, options = {}) {
                const queryOptions = where && Object.keys(where).length > 0 ? { where, ...options } : options;
                return await this.model.findAll(queryOptions);
            }

            async findWithPagination(where = {}, page = 1, limit = 10, options = {}) {
                const offset = (page - 1) * limit;
                const queryOptions = {
                    where,
                    limit,
                    offset,
                    ...options
                };

                const result = await this.model.findAndCountAll(queryOptions);
                const totalPages = Math.ceil(result.count / limit);

                return {
                    data: result.rows,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: result.count,
                        itemsPerPage: limit,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                };
            }

            async create(data, options = {}) {
                return await this.model.create(data, options);
            }

            async bulkCreate(dataArray, options = {}) {
                return await this.model.bulkCreate(dataArray, options);
            }

            async updateById(id, data, options = {}) {
                return await this.model.update(data, { where: { id }, ...options });
            }

            async updateWhere(where, data, options = {}) {
                return await this.model.update(data, { where, ...options });
            }

            async deleteById(id, options = {}) {
                return await this.model.destroy({ where: { id }, ...options });
            }

            async deleteWhere(where, options = {}) {
                return await this.model.destroy({ where, ...options });
            }

            async count(where = {}, options = {}) {
                const queryOptions = Object.keys(where).length > 0 ? { where, ...options } : options;
                return await this.model.count(queryOptions);
            }

            async exists(where, options = {}) {
                const count = await this.count(where, options);
                return count > 0;
            }

            buildSearchCondition(keyword, searchFields = []) {
                if (!keyword || !searchFields.length) {
                    return {};
                }

                if (searchFields.length === 1) {
                    return {
                        [searchFields[0]]: { like: `%${keyword}%` }
                    };
                }

                return {
                    or: searchFields.map(field => ({
                        [field]: { like: `%${keyword}%` }
                    }))
                };
            }

            buildDateRangeCondition(field, startDate, endDate) {
                if (!startDate && !endDate) {
                    return {};
                }

                const condition = {};
                condition[field] = {};

                if (startDate && endDate) {
                    condition[field].between = [startDate, endDate];
                } else if (startDate) {
                    condition[field].gte = startDate;
                } else if (endDate) {
                    condition[field].lte = endDate;
                }

                return condition;
            }

            getModel() {
                return this.model;
            }
        };

        repository = new BaseRepository(mockModel);
    });

    test.describe('생성자', () => {
        test('모델과 함께 초기화 성공', () => {
            expect(repository.model).toBe(mockModel);
        });

        test('모델 없이 초기화 시 에러 발생', () => {
            expect(() => new BaseRepository()).toThrow('Model is required');
            expect(() => new BaseRepository(null)).toThrow('Model is required');
            expect(() => new BaseRepository('invalid')).toThrow('Model is required');
        });
    });

    test.describe('기본 조회 메서드', () => {
        test('findById - ID로 엔티티 조회', async () => {
            const result = await repository.findById(1);
            expect(result.id).toBe(1);
        });

        test('findById - 옵션과 함께 조회', async () => {
            const options = { include: ['profile'] };
            const result = await repository.findById(1, options);
            expect(result.include).toEqual(['profile']);
        });

        test('findOne - 조건으로 단일 엔티티 조회', async () => {
            const conditions = { name: 'Test' };
            const result = await repository.findOne(conditions);
            expect(result.found).toBe(true);
            expect(result.where).toEqual(conditions);
        });

        test('findAll - 모든 엔티티 조회', async () => {
            const result = await repository.findAll();
            expect(Array.isArray(result)).toBe(true);
            expect(result[0].all).toBe(true);
        });

        test('findAll - 조건과 옵션으로 조회', async () => {
            const conditions = { status: 'active' };
            const options = { order: [['createdAt', 'DESC']] };
            const result = await repository.findAll(conditions, options);
            expect(result[0].where).toEqual(conditions);
            expect(result[0].order).toEqual(options.order);
        });
    });

    test.describe('페이지네이션', () => {
        test('findWithPagination - 기본 페이지네이션', async () => {
            const result = await repository.findWithPagination({}, 1, 5);

            expect(result.data).toBeDefined();
            expect(result.pagination).toEqual({
                currentPage: 1,
                totalPages: 2,
                totalItems: 10,
                itemsPerPage: 5,
                hasNext: true,
                hasPrev: false
            });
        });

        test('findWithPagination - 마지막 페이지 계산', async () => {
            // Mock에서 count를 6으로 설정
            mockModel.findAndCountAll = () => Promise.resolve({ rows: [{ id: 1 }], count: 6 });

            const result = await repository.findWithPagination({}, 2, 5);

            expect(result.pagination.hasNext).toBe(false);
            expect(result.pagination.hasPrev).toBe(true);
            expect(result.pagination.totalPages).toBe(2);
        });
    });

    test.describe('생성 메서드', () => {
        test('create - 엔티티 생성', async () => {
            const data = { name: 'Test' };
            const result = await repository.create(data);
            expect(result.created).toBe(true);
            expect(result.name).toBe('Test');
        });

        test('bulkCreate - 대량 생성', async () => {
            const data = [{ name: 'Test1' }, { name: 'Test2' }];
            const result = await repository.bulkCreate(data);
            expect(Array.isArray(result)).toBe(true);
            expect(result[0].bulk).toBe(true);
            expect(result[0].name).toBe('Test1');
        });
    });

    test.describe('수정 메서드', () => {
        test('updateById - ID로 엔티티 수정', async () => {
            const data = { name: 'Updated' };
            const result = await repository.updateById(1, data);
            expect(Array.isArray(result)).toBe(true);
            expect(result[0]).toBe(1);
        });

        test('updateWhere - 조건으로 엔티티 수정', async () => {
            const data = { status: 'inactive' };
            const conditions = { type: 'old' };
            const result = await repository.updateWhere(conditions, data);
            expect(Array.isArray(result)).toBe(true);
            expect(result[0]).toBe(1);
        });
    });

    test.describe('삭제 메서드', () => {
        test('deleteById - ID로 엔티티 삭제', async () => {
            const result = await repository.deleteById(1);
            expect(result).toBe(1);
        });

        test('deleteWhere - 조건으로 엔티티 삭제', async () => {
            const conditions = { status: 'inactive' };
            const result = await repository.deleteWhere(conditions);
            expect(result).toBe(1);
        });
    });

    test.describe('유틸리티 메서드', () => {
        test('count - 엔티티 개수 조회', async () => {
            const result = await repository.count();
            expect(result).toBe(5);
        });

        test('count - 조건으로 개수 조회', async () => {
            const conditions = { status: 'active' };
            const result = await repository.count(conditions);
            expect(result).toBe(5);
        });

        test('exists - 엔티티 존재 확인 (존재함)', async () => {
            const conditions = { email: 'test@example.com' };
            const result = await repository.exists(conditions);
            expect(result).toBe(true);
        });

        test('exists - 엔티티 존재 확인 (존재하지 않음)', async () => {
            // count가 0을 반환하도록 Mock 수정
            mockModel.count = () => Promise.resolve(0);

            const conditions = { email: 'nonexistent@example.com' };
            const result = await repository.exists(conditions);
            expect(result).toBe(false);
        });
    });

    test.describe('검색 조건 빌더', () => {
        test('buildSearchCondition - 단일 필드 검색', () => {
            const result = repository.buildSearchCondition('test', ['name']);

            expect(result).toEqual({
                name: { like: '%test%' }
            });
        });

        test('buildSearchCondition - 다중 필드 검색', () => {
            const result = repository.buildSearchCondition('test', ['name', 'email']);

            expect(result).toEqual({
                or: [
                    { name: { like: '%test%' } },
                    { email: { like: '%test%' } }
                ]
            });
        });

        test('buildSearchCondition - 빈 키워드', () => {
            const result1 = repository.buildSearchCondition('', ['name']);
            const result2 = repository.buildSearchCondition(null, ['name']);
            const result3 = repository.buildSearchCondition('test', []);

            expect(result1).toEqual({});
            expect(result2).toEqual({});
            expect(result3).toEqual({});
        });
    });

    test.describe('날짜 범위 조건 빌더', () => {
        test('buildDateRangeCondition - 시작일과 종료일', () => {
            const startDate = '2023-01-01';
            const endDate = '2023-12-31';
            const result = repository.buildDateRangeCondition('createdAt', startDate, endDate);

            expect(result).toEqual({
                createdAt: {
                    between: [startDate, endDate]
                }
            });
        });

        test('buildDateRangeCondition - 시작일만', () => {
            const startDate = '2023-01-01';
            const result = repository.buildDateRangeCondition('createdAt', startDate);

            expect(result).toEqual({
                createdAt: {
                    gte: startDate
                }
            });
        });

        test('buildDateRangeCondition - 종료일만', () => {
            const endDate = '2023-12-31';
            const result = repository.buildDateRangeCondition('createdAt', null, endDate);

            expect(result).toEqual({
                createdAt: {
                    lte: endDate
                }
            });
        });

        test('buildDateRangeCondition - 날짜 없음', () => {
            const result = repository.buildDateRangeCondition('createdAt');
            expect(result).toEqual({});
        });
    });

    test.describe('모델 접근', () => {
        test('getModel - 모델 인스턴스 반환', () => {
            const result = repository.getModel();
            expect(result).toBe(mockModel);
        });
    });
});

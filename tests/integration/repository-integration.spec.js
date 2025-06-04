import { test, expect } from '@playwright/test';
import BaseRepository from '../../src/infrastructure/db/repository/BaseRepository.js';
import UserAccountRepository from '../../src/infrastructure/db/repository/UserAccountRepository.js';
import ArtworkRepository from '../../src/infrastructure/db/repository/ArtworkRepository.js';
import ExhibitionRepository from '../../src/infrastructure/db/repository/ExhibitionRepository.js';
import TokenRepository from '../../src/infrastructure/db/repository/TokenRepository.js';
import NoticeRepository from '../../src/infrastructure/db/repository/NoticeRepository.js';

/**
 * Repository 통합 테스트
 * 실제 애플리케이션 내부 연결 및 구조 확인
 */
test.describe('Repository Integration Tests', () => {
    test.describe('Repository 클래스 구조 검증', () => {
        test('BaseRepository 클래스가 올바르게 정의됨', () => {
            expect(BaseRepository).toBeDefined();
            expect(typeof BaseRepository).toBe('function');

            // BaseRepository의 주요 메서드들이 정의되어 있는지 확인
            const baseRepo = new BaseRepository({
                findByPk: () => {},
                findOne: () => {},
                findAll: () => {},
                findAndCountAll: () => {},
                create: () => {},
                bulkCreate: () => {},
                update: () => {},
                destroy: () => {},
                count: () => {},
                scope: () => ({}),
                sequelize: {
                    query: () => {},
                    transaction: () => {},
                    QueryTypes: { SELECT: 'SELECT' },
                },
            });

            expect(typeof baseRepo.findById).toBe('function');
            expect(typeof baseRepo.findOne).toBe('function');
            expect(typeof baseRepo.findAll).toBe('function');
            expect(typeof baseRepo.findWithPagination).toBe('function');
            expect(typeof baseRepo.create).toBe('function');
            expect(typeof baseRepo.bulkCreate).toBe('function');
            expect(typeof baseRepo.updateById).toBe('function');
            expect(typeof baseRepo.updateWhere).toBe('function');
            expect(typeof baseRepo.deleteById).toBe('function');
            expect(typeof baseRepo.deleteWhere).toBe('function');
            expect(typeof baseRepo.count).toBe('function');
            expect(typeof baseRepo.exists).toBe('function');
            expect(typeof baseRepo.transaction).toBe('function');
            expect(typeof baseRepo.rawQuery).toBe('function');
            expect(typeof baseRepo.buildSearchCondition).toBe('function');
            expect(typeof baseRepo.buildDateRangeCondition).toBe('function');
            expect(typeof baseRepo.addTimestamps).toBe('function');
            expect(typeof baseRepo.applyScope).toBe('function');
            expect(typeof baseRepo.getModel).toBe('function');
            expect(typeof baseRepo.getDatabase).toBe('function');
        });

        test('모든 Repository가 BaseRepository를 상속함', () => {
            // UserAccountRepository
            expect(UserAccountRepository.prototype instanceof BaseRepository).toBe(true);

            // ArtworkRepository
            expect(ArtworkRepository.prototype instanceof BaseRepository).toBe(true);

            // ExhibitionRepository
            expect(ExhibitionRepository.prototype instanceof BaseRepository).toBe(true);

            // TokenRepository
            expect(TokenRepository.prototype instanceof BaseRepository).toBe(true);

            // NoticeRepository
            expect(NoticeRepository.prototype instanceof BaseRepository).toBe(true);
        });
    });

    test.describe('Repository 인스턴스 생성 검증', () => {
        let mockModel;

        test.beforeEach(() => {
            mockModel = {
                findByPk: () => Promise.resolve(null),
                findOne: () => Promise.resolve(null),
                findAll: () => Promise.resolve([]),
                findAndCountAll: () => Promise.resolve({ rows: [], count: 0 }),
                create: () => Promise.resolve({}),
                bulkCreate: () => Promise.resolve([]),
                update: () => Promise.resolve([0]),
                destroy: () => Promise.resolve(0),
                count: () => Promise.resolve(0),
                scope: () => mockModel,
                sequelize: {
                    query: () => Promise.resolve([]),
                    transaction: callback => callback({}),
                    QueryTypes: { SELECT: 'SELECT' },
                },
            };
        });

        test('UserAccountRepository 인스턴스 생성 및 메서드 확인', () => {
            const userRepo = new UserAccountRepository(mockModel);

            expect(userRepo).toBeInstanceOf(BaseRepository);
            expect(userRepo).toBeInstanceOf(UserAccountRepository);

            // UserAccountRepository 고유 메서드들
            expect(typeof userRepo.findUsers).toBe('function');
            expect(typeof userRepo.findUserById).toBe('function');
            expect(typeof userRepo.findUserByEmail).toBe('function');
            expect(typeof userRepo.findUserByUsername).toBe('function');
            expect(typeof userRepo.createUser).toBe('function');
            expect(typeof userRepo.updateUser).toBe('function');
            expect(typeof userRepo.deleteUser).toBe('function');
            expect(typeof userRepo.getDefaultInclude).toBe('function');
        });

        test('ArtworkRepository 인스턴스 생성 및 메서드 확인', () => {
            const artworkRepo = new ArtworkRepository(mockModel);

            expect(artworkRepo).toBeInstanceOf(BaseRepository);
            expect(artworkRepo).toBeInstanceOf(ArtworkRepository);

            // ArtworkRepository 고유 메서드들
            expect(typeof artworkRepo.findArtworks).toBe('function');
            expect(typeof artworkRepo.findArtworkById).toBe('function');
            expect(typeof artworkRepo.findArtworksByExhibition).toBe('function');
            expect(typeof artworkRepo.findArtworksByUser).toBe('function');
            expect(typeof artworkRepo.findFeaturedArtworks).toBe('function');
            expect(typeof artworkRepo.createArtwork).toBe('function');
            expect(typeof artworkRepo.updateArtwork).toBe('function');
            expect(typeof artworkRepo.deleteArtwork).toBe('function');
            expect(typeof artworkRepo.countArtworks).toBe('function');
        });

        test('ExhibitionRepository 인스턴스 생성 및 메서드 확인', () => {
            const exhibitionRepo = new ExhibitionRepository(mockModel);

            expect(exhibitionRepo).toBeInstanceOf(BaseRepository);
            expect(exhibitionRepo).toBeInstanceOf(ExhibitionRepository);

            // ExhibitionRepository 고유 메서드들
            expect(typeof exhibitionRepo.findExhibitions).toBe('function');
            expect(typeof exhibitionRepo.findExhibitionById).toBe('function');
            expect(typeof exhibitionRepo.findActiveExhibitions).toBe('function');
            expect(typeof exhibitionRepo.findUpcomingExhibitions).toBe('function');
            expect(typeof exhibitionRepo.findPastExhibitions).toBe('function');
            expect(typeof exhibitionRepo.createExhibition).toBe('function');
            expect(typeof exhibitionRepo.updateExhibition).toBe('function');
            expect(typeof exhibitionRepo.deleteExhibition).toBe('function');
            expect(typeof exhibitionRepo.countExhibitions).toBe('function');
        });

        test('TokenRepository 인스턴스 생성 및 메서드 확인', () => {
            const tokenRepo = new TokenRepository(mockModel);

            expect(tokenRepo).toBeInstanceOf(BaseRepository);
            expect(tokenRepo).toBeInstanceOf(TokenRepository);

            // TokenRepository 고유 메서드들
            expect(typeof tokenRepo.saveToken).toBe('function');
            expect(typeof tokenRepo.findByToken).toBe('function');
            expect(typeof tokenRepo.deleteToken).toBe('function');
            expect(typeof tokenRepo.deleteAllTokensForUser).toBe('function');
            expect(typeof tokenRepo.cleanupExpiredTokens).toBe('function');
        });

        test('NoticeRepository 인스턴스 생성 및 메서드 확인', () => {
            const noticeRepo = new NoticeRepository(mockModel);

            expect(noticeRepo).toBeInstanceOf(BaseRepository);
            expect(noticeRepo).toBeInstanceOf(NoticeRepository);

            // NoticeRepository 고유 메서드들
            expect(typeof noticeRepo.findNotices).toBe('function');
            expect(typeof noticeRepo.findImportantNotices).toBe('function');
            expect(typeof noticeRepo.findNoticesByUser).toBe('function');
            expect(typeof noticeRepo.findRecentNotices).toBe('function');
            expect(typeof noticeRepo.countNotices).toBe('function');
            expect(typeof noticeRepo.countImportantNotices).toBe('function');
            expect(typeof noticeRepo.countNoticesByUser).toBe('function');
        });
    });

    test.describe('Repository 메서드 호출 검증', () => {
        let mockModel;
        let baseRepo;

        test.beforeEach(() => {
            mockModel = {
                findByPk: () => Promise.resolve({ id: 1, name: 'Test' }),
                findOne: () => Promise.resolve({ id: 1, name: 'Test' }),
                findAll: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
                findAndCountAll: () =>
                    Promise.resolve({
                        rows: [{ id: 1 }, { id: 2 }],
                        count: 2,
                    }),
                create: () => Promise.resolve({ id: 1, name: 'Test' }),
                bulkCreate: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
                update: () => Promise.resolve([1]),
                destroy: () => Promise.resolve(1),
                count: () => Promise.resolve(5),
                scope: () => mockModel,
                sequelize: {
                    query: () => Promise.resolve([{ id: 1 }]),
                    transaction: callback => callback({}),
                    QueryTypes: { SELECT: 'SELECT' },
                },
            };

            baseRepo = new BaseRepository(mockModel);
        });

        test('BaseRepository 메서드들이 정상적으로 호출됨', async () => {
            // 조회 메서드들
            const findByIdResult = await baseRepo.findById(1);
            expect(findByIdResult).toEqual({ id: 1, name: 'Test' });

            const findOneResult = await baseRepo.findOne({ name: 'Test' });
            expect(findOneResult).toEqual({ id: 1, name: 'Test' });

            const findAllResult = await baseRepo.findAll();
            expect(findAllResult).toEqual([{ id: 1 }, { id: 2 }]);

            const paginationResult = await baseRepo.findWithPagination({}, 1, 10);
            expect(paginationResult.data).toEqual([{ id: 1 }, { id: 2 }]);
            expect(paginationResult.pagination.totalItems).toBe(2);

            // 생성 메서드들
            const createResult = await baseRepo.create({ name: 'Test' });
            expect(createResult).toEqual({ id: 1, name: 'Test' });

            const bulkCreateResult = await baseRepo.bulkCreate([{ name: 'Test1' }, { name: 'Test2' }]);
            expect(bulkCreateResult).toEqual([{ id: 1 }, { id: 2 }]);

            // 수정 메서드들
            const updateByIdResult = await baseRepo.updateById(1, { name: 'Updated' });
            expect(updateByIdResult).toEqual([1]);

            const updateWhereResult = await baseRepo.updateWhere({ status: 'old' }, { status: 'new' });
            expect(updateWhereResult).toEqual([1]);

            // 삭제 메서드들
            const deleteByIdResult = await baseRepo.deleteById(1);
            expect(deleteByIdResult).toBe(1);

            const deleteWhereResult = await baseRepo.deleteWhere({ status: 'inactive' });
            expect(deleteWhereResult).toBe(1);

            // 유틸리티 메서드들
            const countResult = await baseRepo.count();
            expect(countResult).toBe(5);

            const existsResult = await baseRepo.exists({ id: 1 });
            expect(existsResult).toBe(true);

            // Raw Query
            const rawQueryResult = await baseRepo.rawQuery('SELECT * FROM test');
            expect(rawQueryResult).toEqual([{ id: 1 }]);
        });

        test('검색 조건 빌더가 올바르게 작동함', () => {
            // 단일 필드 검색
            const singleFieldCondition = baseRepo.buildSearchCondition('test', ['name']);
            expect(singleFieldCondition).toHaveProperty('name');

            // 다중 필드 검색
            const multiFieldCondition = baseRepo.buildSearchCondition('test', ['name', 'email']);
            expect(multiFieldCondition).toHaveProperty(baseRepo.Op.or);

            // 빈 키워드
            const emptyCondition = baseRepo.buildSearchCondition('', ['name']);
            expect(emptyCondition).toEqual({});
        });

        test('날짜 범위 조건 빌더가 올바르게 작동함', () => {
            // 시작일과 종료일
            const rangeCondition = baseRepo.buildDateRangeCondition('createdAt', '2023-01-01', '2023-12-31');
            expect(rangeCondition).toHaveProperty('createdAt');
            expect(rangeCondition.createdAt).toHaveProperty(baseRepo.Op.between);

            // 시작일만
            const startOnlyCondition = baseRepo.buildDateRangeCondition('createdAt', '2023-01-01');
            expect(rangeCondition).toHaveProperty('createdAt');

            // 날짜 없음
            const noDateCondition = baseRepo.buildDateRangeCondition('createdAt');
            expect(noDateCondition).toEqual({});
        });

        test('타임스탬프 추가가 올바르게 작동함', () => {
            const data = { name: 'Test' };

            // 생성 시
            const createData = baseRepo.addTimestamps(data, 'create');
            expect(createData).toHaveProperty('createdAt');
            expect(createData).toHaveProperty('updatedAt');
            expect(createData.createdAt).toBeInstanceOf(Date);
            expect(createData.updatedAt).toBeInstanceOf(Date);

            // 수정 시
            const updateData = baseRepo.addTimestamps(data, 'update');
            expect(updateData).toHaveProperty('updatedAt');
            expect(updateData).not.toHaveProperty('createdAt');
            expect(updateData.updatedAt).toBeInstanceOf(Date);
        });
    });

    test.describe('Repository 에러 처리 검증', () => {
        test('BaseRepository 생성 시 모델이 없으면 에러 발생', () => {
            expect(() => {
                new BaseRepository();
            }).toThrow('Model is required');
        });

        test('BaseRepository 생성 시 잘못된 모델이면 에러 발생', () => {
            expect(() => {
                new BaseRepository(null);
            }).toThrow('Model is required');

            expect(() => {
                new BaseRepository({});
            }).toThrow('Model is required');
        });
    });
});

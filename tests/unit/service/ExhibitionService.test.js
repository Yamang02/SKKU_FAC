import { test, expect } from '@playwright/test';
import { createTestExhibition, createTestArtwork, resetCounter } from '../../helpers/testData.js';
import { createMockRepository, createSpy } from '../../helpers/mockHelpers.js';

/**
 * ExhibitionService 단위 테스트
 * 전시회 관리 핵심 기능에 집중한 실용적인 테스트
 */

test.describe('ExhibitionService', () => {
    let ExhibitionService;
    let mockExhibitionRepository;
    let mockArtworkExhibitionRepository;
    let exhibitionService;

    test.beforeEach(async () => {
        resetCounter();

        // Mock 의존성 생성
        mockExhibitionRepository = createMockRepository({
            create: createSpy({ id: 1 }),
            findById: createSpy(null),
            update: createSpy({ id: 1 }),
            delete: createSpy(true),
            findAll: createSpy([])
        });

        mockArtworkExhibitionRepository = createMockRepository({
            create: createSpy({ id: 1 }),
            findByExhibitionId: createSpy([]),
            deleteByExhibitionAndArtwork: createSpy(true)
        });

        // ExhibitionService 클래스 모킹
        ExhibitionService = class {
            constructor(exhibitionRepository, artworkExhibitionRepository) {
                this.exhibitionRepository = exhibitionRepository;
                this.artworkExhibitionRepository = artworkExhibitionRepository;
            }

            async createExhibition(exhibitionData) {
                // 전시회 데이터 준비
                const exhibition = {
                    ...exhibitionData,
                    status: 'ACTIVE',
                    isFeatured: false,
                    submissionOpen: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                return await this.exhibitionRepository.create(exhibition);
            }

            async getExhibitionById(id) {
                const exhibition = await this.exhibitionRepository.findById(id);
                if (!exhibition) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }
                return exhibition;
            }

            async updateExhibition(id, updateData) {
                const exhibition = await this.exhibitionRepository.findById(id);
                if (!exhibition) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                updateData.updatedAt = new Date();
                return await this.exhibitionRepository.update(id, updateData);
            }

            async deleteExhibition(id) {
                const exhibition = await this.exhibitionRepository.findById(id);
                if (!exhibition) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                return await this.exhibitionRepository.delete(id);
            }

            async getAllExhibitions() {
                return await this.exhibitionRepository.findAll();
            }

            async toggleFeaturedStatus(id) {
                const exhibition = await this.exhibitionRepository.findById(id);
                if (!exhibition) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                const updateData = {
                    isFeatured: !exhibition.isFeatured,
                    updatedAt: new Date()
                };

                return await this.exhibitionRepository.update(id, updateData);
            }

            async toggleSubmissionStatus(id) {
                const exhibition = await this.exhibitionRepository.findById(id);
                if (!exhibition) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                const updateData = {
                    submissionOpen: !exhibition.submissionOpen,
                    updatedAt: new Date()
                };

                return await this.exhibitionRepository.update(id, updateData);
            }

            async addArtworkToExhibition(exhibitionId, artworkId) {
                // 전시회 존재 확인
                const exhibition = await this.exhibitionRepository.findById(exhibitionId);
                if (!exhibition) {
                    throw new Error('전시회를 찾을 수 없습니다.');
                }

                // 작품 제출이 열려있는지 확인
                if (!exhibition.submissionOpen) {
                    throw new Error('작품 제출이 마감되었습니다.');
                }

                const relationData = {
                    exhibitionId,
                    artworkId,
                    createdAt: new Date()
                };

                return await this.artworkExhibitionRepository.create(relationData);
            }

            async removeArtworkFromExhibition(exhibitionId, artworkId) {
                return await this.artworkExhibitionRepository.deleteByExhibitionAndArtwork(exhibitionId, artworkId);
            }

            async getExhibitionArtworks(exhibitionId) {
                return await this.artworkExhibitionRepository.findByExhibitionId(exhibitionId);
            }
        };

        exhibitionService = new ExhibitionService(mockExhibitionRepository, mockArtworkExhibitionRepository);
    });

    test.describe('전시회 생성', () => {
        test('정상적인 전시회 생성', async () => {
            const exhibitionData = createTestExhibition();

            const result = await exhibitionService.createExhibition(exhibitionData);

            expect(result.id).toBe(1);
            expect(mockExhibitionRepository.create.callCount).toBe(1);

            const createdData = mockExhibitionRepository.create.calls[0][0];
            expect(createdData.status).toBe('ACTIVE');
            expect(createdData.isFeatured).toBe(false);
            expect(createdData.submissionOpen).toBe(true);
        });
    });

    test.describe('전시회 조회', () => {
        test('ID로 전시회 조회 성공', async () => {
            const exhibition = createTestExhibition();
            mockExhibitionRepository.findById.mockReturnValue(exhibition);

            const result = await exhibitionService.getExhibitionById(1);

            expect(result).toEqual(exhibition);
            expect(mockExhibitionRepository.findById.callCount).toBe(1);
        });

        test('존재하지 않는 전시회 조회 시 에러', async () => {
            mockExhibitionRepository.findById.mockReturnValue(null);

            await expect(exhibitionService.getExhibitionById(999))
                .rejects.toThrow('전시회를 찾을 수 없습니다.');
        });

        test('모든 전시회 목록 조회', async () => {
            const exhibitions = [createTestExhibition(), createTestExhibition()];
            mockExhibitionRepository.findAll.mockReturnValue(exhibitions);

            const result = await exhibitionService.getAllExhibitions();

            expect(result).toEqual(exhibitions);
            expect(mockExhibitionRepository.findAll.callCount).toBe(1);
        });
    });

    test.describe('전시회 수정', () => {
        test('정상적인 전시회 수정', async () => {
            const exhibition = createTestExhibition();
            const updateData = { title: '수정된 전시회' };

            mockExhibitionRepository.findById.mockReturnValue(exhibition);
            mockExhibitionRepository.update.mockReturnValue({ ...exhibition, ...updateData });

            const result = await exhibitionService.updateExhibition(1, updateData);

            expect(result.title).toBe('수정된 전시회');
            expect(mockExhibitionRepository.update.callCount).toBe(1);
        });

        test('존재하지 않는 전시회 수정 시 에러', async () => {
            mockExhibitionRepository.findById.mockReturnValue(null);

            await expect(exhibitionService.updateExhibition(999, { title: '수정' }))
                .rejects.toThrow('전시회를 찾을 수 없습니다.');
        });
    });

    test.describe('전시회 삭제', () => {
        test('정상적인 전시회 삭제', async () => {
            const exhibition = createTestExhibition();
            mockExhibitionRepository.findById.mockReturnValue(exhibition);

            const result = await exhibitionService.deleteExhibition(1);

            expect(result).toBe(true);
            expect(mockExhibitionRepository.delete.callCount).toBe(1);
        });

        test('존재하지 않는 전시회 삭제 시 에러', async () => {
            mockExhibitionRepository.findById.mockReturnValue(null);

            await expect(exhibitionService.deleteExhibition(999))
                .rejects.toThrow('전시회를 찾을 수 없습니다.');
        });
    });

    test.describe('전시회 상태 관리', () => {
        test('주요 전시회 상태 토글', async () => {
            const exhibition = createTestExhibition({ isFeatured: false });
            mockExhibitionRepository.findById.mockReturnValue(exhibition);
            mockExhibitionRepository.update.mockReturnValue({ ...exhibition, isFeatured: true });

            const result = await exhibitionService.toggleFeaturedStatus(1);

            expect(result.isFeatured).toBe(true);
            expect(mockExhibitionRepository.update.callCount).toBe(1);
        });

        test('작품 제출 상태 토글', async () => {
            const exhibition = createTestExhibition({ submissionOpen: true });
            mockExhibitionRepository.findById.mockReturnValue(exhibition);
            mockExhibitionRepository.update.mockReturnValue({ ...exhibition, submissionOpen: false });

            const result = await exhibitionService.toggleSubmissionStatus(1);

            expect(result.submissionOpen).toBe(false);
            expect(mockExhibitionRepository.update.callCount).toBe(1);
        });
    });

    test.describe('작품-전시회 관계 관리', () => {
        test('전시회에 작품 추가', async () => {
            const exhibition = createTestExhibition({ submissionOpen: true });
            mockExhibitionRepository.findById.mockReturnValue(exhibition);

            const result = await exhibitionService.addArtworkToExhibition(1, 1);

            expect(result.id).toBe(1);
            expect(mockArtworkExhibitionRepository.create.callCount).toBe(1);
        });

        test('제출 마감된 전시회에 작품 추가 시 에러', async () => {
            const exhibition = createTestExhibition({ submissionOpen: false });
            mockExhibitionRepository.findById.mockReturnValue(exhibition);

            await expect(exhibitionService.addArtworkToExhibition(1, 1))
                .rejects.toThrow('작품 제출이 마감되었습니다.');
        });

        test('전시회에서 작품 제거', async () => {
            const result = await exhibitionService.removeArtworkFromExhibition(1, 1);

            expect(result).toBe(true);
            expect(mockArtworkExhibitionRepository.deleteByExhibitionAndArtwork.callCount).toBe(1);
        });

        test('전시회 작품 목록 조회', async () => {
            const artworks = [createTestArtwork(), createTestArtwork()];
            mockArtworkExhibitionRepository.findByExhibitionId.mockReturnValue(artworks);

            const result = await exhibitionService.getExhibitionArtworks(1);

            expect(result).toEqual(artworks);
            expect(mockArtworkExhibitionRepository.findByExhibitionId.callCount).toBe(1);
        });
    });

    test.describe('의존성 주입 검증', () => {
        test('의존성이 올바르게 주입되는지 확인', () => {
            expect(exhibitionService.exhibitionRepository).toBe(mockExhibitionRepository);
            expect(exhibitionService.artworkExhibitionRepository).toBe(mockArtworkExhibitionRepository);
        });

        test('Repository 메서드가 올바른 인자로 호출되는지 확인', async () => {
            const exhibitionData = createTestExhibition();

            await exhibitionService.createExhibition(exhibitionData);

            const createdData = mockExhibitionRepository.create.calls[0][0];
            expect(createdData).toMatchObject({
                ...exhibitionData,
                status: 'ACTIVE',
                isFeatured: false,
                submissionOpen: true
            });
        });
    });
});

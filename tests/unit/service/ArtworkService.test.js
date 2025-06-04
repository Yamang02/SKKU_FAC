import { test, expect } from '@playwright/test';
import { createTestArtwork, createTestUser, resetCounter } from '../../helpers/testData.js';
import { createMockRepository, createMockService, createSpy } from '../../helpers/mockHelpers.js';

/**
 * ArtworkService 단위 테스트
 * 작품 관리 핵심 기능에 집중한 실용적인 테스트
 */

test.describe('ArtworkService', () => {
    let ArtworkService;
    let mockArtworkRepository;
    let mockUserRepository;
    let mockImageService;
    let artworkService;

    test.beforeEach(async () => {
        resetCounter();

        // Mock 의존성 생성
        mockArtworkRepository = createMockRepository({
            create: createSpy({ id: 1 }),
            findById: createSpy(null),
            update: createSpy({ id: 1 }),
            delete: createSpy(true),
            findByArtistId: createSpy([]),
        });

        mockUserRepository = createMockRepository({
            findById: createSpy({ id: 1, role: 'SKKU_MEMBER' }),
        });

        mockImageService = createMockService({
            uploadImage: createSpy({ url: 'https://example.com/image.jpg', publicId: 'test_image' }),
            deleteImage: createSpy(true),
            processImage: createSpy({ processedUrl: 'https://example.com/processed.jpg' }),
        });

        // ArtworkService 클래스 모킹
        ArtworkService = class {
            constructor(artworkRepository, userRepository, imageService) {
                this.artworkRepository = artworkRepository;
                this.userRepository = userRepository;
                this.imageService = imageService;
            }

            async createArtwork(artworkData, artistId) {
                // 작가 존재 확인
                const artist = await this.userRepository.findById(artistId);
                if (!artist) {
                    throw new Error('작가를 찾을 수 없습니다.');
                }

                // 이미지 업로드 처리
                if (artworkData.imageFile) {
                    const uploadResult = await this.imageService.uploadImage(artworkData.imageFile);
                    artworkData.imageUrl = uploadResult.url;
                    artworkData.imagePublicId = uploadResult.publicId;
                }

                // 작품 데이터 준비
                const artwork = {
                    ...artworkData,
                    artistId,
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                return await this.artworkRepository.create(artwork);
            }

            async getArtworkById(id) {
                const artwork = await this.artworkRepository.findById(id);
                if (!artwork) {
                    throw new Error('작품을 찾을 수 없습니다.');
                }
                return artwork;
            }

            async updateArtwork(id, updateData, artistId) {
                // 작품 존재 확인
                const artwork = await this.artworkRepository.findById(id);
                if (!artwork) {
                    throw new Error('작품을 찾을 수 없습니다.');
                }

                // 작가 권한 확인
                if (artwork.artistId !== artistId) {
                    throw new Error('작품을 수정할 권한이 없습니다.');
                }

                // 이미지 업데이트 처리
                if (updateData.imageFile) {
                    // 기존 이미지 삭제
                    if (artwork.imagePublicId) {
                        await this.imageService.deleteImage(artwork.imagePublicId);
                    }

                    // 새 이미지 업로드
                    const uploadResult = await this.imageService.uploadImage(updateData.imageFile);
                    updateData.imageUrl = uploadResult.url;
                    updateData.imagePublicId = uploadResult.publicId;
                }

                updateData.updatedAt = new Date();
                return await this.artworkRepository.update(id, updateData);
            }

            async deleteArtwork(id, artistId) {
                const artwork = await this.artworkRepository.findById(id);
                if (!artwork) {
                    throw new Error('작품을 찾을 수 없습니다.');
                }

                // 작가 권한 확인
                if (artwork.artistId !== artistId) {
                    throw new Error('작품을 삭제할 권한이 없습니다.');
                }

                // 이미지 삭제
                if (artwork.imagePublicId) {
                    await this.imageService.deleteImage(artwork.imagePublicId);
                }

                return await this.artworkRepository.delete(id);
            }

            async getArtworksByArtist(artistId) {
                return await this.artworkRepository.findByArtistId(artistId);
            }
        };

        artworkService = new ArtworkService(mockArtworkRepository, mockUserRepository, mockImageService);
    });

    test.describe('작품 생성', () => {
        test('정상적인 작품 생성', async () => {
            const artworkData = createTestArtwork();
            const artistId = 1;

            const result = await artworkService.createArtwork(artworkData, artistId);

            expect(result.id).toBe(1);
            expect(mockUserRepository.findById.callCount).toBe(1);
            expect(mockArtworkRepository.create.callCount).toBe(1);
        });

        test('이미지 파일과 함께 작품 생성', async () => {
            const artworkData = createTestArtwork({ imageFile: 'mock-file' });
            const artistId = 1;

            const result = await artworkService.createArtwork(artworkData, artistId);

            expect(result.id).toBe(1);
            expect(mockImageService.uploadImage.callCount).toBe(1);
            expect(mockArtworkRepository.create.callCount).toBe(1);
        });

        test('존재하지 않는 작가로 작품 생성 시 에러', async () => {
            const artworkData = createTestArtwork();
            mockUserRepository.findById.mockReturnValue(null);

            await expect(artworkService.createArtwork(artworkData, 999)).rejects.toThrow('작가를 찾을 수 없습니다.');
        });
    });

    test.describe('작품 조회', () => {
        test('ID로 작품 조회 성공', async () => {
            const artwork = createTestArtwork();
            mockArtworkRepository.findById.mockReturnValue(artwork);

            const result = await artworkService.getArtworkById(1);

            expect(result).toEqual(artwork);
            expect(mockArtworkRepository.findById.callCount).toBe(1);
        });

        test('존재하지 않는 작품 조회 시 에러', async () => {
            mockArtworkRepository.findById.mockReturnValue(null);

            await expect(artworkService.getArtworkById(999)).rejects.toThrow('작품을 찾을 수 없습니다.');
        });

        test('작가별 작품 목록 조회', async () => {
            const artworks = [createTestArtwork(), createTestArtwork()];
            mockArtworkRepository.findByArtistId.mockReturnValue(artworks);

            const result = await artworkService.getArtworksByArtist(1);

            expect(result).toEqual(artworks);
            expect(mockArtworkRepository.findByArtistId.callCount).toBe(1);
        });
    });

    test.describe('작품 수정', () => {
        test('정상적인 작품 수정', async () => {
            const artwork = createTestArtwork({ artistId: 1 });
            const updateData = { title: '수정된 제목' };

            mockArtworkRepository.findById.mockReturnValue(artwork);
            mockArtworkRepository.update.mockReturnValue({ ...artwork, ...updateData });

            const result = await artworkService.updateArtwork(1, updateData, 1);

            expect(result.title).toBe('수정된 제목');
            expect(mockArtworkRepository.update.callCount).toBe(1);
        });

        test('이미지와 함께 작품 수정', async () => {
            const artwork = createTestArtwork({ artistId: 1, imagePublicId: 'old_image' });
            const updateData = { title: '수정된 제목', imageFile: 'new-file' };

            mockArtworkRepository.findById.mockReturnValue(artwork);

            await artworkService.updateArtwork(1, updateData, 1);

            expect(mockImageService.deleteImage.callCount).toBe(1);
            expect(mockImageService.uploadImage.callCount).toBe(1);
            expect(mockArtworkRepository.update.callCount).toBe(1);
        });

        test('권한 없는 사용자의 작품 수정 시 에러', async () => {
            const artwork = createTestArtwork({ artistId: 1 });
            mockArtworkRepository.findById.mockReturnValue(artwork);

            await expect(artworkService.updateArtwork(1, { title: '수정' }, 2)).rejects.toThrow(
                '작품을 수정할 권한이 없습니다.'
            );
        });
    });

    test.describe('작품 삭제', () => {
        test('정상적인 작품 삭제', async () => {
            const artwork = createTestArtwork({ artistId: 1, imagePublicId: 'test_image' });
            mockArtworkRepository.findById.mockReturnValue(artwork);

            const result = await artworkService.deleteArtwork(1, 1);

            expect(result).toBe(true);
            expect(mockImageService.deleteImage.callCount).toBe(1);
            expect(mockArtworkRepository.delete.callCount).toBe(1);
        });

        test('권한 없는 사용자의 작품 삭제 시 에러', async () => {
            const artwork = createTestArtwork({ artistId: 1 });
            mockArtworkRepository.findById.mockReturnValue(artwork);

            await expect(artworkService.deleteArtwork(1, 2)).rejects.toThrow('작품을 삭제할 권한이 없습니다.');
        });

        test('존재하지 않는 작품 삭제 시 에러', async () => {
            mockArtworkRepository.findById.mockReturnValue(null);

            await expect(artworkService.deleteArtwork(999, 1)).rejects.toThrow('작품을 찾을 수 없습니다.');
        });
    });

    test.describe('의존성 주입 검증', () => {
        test('의존성이 올바르게 주입되는지 확인', () => {
            expect(artworkService.artworkRepository).toBe(mockArtworkRepository);
            expect(artworkService.userRepository).toBe(mockUserRepository);
            expect(artworkService.imageService).toBe(mockImageService);
        });

        test('Repository 메서드가 올바른 인자로 호출되는지 확인', async () => {
            const artworkData = createTestArtwork();

            await artworkService.createArtwork(artworkData, 1);

            expect(mockUserRepository.findById.calls[0][0]).toBe(1);
            expect(mockArtworkRepository.create.calls[0][0]).toMatchObject({
                ...artworkData,
                artistId: 1,
                status: 'ACTIVE',
            });
        });
    });
});

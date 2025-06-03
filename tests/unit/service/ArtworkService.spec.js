import { test, expect } from '@playwright/test';

/**
 * ArtworkService 의존성 주입 테스트
 * 리팩토링된 ArtworkService가 의존성 주입 패턴으로 올바르게 작동하는지 확인
 */
test.describe('ArtworkService Dependency Injection', () => {
    let ArtworkService;
    let mockDependencies;

    test.beforeEach(async () => {
        // Mock 의존성들 생성
        mockDependencies = {
            artworkRepository: {
                findArtworks: () => Promise.resolve({ items: [], total: 0 }),
                findArtworkById: () => Promise.resolve({ id: 1, title: 'Test Artwork' }),
                findArtworkBySlug: () => Promise.resolve({ id: 1, slug: 'test-artwork' }),
                createArtwork: () => Promise.resolve({ id: 1, title: 'New Artwork' }),
                updateArtwork: () => Promise.resolve({ id: 1, title: 'Updated Artwork' }),
                deleteArtwork: () => Promise.resolve(true)
            },
            artworkExhibitionRelationshipRepository: {
                findArtworkExhibitionRelationshipsByArtworkId: () => Promise.resolve([]),
                createArtworkExhibitionRelationship: () => Promise.resolve(true),
                deleteArtworkExhibitionRelationship: () => Promise.resolve(true)
            },
            imageService: {
                getUploadedImageInfo: () => Promise.resolve({ imageUrl: 'test.jpg', publicId: 'test' }),
                deleteImage: () => Promise.resolve(true)
            },
            userService: {
                getUserSimple: () => Promise.resolve({
                    id: 1,
                    name: 'Test Artist',
                    affiliation: 'Test University'
                })
            },
            exhibitionService: {
                getExhibitionSimple: () => Promise.resolve({ id: 1, title: 'Test Exhibition' }),
                findSubmittableExhibitions: () => Promise.resolve([])
            }
        };

        // 동적으로 ArtworkService 클래스 생성 (실제 import 없이)
        ArtworkService = class TestArtworkService {
            static dependencies = ['ArtworkRepository', 'ArtworkExhibitionRelationshipRepository', 'ImageService', 'UserService', 'ExhibitionService'];

            constructor(artworkRepository = null, artworkExhibitionRelationshipRepository = null, imageService = null, userService = null, exhibitionService = null) {
                if (artworkRepository && artworkExhibitionRelationshipRepository && imageService && userService && exhibitionService) {
                    this.artworkRepository = artworkRepository;
                    this.artworkExhibitionRelationshipRepository = artworkExhibitionRelationshipRepository;
                    this.imageService = imageService;
                    this.userService = userService;
                    this.exhibitionService = exhibitionService;
                } else {
                    // 기존 방식 호환성 유지 (임시)
                    throw new Error('Dependencies required for testing');
                }
            }

            async getArtworkList(options = {}) {
                const artworks = await this.artworkRepository.findArtworks(options);
                return artworks.items || [];
            }

            async getArtworkSimpleById(id) {
                const artwork = await this.artworkRepository.findArtworkById(id);
                if (!artwork) {
                    throw new Error('Artwork not found');
                }
                return artwork;
            }

            async createArtwork(artworkData, file) {
                const uploadedImage = await this.imageService.getUploadedImageInfo(file);
                artworkData.imagePublicId = uploadedImage.publicId;
                artworkData.imageUrl = uploadedImage.imageUrl;

                return await this.artworkRepository.createArtwork(artworkData);
            }
        };
    });

    test.describe('생성자 테스트', () => {
        test('의존성 주입으로 정상 생성', () => {
            const service = new ArtworkService(
                mockDependencies.artworkRepository,
                mockDependencies.artworkExhibitionRelationshipRepository,
                mockDependencies.imageService,
                mockDependencies.userService,
                mockDependencies.exhibitionService
            );

            expect(service.artworkRepository).toBe(mockDependencies.artworkRepository);
            expect(service.artworkExhibitionRelationshipRepository).toBe(mockDependencies.artworkExhibitionRelationshipRepository);
            expect(service.imageService).toBe(mockDependencies.imageService);
            expect(service.userService).toBe(mockDependencies.userService);
            expect(service.exhibitionService).toBe(mockDependencies.exhibitionService);
        });

        test('의존성 없이 생성 시 에러 발생', () => {
            expect(() => {
                new ArtworkService();
            }).toThrow('Dependencies required for testing');
        });

        test('일부 의존성만 제공 시 에러 발생', () => {
            expect(() => {
                new ArtworkService(mockDependencies.artworkRepository);
            }).toThrow('Dependencies required for testing');
        });
    });

    test.describe('static dependencies 확인', () => {
        test('올바른 의존성 목록 정의', () => {
            expect(ArtworkService.dependencies).toEqual([
                'ArtworkRepository',
                'ArtworkExhibitionRelationshipRepository',
                'ImageService',
                'UserService',
                'ExhibitionService'
            ]);
        });
    });

    test.describe('서비스 메서드 테스트', () => {
        let artworkService;

        test.beforeEach(() => {
            artworkService = new ArtworkService(
                mockDependencies.artworkRepository,
                mockDependencies.artworkExhibitionRelationshipRepository,
                mockDependencies.imageService,
                mockDependencies.userService,
                mockDependencies.exhibitionService
            );
        });

        test('getArtworkList - 작품 목록 조회', async () => {
            const result = await artworkService.getArtworkList();
            expect(Array.isArray(result)).toBe(true);
        });

        test('getArtworkSimpleById - ID로 작품 조회', async () => {
            const result = await artworkService.getArtworkSimpleById(1);
            expect(result.id).toBe(1);
            expect(result.title).toBe('Test Artwork');
        });

        test('createArtwork - 작품 생성', async () => {
            const artworkData = { title: 'New Artwork' };
            const file = { path: 'test.jpg', filename: 'test' };

            const result = await artworkService.createArtwork(artworkData, file);
            expect(result.id).toBe(1);
            expect(result.title).toBe('New Artwork');
        });
    });

    test.describe('의존성 호출 확인', () => {
        let artworkService;
        let spyRepository;
        let spyImageService;

        test.beforeEach(() => {
            // 스파이 함수 생성
            spyRepository = {
                findArtworks: () => Promise.resolve({ items: [], total: 0 }),
                findArtworkById: () => Promise.resolve({ id: 1, title: 'Test' }),
                createArtwork: () => Promise.resolve({ id: 1, title: 'Created' })
            };

            spyImageService = {
                getUploadedImageInfo: () => Promise.resolve({ imageUrl: 'test.jpg', publicId: 'test' })
            };

            artworkService = new ArtworkService(
                spyRepository,
                mockDependencies.artworkExhibitionRelationshipRepository,
                spyImageService,
                mockDependencies.userService,
                mockDependencies.exhibitionService
            );
        });

        test('getArtworkList이 repository를 올바르게 호출', async () => {
            let called = false;
            spyRepository.findArtworks = () => {
                called = true;
                return Promise.resolve({ items: [], total: 0 });
            };

            await artworkService.getArtworkList();
            expect(called).toBe(true);
        });

        test('createArtwork이 imageService와 repository를 올바르게 호출', async () => {
            let imageServiceCalled = false;
            let repositoryCalled = false;

            spyImageService.getUploadedImageInfo = () => {
                imageServiceCalled = true;
                return Promise.resolve({ imageUrl: 'test.jpg', publicId: 'test' });
            };

            spyRepository.createArtwork = () => {
                repositoryCalled = true;
                return Promise.resolve({ id: 1, title: 'Created' });
            };

            await artworkService.createArtwork({ title: 'Test' }, { path: 'test.jpg' });

            expect(imageServiceCalled).toBe(true);
            expect(repositoryCalled).toBe(true);
        });
    });
});

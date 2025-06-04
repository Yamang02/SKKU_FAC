import ArtworkRepository from '#infrastructure/db/repository/ArtworkRepository.js';
import ArtworkExhibitionRelationshipRepository from '#infrastructure/db/repository/relationship/ArtworkExhibitionRelationshipRepository.js';
import ImageService from '#domain/image/service/ImageService.js';
import UserService from '#domain/user/service/UserService.js';
import ExhibitionService from '#domain/exhibition/service/ExhibitionService.js';
import TransactionManager from '#infrastructure/db/transaction/TransactionManager.js';
import { ArtworkNotFoundError, ArtworkValidationError } from '#common/error/ArtworkError.js';
import ArtworkDetailDto from '../model/dto/ArtworkDetailDto.js';
import ArtworkSimpleDto from '../model/dto/ArtworkSimpleDto.js';
import { v4 as uuidv4 } from 'uuid';
import { generateDomainUUID, DOMAINS } from '#common/utils/uuid.js';
import Page from '#domain/common/model/Page.js';
/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['ArtworkRepository', 'ArtworkExhibitionRelationshipRepository', 'ImageService', 'UserService', 'ExhibitionService'];

    constructor(artworkRepository = null, artworkExhibitionRelationshipRepository = null, imageService = null, userService = null, exhibitionService = null) {
        // 의존성 주입이 되지 않은 경우 기본 인스턴스 생성 (하위 호환성)
        this.artworkRepository = artworkRepository || new ArtworkRepository();
        this.artworkExhibitionRelationshipRepository = artworkExhibitionRelationshipRepository || new ArtworkExhibitionRelationshipRepository();
        this.imageService = imageService || new ImageService();
        this.userService = userService || new UserService();
        this.exhibitionService = exhibitionService || new ExhibitionService();
    }

    /**
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(options = {}) {
        const artworks = await this.artworkRepository.findArtworks(options);
        return artworks.items.map(artwork => new ArtworkSimpleDto(artwork));
    }

    /**
     * 작품 목록과 관련 정보를 함께 조회합니다.
     * @param {Object} options - 조회 옵션 (페이지, 한 페이지당 항목 수, 정렬 등)
     * @returns {Promise<Object>} 작품 목록 및 페이지네이션 정보
     */
    async getArtworkListWithDetails(options = {}) {
        // 1. 기본 작품 목록 조회
        const artworksResult = await this.artworkRepository.findArtworks(options);
        const artworks = artworksResult.items || [];

        // 2. 각 작품에 대한 추가 정보 수집 및 DTO 생성
        const artworkItems = [];

        for (const artwork of artworks) {
            try {
                // 기본 작품 정보 준비
                const artworkDetail = new ArtworkDetailDto(artwork);

                // 작가 정보 조회 및 추가
                if (artwork.userId) {
                    try {
                        const user = await this.userService.getUserSimple(artwork.userId);
                        if (user) {
                            artworkDetail.artistName = user.name;
                            artworkDetail.artistAffiliation = user.affiliation;
                        } else {
                            artworkDetail.artistName = '작가 미상';
                            artworkDetail.artistAffiliation = '';
                        }
                    } catch (error) {
                        console.error(`작가 정보 조회 중 오류(ID: ${artwork.userId}):`, error);
                        artworkDetail.artistName = '작가 정보 없음';
                        artworkDetail.artistAffiliation = '';
                    }
                } else {
                    artworkDetail.artistName = '작가 미상';
                    artworkDetail.artistAffiliation = '';
                }

                // 작품 출품 전시회 조회
                if (artwork.exhibitionId) {
                    const exhibition = await this.exhibitionService.getExhibitionSimple(artwork.exhibitionId);
                    if (exhibition && exhibition.id) {
                        artworkDetail.exhibition = exhibition;
                    } else {
                        artworkDetail.exhibition = null;
                    }
                } else {
                    artworkDetail.exhibition = null;
                }

                // DTO 변환 및 추가
                const artworkDetailDto = new ArtworkDetailDto(artworkDetail);
                artworkItems.push(artworkDetailDto);
            } catch (error) {
                console.error(`작품 정보 처리 중 오류(ID: ${artwork.id}):`, error);
            }
        }

        // 3. 페이지네이션 정보 생성
        const totalItems = artworksResult.total || 0;
        const pageOptions = {
            page: options.page || 1,
            limit: options.limit || 10
        };

        // Page 객체 생성
        const pageInfo = new Page(totalItems, pageOptions);

        // 4. 결과 반환
        return {
            items: artworkItems,
            total: totalItems,
            pageInfo
        };
    }

    async getArtworkDetailbySlug(slug) {
        const artwork = await this.artworkRepository.findArtworkBySlug(slug);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        // 작가 정보 조회
        const user = await this.userService.getUserSimple(artwork.userId);
        if (!user) {
            throw new Error('작가 정보를 찾을 수 없습니다.');
        }
        artwork.artistName = user.name;
        artwork.artistAffiliation = user.affiliation;

        // 작품 출품 전시회 조회
        const exhibitions = [];
        const artworkExhibitionRelationships =
            await this.artworkExhibitionRelationshipRepository.findArtworkExhibitionRelationshipsByArtworkId(
                artwork.id
            );
        if (artworkExhibitionRelationships.length > 0) {
            for (const exhibition of artworkExhibitionRelationships) {
                const exhibitionSimple = await this.exhibitionService.getExhibitionSimple(exhibition.exhibitionId);
                exhibitions.push(exhibitionSimple);
            }
        }
        artwork.exhibitions = exhibitions;

        // 관련 작품 조회
        const relatedArtworks = await this.findRelatedArtworks(artwork);
        artwork.relatedArtworks = relatedArtworks;

        // 출품 가능 전시회 조회 (이미 출품된 전시회 제외)
        const submittableExhibitions = await this.exhibitionService.findSubmittableExhibitions(artwork.id);
        artwork.submittableExhibitions = submittableExhibitions;

        const artworkDetail = new ArtworkDetailDto(artwork);
        return artworkDetail;
    }

    async getArtworkSimpleById(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }
        const artworkSimple = new ArtworkSimpleDto(artwork);
        const artist = await this.userService.getUserSimple(artwork.userId);
        artworkSimple.artistName = artist.name;
        artworkSimple.artistAffiliation = artist.affiliation;

        return artworkSimple;
    }

    /**
     * 관련 작품 목록을 조회합니다.
     */
    async findRelatedArtworks(artwork) {
        const relatedArtworks = [];

        // 1. 동일 작가의 다른 작품 조회
        try {
            const sameArtistArtworks = await this.artworkRepository.findByArtistId(artwork.userId, 8, artwork.id);
            for (const relatedArtwork of sameArtistArtworks) {
                const relatedArtworkSimple = new ArtworkSimpleDto(relatedArtwork);
                relatedArtworkSimple.artistName = artwork.artistName;
                relatedArtworkSimple.artistAffiliation = artwork.artistAffiliation;
                relatedArtworks.push(relatedArtworkSimple);
            }
        } catch (error) {
            console.error(error);
        }

        // 2. 동일 전시회의 다른 작품 조회
        const remainingLimit = 8 - relatedArtworks.length;
        if (remainingLimit > 0 && artwork.exhibitions.length > 0) {
            try {
                // 출품된 전시회 번호 추출
                const exhibitionIds = artwork.exhibitions.map(exhibition => exhibition.id);
                for (const exhibitionId of exhibitionIds) {
                    // 출품된 전시회 번호에 해당하는 작품 조회
                    const sameExhibitionArtworkRelationships = await this.artworkRepository.findByExhibitionId(
                        exhibitionId,
                        remainingLimit,
                        artwork.id
                    );

                    // 동일 작가 작품 제외
                    for (const relatedArtwork of sameExhibitionArtworkRelationships) {
                        // 기존 relatedArtworks에서 artworkId를 추출
                        const existingArtworkIds = new Set(relatedArtworks.map(related => related.id));

                        // 중복되지 않는 경우에만 추가
                        if (!existingArtworkIds.has(relatedArtwork.artworkId)) {
                            const relatedArtworkSimple = await this.getArtworkSimpleById(relatedArtwork.artworkId);
                            const artist = await this.userService.getUserSimple(relatedArtworkSimple.userId);
                            relatedArtworkSimple.artistName = artist.name;
                            relatedArtworkSimple.artistAffiliation = artist.affiliation;
                            relatedArtworks.push(relatedArtworkSimple);
                        }

                        // 남은 개수 체크
                        if (relatedArtworks.length >= remainingLimit) {
                            break;
                        }
                    }
                    if (relatedArtworks.length >= remainingLimit) {
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }

        // 3. 최종적으로 8개 이하의 관련 작품 반환
        return relatedArtworks.slice(0, 8); // 최대 8개로 제한
    }

    /**
     * 새로운 작품을 생성합니다.
     */
    async createArtwork(artworkData, file) {
        if (!artworkData.title) {
            throw new ArtworkValidationError('작품 제목은 필수입니다.');
        }

        artworkData.id = generateDomainUUID(DOMAINS.ARTWORK);
        artworkData.slug = artworkData.title.replace(/ /g, '_') + '_' + uuidv4().slice(0, 8);
        const uploadedImage = await this.imageService.getUploadedImageInfo(file);
        artworkData.imagePublicId = uploadedImage.publicId;
        artworkData.imageUrl = uploadedImage.imageUrl;

        return await TransactionManager.executeInTransaction(async transaction => {
            const artwork = await this.artworkRepository.createArtwork(artworkData, { transaction });

            if (artworkData.exhibitionId !== '') {
                const result = await this.artworkExhibitionRelationshipRepository.createArtworkExhibitionRelationship(
                    artwork.id,
                    artworkData.exhibitionId,
                    { transaction }
                );
                if (!result) {
                    throw new ArtworkValidationError('작품 출품 중 오류가 발생했습니다.');
                }
            }

            return new ArtworkSimpleDto(artwork);
        });
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} requestDto - 수정할 작품 데이터
     * @returns {Promise<ArtworkSimpleDTO>} 수정된 작품 정보
     */
    async updateArtwork(id, artworkData) {
        const existingArtwork = await this.artworkRepository.findArtworkById(id);
        if (!existingArtwork) {
            throw new ArtworkNotFoundError();
        }

        const updatedArtwork = await this.artworkRepository.updateArtwork(id, artworkData);
        return new ArtworkDetailDto(updatedArtwork);
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteArtwork(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        // 이미지 삭제
        await this.imageService.deleteImage(artwork.imagePublicId);

        // 출품 전시회 관계 삭제
        await this.artworkExhibitionRelationshipRepository.deleteArtworkExhibitionRelationshipByArtworkId(id);

        // 작품 삭제(soft delete)
        return this.artworkRepository.updateArtworkDeleted(id);
    }

    /**
     * 작가 목록을 조회합니다.
     * @returns {Promise<Array>} 작가 목록
     */
    async getArtists() {
        const artists = await this.artworkRepository.findArtists();
        return Array.isArray(artists) ? artists : [];
    }

    /**
     * 추천 작품 목록을 조회합니다.
     * @returns {Promise<Array<ArtworkSimpleDTO>>} 추천 작품 목록
     */
    async getFeaturedArtworks() {
        const FEATURED_LIMIT = 6;
        const result = await this.artworkRepository.findFeaturedArtworks(FEATURED_LIMIT);
        const artworks = result.items || []; // pagination: false일 때 items 배열 추출
        const artworkSimpleList = [];

        for (const artwork of artworks) {
            const artworkSimple = new ArtworkSimpleDto(artwork);
            const user = await this.userService.getUserSimple(artworkSimple.userId);

            if (user) {
                artworkSimple.artistName = user.name;
                artworkSimple.artistAffiliation = user.affiliation;
            }

            const exhibitions =
                await this.artworkExhibitionRelationshipRepository.findArtworkExhibitionRelationshipsByArtworkId(
                    artwork.id
                );
            if (exhibitions.length > 0) {
                artworkSimple.RepresentativeExhibitionId = exhibitions[0].exhibitionId;
                const exhibitionSimple = await this.exhibitionService.getExhibitionSimple(
                    artworkSimple.RepresentativeExhibitionId
                );
                artworkSimple.RepresentativeExhibitionTitle = exhibitionSimple.title;
            }

            artworkSimpleList.push(artworkSimple);
        }

        return artworkSimpleList;
    }

    async submitArtworkToExhibition(artworkId, exhibitionId) {
        return await this.artworkExhibitionRelationshipRepository.createArtworkExhibitionRelationship(
            artworkId,
            exhibitionId
        );
    }

    async cancelArtworkSubmission(artworkId, exhibitionId) {
        return await this.artworkExhibitionRelationshipRepository.deleteArtworkExhibitionRelationship(
            artworkId,
            exhibitionId
        );
    }
}

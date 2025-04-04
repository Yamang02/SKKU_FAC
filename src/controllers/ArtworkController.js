import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import UserRepository from '../repositories/UserRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import { ArtworkService } from '../services/artwork/ArtworkService.js';
import {
    ArtworkNotFoundError,
    ArtworkValidationError
} from '../models/common/error/ArtworkError.js';
import { ImageError } from '../errors/ImageError.js';
import { ApiResponse } from '../models/common/response/ApiResponse.js';
import { Message } from '../constants/Message.js';
import { logger } from '../config/logger.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.userRepository = new UserRepository();
        this.exhibitionRepository = new ExhibitionRepository();
        this.artworkService = new ArtworkService();
    }

    // === 페이지 렌더링 ===
    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkListPage(req, res) {
        try {
            const { page = 1, size = 10 } = req.query;
            const result = await this.artworkService.getArtworkList(Number(page), Number(size));

            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록',
                artworks: result.items,
                page: result.page,
                total: result.total
            });
        } catch (error) {
            logger.error({
                operation: 'getArtworkListPage',
                error: error.message,
                stack: error.stack
            });
            return res.status(500).render('error', {
                message: Message.ARTWORK.LIST_ERROR
            });
        }
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     */
    async getArtworkDetailPage(req, res) {
        try {
            const { id } = req.params;
            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.DETAIL, {
                title: '작품 상세',
                artworkId: id
            });
        } catch (error) {
            logger.error({
                operation: 'getArtworkDetailPage',
                error: error.message,
                stack: error.stack,
                id: req.params.id
            });
            return res.status(500).render('error', {
                message: Message.ARTWORK.DETAIL_ERROR
            });
        }
    }

    /**
     * 작품 등록 페이지를 렌더링합니다.
     */
    async getArtworkRegistrationPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.REGISTER, {
                title: '작품 등록'
            });
        } catch (error) {
            logger.error({
                operation: 'getArtworkRegistrationPage',
                error: error.message,
                stack: error.stack
            });
            return res.status(500).render('error', {
                message: Message.ARTWORK.REGISTRATION_ERROR
            });
        }
    }

    /**
     * 관리자용 작품 목록 페이지를 렌더링합니다.
     */
    async getManagementArtworkListPage(req, res) {
        try {
            const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', keyword } = req.query;

            // 작품 목록과 작가 목록을 동시에 조회
            const [artworkList, artists] = await Promise.all([
                this.artworkService.getManagementArtworkList({
                    page,
                    limit,
                    sortField,
                    sortOrder,
                    keyword
                }),
                this.artworkService.getArtists()
            ]);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                artworks: artworkList.items,
                page: artworkList.page,
                artists: artists,
                filters: { keyword }
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 상세 페이지를 렌더링합니다.
     */
    async getManagementArtworkDetail(req, res) {
        try {
            const { id } = req.params;
            const artworkDetail = await this.artworkService.getManagementArtworkDetail(id);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 상세',
                artwork: artworkDetail
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 수정 페이지를 렌더링합니다.
     */
    async getManagementArtworkEditPage(req, res) {
        try {
            const { id } = req.params;
            const [artwork, exhibitions] = await Promise.all([
                this.artworkService.getArtworkById(id),
                this.exhibitionRepository.findExhibitions()
            ]);

            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            // 작가 정보 처리
            let artist = null;
            if (artwork.artistId) {
                artist = await this.userRepository.findUserById(artwork.artistId);
            }

            // 작품 데이터에 작가 정보 추가
            const processedArtwork = {
                ...artwork,
                artist: artist ? {
                    id: artist.id,
                    name: artist.name,
                    department: artist.department
                } : null
            };

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 수정',
                artwork: processedArtwork,
                exhibitions: exhibitions.items || [],
                isEdit: true
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 정보를 수정합니다.
     */
    async updateManagementArtwork(req, res) {
        try {
            const { id } = req.params;
            const artworkData = req.body;
            const result = await this.artworkService.updateArtwork(id, artworkData);

            if (result) {
                res.redirect('/admin/management/artwork');
            } else {
                ViewResolver.renderError(res, new Error('작품을 찾을 수 없습니다.'));
            }
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품을 삭제합니다.
     */
    async deleteManagementArtwork(req, res) {
        try {
            const { id } = req.params;
            const result = await this.artworkService.deleteArtwork(id);

            if (result) {
                res.json({
                    success: true,
                    message: '작품이 삭제되었습니다.'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: '작품을 찾을 수 없습니다.'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '작품 삭제 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 작품 등록 페이지를 렌더링합니다.
     */
    async getManagementArtworkCreatePage(req, res) {
        try {
            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            const artists = await this.artworkService.getArtists();

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 등록',
                artwork: null,
                exhibitions: exhibitions.items || [],
                artists: artists || [],
                user: req.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품을 등록합니다.
     */
    async createManagementArtwork(req, res) {
        try {
            const artworkData = req.body;
            const result = await this.artworkService.createArtwork(artworkData);

            if (result) {
                res.json({
                    success: true,
                    message: '작품이 등록되었습니다.',
                    redirectUrl: '/admin/management/artwork'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: '작품 등록에 실패했습니다.'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '작품 등록 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 작품 상세 정보를 JSON 형식으로 반환합니다.
     */
    async getArtworkById(id) {
        const artwork = await this.artworkService.getArtworkById(id);
        return artwork;
    }

    /**
     * 작품 목록 데이터를 API로 반환합니다.
     */
    async getArtworkListData(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = req.query;
            const artworkList = await this.artworkService.getArtworkList({ page, limit, sortField, sortOrder, searchType, keyword });
            res.json(artworkList);
        } catch (error) {
            res.status(500).json({ success: false, message: '작품 목록을 불러오는데 실패했습니다.' });
        }
    }

    /**
     * 추천 작품 목록을 반환합니다.
     */
    async getFeaturedArtworks(req, res) {
        try {
            const { limit = 6 } = req.query;
            const artworks = await this.artworkService.getFeaturedArtworks(Number(limit));
            res.json({ success: true, data: artworks });
        } catch (error) {
            console.error('추천 작품 조회 중 오류 발생:', error);
            res.status(500).json({
                success: false,
                message: '작품 데이터를 불러올 수 없습니다.'
            });
        }
    }

    /**
     * 전시회별 작품 목록을 조회합니다.
     */
    async getArtworksByExhibition(req, res) {
        try {
            const { exhibitionId } = req.params;
            const { page = 1, limit = 12 } = req.query;

            const result = await this.artworkService.getArtworkList({
                page: Number(page),
                limit: Number(limit),
                exhibitionId: Number(exhibitionId)
            });

            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '전시회 작품 목록',
                artworks: result.items,
                page: result.page,
                total: result.total,
                exhibitionId
            });
        } catch (error) {
            logger.error({
                operation: 'getArtworksByExhibition',
                error: error.message,
                stack: error.stack,
                exhibitionId: req.params.exhibitionId
            });
            return res.status(500).render('error', {
                message: Message.ARTWORK.LIST_ERROR
            });
        }
    }

    // === API 엔드포인트 ===
    /**
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(req, res) {
        try {
            const { page = 1, size = 10, isFeatured } = req.query;
            const result = await this.artworkService.getArtworkList({
                page: Number(page),
                size: Number(size),
                isFeatured
            });
            return res.json(ApiResponse.success(result).toJSON());
        } catch (error) {
            logger.error({
                operation: 'getArtworkList',
                error: error.message,
                stack: error.stack,
                page: req.query.page,
                size: req.query.size
            });
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.LIST_ERROR).toJSON());
        }
    }

    /**
     * 작품 상세 정보를 조회합니다.
     */
    async getArtworkDetail(req, res) {
        try {
            const id = parseInt(req.params.id);
            const type = req.query.type || 'default';

            const artwork = await this.artworkService.getArtworkDetail(id, type);

            // artist와 exhibition이 없는 경우 기본값 설정
            if (!artwork.artist) {
                artwork.artist = { id: null, name: '작가 미상' };
            }
            if (!artwork.exhibition) {
                artwork.exhibition = { title: '없음' };
            }

            res.json(artwork);
        } catch (error) {
            console.error('작품 상세 정보 조회 중 오류:', error);
            res.status(404).json({ error: error.message });
        }
    }

    /**
     * 작품을 등록합니다.
     */
    async createArtwork(req, res) {
        try {
            const artworkData = req.body;
            const file = req.file;
            logger.info({
                operation: 'createArtwork',
                title: artworkData.title,
                artistId: artworkData.artistId,
                hasImage: !!file
            });

            const artwork = await this.artworkService.createArtwork(artworkData, file);
            return res.status(201).json(ApiResponse.success(artwork, Message.ARTWORK.CREATE_SUCCESS).toJSON());
        } catch (error) {
            if (error instanceof ArtworkValidationError) {
                logger.error({
                    operation: 'createArtwork',
                    error: error.message,
                    stack: error.stack,
                    data: req.body
                });
                return res.status(400).json(ApiResponse.error(Message.ARTWORK.VALIDATION_ERROR).toJSON());
            } else if (error instanceof ImageError) {
                logger.error({
                    operation: 'createArtwork',
                    error: error.message,
                    stack: error.stack,
                    file: req.file
                });
                return res.status(400).json(ApiResponse.error(Message.IMAGE.UPLOAD_ERROR).toJSON());
            }
            logger.error({
                operation: 'createArtwork',
                error: error.message,
                stack: error.stack,
                data: req.body
            });
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.CREATE_ERROR).toJSON());
        }
    }

    /**
     * 작품을 수정합니다.
     */
    async updateArtwork(req, res) {
        try {
            const { id } = req.params;
            const artworkData = req.body;
            const file = req.file;
            const artwork = await this.artworkService.updateArtwork(id, artworkData, file);
            return res.json(ApiResponse.success(artwork, Message.ARTWORK.UPDATE_SUCCESS).toJSON());
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND).toJSON());
            } else if (error instanceof ArtworkValidationError) {
                return res.status(400).json(ApiResponse.error(Message.ARTWORK.VALIDATION_ERROR).toJSON());
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.UPLOAD_ERROR).toJSON());
            }
            console.error('Error updating artwork:', error);
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.UPDATE_ERROR).toJSON());
        }
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(req, res) {
        try {
            const { id } = req.params;
            await this.artworkService.deleteArtwork(id);
            return res.json(ApiResponse.success(null, Message.ARTWORK.DELETE_SUCCESS).toJSON());
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND).toJSON());
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.DELETE_ERROR).toJSON());
            }
            console.error('Error deleting artwork:', error);
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.DELETE_ERROR).toJSON());
        }
    }

    /**
     * 작품 간단 정보를 조회합니다.
     */
    async getArtworkSimple(req, res) {
        try {
            const id = parseInt(req.params.id);
            const type = req.query.type || 'default';

            const artwork = await this.artworkService.getArtworkSimple(id, type);
            res.json(artwork);
        } catch (error) {
            console.error('작품 간단 정보 조회 중 오류:', error);
            res.status(404).json({ error: error.message });
        }
    }
}

import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import UserRepository from '../repositories/UserRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import ArtworkService from '../services/artwork/ArtworkService.js';
import ExhibitionService from '../services/exhibition/ExhibitionService.js';
import {
    ArtworkNotFoundError,
    ArtworkValidationError
} from '../models/common/error/ArtworkError.js';
import { ImageError } from '../errors/ImageError.js';
import { ApiResponse } from '../models/common/response/ApiResponse.js';
import { Message } from '../constants/Message.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.userRepository = new UserRepository();
        this.exhibitionRepository = new ExhibitionRepository();
        this.artworkService = new ArtworkService();
        this.exhibitionService = new ExhibitionService();
    }

    // === 페이지 렌더링 ===
    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkListPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록'
            });
        } catch (error) {
            return res.status(500).render('error', {
                message: Message.ARTWORK.LIST_ERROR,
                error: error.message
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
            return res.status(500).render('error', {
                message: Message.ARTWORK.DETAIL_ERROR,
                error: error.message
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
            return res.status(500).render('error', {
                message: Message.ARTWORK.REGISTRATION_ERROR,
                error: error.message
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
                return res.json(ApiResponse.success(null, Message.ARTWORK.DELETE_SUCCESS));
            } else {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
            }
        } catch (error) {
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.DELETE_ERROR));
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
                return res.json(ApiResponse.success({
                    message: Message.ARTWORK.CREATE_SUCCESS,
                    redirectUrl: '/admin/management/artwork'
                }));
            } else {
                return res.status(400).json(ApiResponse.error(Message.ARTWORK.CREATE_ERROR));
            }
        } catch (error) {
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.CREATE_ERROR));
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
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const artworkList = await this.artworkService.getArtworkList({
                page: Number(page),
                limit: Number(limit),
                ...filters
            });

            return res.json(ApiResponse.success({
                items: artworkList.items,
                total: artworkList.total,
                page: artworkList.page
            }));
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            return res.status(500).json(ApiResponse.error(error.message));
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
            return res.status(500).render('error', {
                message: Message.ARTWORK.LIST_ERROR,
                error: error.message
            });
        }
    }

    // === API 엔드포인트 ===
    /**
     * 작품 상세 정보를 조회합니다.
     */
    async getArtworkDetail(req, res) {
        try {
            const id = parseInt(req.params.id);
            const type = req.query.type || 'default';

            const artwork = await this.artworkService.getArtworkDetail(id, type);
            return res.json(ApiResponse.success(artwork));
        } catch (error) {
            return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
        }
    }

    /**
     * 작품을 등록합니다.
     */
    async createArtwork(req, res) {
        try {
            console.log('=== 작품 등록 요청 시작 ===');
            console.log('Request Body:', req.body);
            console.log('Request File:', req.file);
            console.log('Request Headers:', req.headers);
            console.log('========================');

            const artworkData = req.body;
            const file = req.file;

            if (!file) {
                console.error('파일이 업로드되지 않았습니다.');
                return res.status(400).json(ApiResponse.error('이미지 파일이 필요합니다.'));
            }

            console.log('파일 정보:', {
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size
            });

            const artwork = await this.artworkService.createArtwork(artworkData, file);
            console.log('생성된 작품 정보:', artwork);

            return res.status(201).json(ApiResponse.success(artwork, Message.ARTWORK.CREATE_SUCCESS));
        } catch (error) {
            console.error('작품 등록 중 오류 발생:', error);

            if (error instanceof ArtworkValidationError) {
                return res.status(400).json(ApiResponse.error(Message.ARTWORK.VALIDATION_ERROR));
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.UPLOAD_ERROR));
            }
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.CREATE_ERROR));
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
            return res.json(ApiResponse.success(artwork, Message.ARTWORK.UPDATE_SUCCESS));
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
            } else if (error instanceof ArtworkValidationError) {
                return res.status(400).json(ApiResponse.error(Message.ARTWORK.VALIDATION_ERROR));
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.UPLOAD_ERROR));
            }
            console.error('Error updating artwork:', error);
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.UPDATE_ERROR));
        }
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(req, res) {
        try {
            const { id } = req.params;
            await this.artworkService.deleteArtwork(id);
            return res.json(ApiResponse.success(null, Message.ARTWORK.DELETE_SUCCESS));
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.DELETE_ERROR));
            }
            console.error('Error deleting artwork:', error);
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.DELETE_ERROR));
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
            return res.json(ApiResponse.success(artwork));
        } catch (error) {
            return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
        }
    }

    /**
     * 관련 작품 목록을 조회합니다.
     */
    async getRelatedArtworks(req, res) {
        try {
            const { id } = req.params;
            const relatedArtworks = await this.artworkService.getRelatedArtworks(id);
            return res.json(ApiResponse.success(relatedArtworks));
        } catch (error) {
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.RELATED_ERROR));
        }
    }
    /**
     * 추천 작품 목록을 조회합니다.
     */
    async getFeaturedArtworks(req, res) {
        try {
            const artworks = await this.artworkService.getFeaturedArtworks();
            return res.json(ApiResponse.success(artworks));
        } catch (error) {
            console.error('추천 작품 목록 조회 중 오류:', error);
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }
}

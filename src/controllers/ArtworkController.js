import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import UserRepository from '../repositories/UserRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import ArtworkService from '../services/artwork/ArtworkService.js';
import {
    ArtworkNotFoundError,
    ArtworkValidationError
} from '../models/common/error/ArtworkError.js';
import { ImageError } from '../errors/ImageError.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.userRepository = new UserRepository();
        this.exhibitionRepository = new ExhibitionRepository();
        this.artworkService = new ArtworkService();
    }

    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkList(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = req.query;
            const artworkList = await this.artworkService.getArtworkList({
                page,
                limit,
                sortField,
                sortOrder,
                searchType,
                keyword,
                baseUrl: '/artwork'
            });

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록',
                artworks: artworkList.items,
                page: artworkList.page,
                searchType: searchType || '',
                keyword: keyword || '',
                total: artworkList.total
            });
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                ViewResolver.renderError(res, error, 404);
            } else {
                ViewResolver.renderError(res, error, 500);
            }
        }
    }

    /**
     * 특정 전시회의 작품 목록을 조회합니다.
     */
    async getArtworksByExhibition(req, res) {
        try {
            const { exhibitionId } = req.params;
            const { page = 1, limit = 12 } = req.query;
            const artworkList = await this.artworkService.getArtworkList({
                page,
                limit,
                exhibitionId,
                sortField: 'createdAt',
                sortOrder: 'desc',
                baseUrl: `/artwork/exhibition/${exhibitionId}`
            });

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.EXHIBITION, {
                title: '전시회 작품',
                artworks: artworkList.items,
                page: artworkList.page,
                exhibitionId
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     */
    async getArtworkDetail(req, res) {
        try {
            const { id } = req.params;
            const artworkDetail = await this.artworkService.getArtworkDetail(id);

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.DETAIL, {
                title: artworkDetail.title,
                artwork: artworkDetail,
                relatedArtworks: artworkDetail.relatedArtworks
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 등록 페이지를 렌더링합니다.
     */
    async getArtworkRegistrationPage(req, res) {
        try {
            // 로그인 체크
            if (!req.session.user) {
                return res.redirect('/user/login?returnUrl=/artwork/new');
            }

            const user = await this.userRepository.findUserById(req.session.user.id);
            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            const exhibitionId = req.query.exhibition;

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.REGISTER, {
                title: '작품 등록',
                exhibitions: exhibitions.items || [],
                selectedExhibitionId: exhibitionId,
                user: user,
                error: req.flash('error')[0] || null,
                success: req.flash('success')[0] || null,
                formData: {}
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품을 등록합니다.
     */
    async createArtwork(req, res) {
        try {
            // 1. 세션 유효성 검사
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    code: 'AUTH_REQUIRED',
                    message: '로그인이 필요합니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 2. 사용자 정보 가져오기
            const user = await this.userRepository.findUserById(req.session.user.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: '사용자 정보를 찾을 수 없습니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 디버깅: 요청 데이터 확인
            console.log('요청 데이터:', {
                body: req.body,
                file: req.file ? {
                    originalname: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                } : null,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role
                }
            });

            // 3. 요청 데이터 준비
            const artworkData = {
                ...req.body,
                artistId: user.id,
                artistName: user.name
            };

            // 4. 작품 생성
            console.log('작품 생성 시작');
            const artwork = await this.artworkService.createArtwork(artworkData, req.file);
            console.log('작품 생성 완료:', artwork);

            // 5. 응답 전송
            return res.json({
                success: true,
                code: 'ARTWORK_CREATED',
                message: '작품이 성공적으로 등록되었습니다.',
                artwork: artwork.toJSON()
            });
        } catch (error) {
            // 디버깅: 에러 상세 정보 출력
            console.error('작품 생성 중 오류 발생:', error);
            console.error('에러 스택:', error.stack);
            console.error('에러 타입:', error.constructor.name);
            console.error('에러 코드:', error.code);
            console.error('에러 메시지:', error.message);

            if (error instanceof ArtworkValidationError) {
                return res.status(400).json({
                    success: false,
                    code: error.code,
                    message: error.message
                });
            } else if (error instanceof ImageError) {
                return res.status(400).json({
                    success: false,
                    code: error.code,
                    message: error.message
                });
            } else {
                console.error('Error creating artwork:', error);
                return res.status(500).json({ error: '작품 생성 중 오류가 발생했습니다.' });
            }
        }
    }

    /**
     * 작품 수정 페이지를 렌더링합니다.
     */
    async getArtworkEditPage(req, res) {
        try {
            const { id } = req.params;
            const artworkDetail = await this.artworkService.getArtworkDetail(id);

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.EDIT, {
                title: '작품 수정',
                artwork: artworkDetail,
                user: req.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품을 수정합니다.
     */
    async updateArtwork(req, res) {
        try {
            // 1. 세션 유효성 검사
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    code: 'AUTH_REQUIRED',
                    message: '로그인이 필요합니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 2. 사용자 정보 가져오기
            const user = await this.userRepository.findUserById(req.session.user.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: '사용자 정보를 찾을 수 없습니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 3. 작품 수정
            const { id } = req.params;
            const artworkData = {
                ...req.body,
                artistId: user.id,
                artistName: user.name
            };

            const artwork = await this.artworkService.updateArtwork(id, artworkData, req.file);

            // 4. 응답 전송
            return res.json({
                success: true,
                code: 'ARTWORK_UPDATED',
                message: '작품이 성공적으로 수정되었습니다.',
                artwork: artwork.toJSON()
            });
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json({ error: error.message });
            } else if (error instanceof ArtworkValidationError) {
                return res.status(400).json({ error: error.message });
            } else if (error instanceof ImageError) {
                return res.status(400).json({ error: error.message });
            } else {
                console.error('Error updating artwork:', error);
                return res.status(500).json({ error: '작품 수정 중 오류가 발생했습니다.' });
            }
        }
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(req, res) {
        try {
            const { id } = req.params;
            const result = await this.artworkService.deleteArtwork(id);
            if (!result) {
                throw new Error('삭제 중 오류 발생');
            }

            res.json({
                success: true,
                code: 'ARTWORK_DELETED',
                message: '작품이 삭제되었습니다.'
            });
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json({ error: error.message });
            } else if (error instanceof ImageError) {
                return res.status(400).json({ error: error.message });
            } else {
                console.error('Error deleting artwork:', error);
                return res.status(500).json({ error: '작품 삭제 중 오류가 발생했습니다.' });
            }
        }
    }

    /**
     * 관리자용 작품 목록 페이지를 렌더링합니다.
     */
    async getManagementArtworkList(req, res) {
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
     * 작품 데이터를 조회합니다.
     */
    async getArtworkData(req, res) {
        try {
            const { id } = req.params;
            const { type = 'default' } = req.query;
            const artworkData = await this.artworkService.getArtworkSimple(id, type);
            res.json(artworkData);
        } catch (error) {
            res.status(500).json({ success: false, message: '작품 데이터를 불러오는데 실패했습니다.' });
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
}

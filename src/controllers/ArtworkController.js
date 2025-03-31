import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import FileUploadUtil from '../utils/FileUploadUtil.js';
import ArtworkRepository from '../repositories/ArtworkRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import ArtworkService from '../services/artwork/ArtworkService.js';
import Page from '../models/common/page/Page.js';
import ArtworkRequestDTO from '../models/artwork/dto/ArtworkRequestDTO.js';
import ArtworkResponseDTO from '../models/artwork/dto/ArtworkResponseDTO.js';
import Artwork from '../models/artwork/Artwork.js';
import fs from 'fs';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
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
            const artworkList = await this.artworkService.getArtworkList({ page, limit, sortField, sortOrder, searchType, keyword });

            const pageOptions = {
                page,
                limit,
                baseUrl: '/artwork',
                sortField,
                sortOrder,
                filters: { searchType, keyword },
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(artworkList.total, pageOptions);

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록',
                artworks: artworkList.items,
                page: pageData,
                searchType: searchType || '',
                keyword: keyword || '',
                sortField: sortField || 'createdAt',
                sortOrder: sortOrder || 'desc',
                total: artworkList.total
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
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
                sortOrder: 'desc'
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
                return res.redirect('/user/login?returnUrl=/artwork/registration');
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
        let uploadedImage = null;
        try {
            // 1. 세션 유효성 검사
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: '로그인이 필요합니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 2. 사용자 정보 가져오기
            const user = await this.userRepository.findUserById(req.session.user.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '사용자 정보를 찾을 수 없습니다.',
                    redirectUrl: '/user/login'
                });
            }

            // 3. 요청 데이터 가져오기
            const { title, description, exhibitionId, medium, size, department } = req.body;
            uploadedImage = req.file;

            // 4. 필수 필드 검증
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: '작품 제목을 입력해주세요.'
                });
            }

            if (!uploadedImage) {
                return res.status(400).json({
                    success: false,
                    message: '작품 이미지를 업로드해주세요.'
                });
            }

            // 5. 새로운 ID 생성
            const newId = this.artworkRepository.artworks.length > 0
                ? Math.max(...this.artworkRepository.artworks.map(a => Number(a.id))) + 1
                : 1;

            // 6. 이미지 저장
            let filePath = null;
            let imageUrl = null;

            try {
                const result = await FileUploadUtil.saveImage({
                    file: uploadedImage,
                    artwork_id: newId,
                    title,
                    artist_name: user.name,
                    department: department || ''
                });
                filePath = result.filePath;
                imageUrl = result.imageUrl;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            // 7. 전시회 ID 처리
            let parsedExhibitionId = null;
            if (exhibitionId && exhibitionId !== '0') {
                parsedExhibitionId = Number(exhibitionId);
                // 0 또는 NaN인 경우 null로 설정
                if (parsedExhibitionId === 0 || isNaN(parsedExhibitionId)) {
                    parsedExhibitionId = null;
                }
            }

            // 8. RequestDTO 생성
            const requestDTO = new ArtworkRequestDTO({
                title,
                description: description || '',
                department: department || '',
                artistId: user.id,
                image: imageUrl,
                imagePath: filePath,
                exhibitionId: parsedExhibitionId,
                medium: medium || '',
                size: size || '',
                year: new Date().getFullYear().toString(),
                isFeatured: false
            });

            // 9. DTO 유효성 검사
            requestDTO.validate();

            // 10. Artwork 모델 인스턴스 생성
            const artwork = new Artwork({
                ...requestDTO,
                id: newId,
                artistName: user.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // 11. 작품 저장
            const savedArtwork = await this.artworkRepository.createArtwork(artwork.toJSON());

            // 12. ResponseDTO 생성 및 응답 전송
            const responseDTO = new ArtworkResponseDTO(savedArtwork);
            return res.json({
                success: true,
                message: '작품이 성공적으로 등록되었습니다.',
                artwork: responseDTO.toJSON()
            });
        } catch (error) {
            // 임시 파일이 있다면 삭제
            if (uploadedImage && uploadedImage.path) {
                try {
                    await fs.promises.unlink(uploadedImage.path);
                } catch (unlinkError) {
                    // 임시 파일 삭제 실패
                }
            }

            return res.status(500).json({
                success: false,
                message: '작품 등록 중 오류가 발생했습니다: ' + error.message
            });
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
            const { id } = req.params;
            const artworkData = req.body;
            const result = await this.artworkService.updateArtwork(id, artworkData);

            if (result) {
                res.json({ success: true, message: '작품이 수정되었습니다.' });
            } else {
                res.status(404).json({ success: false, message: '작품을 찾을 수 없습니다.' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: '작품 수정 중 오류가 발생했습니다.' });
        }
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(req, res) {
        try {
            const { id } = req.params;
            const result = await this.artworkService.deleteArtwork(id);

            if (result) {
                res.json({ success: true, message: '작품이 삭제되었습니다.' });
            } else {
                res.status(404).json({ success: false, message: '작품을 찾을 수 없습니다.' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: '작품 삭제 중 오류가 발생했습니다.' });
        }
    }

    /**
     * 관리자용 작품 목록 페이지를 렌더링합니다.
     */
    async getManagementArtworkList(req, res) {
        try {
            const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', keyword } = req.query;
            const artworkList = await this.artworkService.getManagementArtworkList({ page, limit, sortField, sortOrder, keyword });

            const pageOptions = {
                page,
                limit,
                baseUrl: '/admin/management/artwork',
                filters: { keyword },
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(artworkList.total, pageOptions);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                artworks: artworkList.items,
                page: pageData,
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
                this.artworkRepository.findArtworkById(id),
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
            const artists = await this.artworkRepository.findArtists();

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
        const artwork = await this.artworkRepository.findArtworkById(id);
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
     * 추천 작품 목록을 JSON 형식으로 반환합니다.
     */
    async getFeaturedArtworks(req, res) {
        try {
            const { limit = 6 } = req.query;
            const artworkList = await this.artworkService.getArtworkList({
                page: 1,
                limit,
                sortField: 'createdAt',
                sortOrder: 'desc',
                isFeatured: true
            });
            res.json(artworkList);
        } catch (error) {
            res.status(500).json({ success: false, message: '추천 작품 목록을 불러오는데 실패했습니다.' });
        }
    }
}

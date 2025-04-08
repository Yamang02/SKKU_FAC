import { ViewPath } from '../../../common/constants/ViewPath.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import ArtworkService from '../service/ArtworkService.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.artworkService = new ArtworkService();
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
            return ViewResolver.renderError(res, error);
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
            return ViewResolver.renderError(res, error);
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
            return ViewResolver.renderError(res, error);
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
            return ViewResolver.renderError(res, error);
        }
    }

}

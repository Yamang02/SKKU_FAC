import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import ArtworkRepository from '../repositories/ArtworkRepository.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import Page from '../models/common/page/Page.js';

/**
 * 작품 관련 컨트롤러
 */
export default class ArtworkController {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.exhibitionRepository = new ExhibitionRepository();
    }

    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkList(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = req.query;
            const [artworks, exhibitionResult] = await Promise.all([
                this.artworkRepository.findArtworks({ page, limit, sortField, sortOrder, searchType, keyword }),
                this.exhibitionRepository.findExhibitions({ limit: 100 })
            ]);

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

            const pageData = new Page(artworks.total || 0, pageOptions);

            // 전시회 데이터 가공
            const exhibitions = exhibitionResult && exhibitionResult.items ? exhibitionResult.items : [];
            const processedExhibitions = exhibitions.map(ex => ({
                id: ex.id || '',
                code: ex.id ? ex.id.toString() : '',
                title: ex.title || '',
                subtitle: ex.description || '',
                image: ex.imageUrl || '/images/exhibition-placeholder.jpg'
            }));

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '작품 목록',
                artworks: artworks && artworks.items ? artworks.items : [],
                exhibitions: processedExhibitions,
                page: pageData,
                searchType: searchType || '',
                keyword: keyword || '',
                sortField: sortField || 'createdAt',
                sortOrder: sortOrder || 'desc',
                total: artworks && artworks.total ? artworks.total : 0,
                selectedExhibition: req.query.exhibition || ''
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
            const artworks = await this.artworkRepository.findArtworksByExhibitionId(exhibitionId, { page, limit });

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.LIST, {
                title: '전시회 작품 목록',
                artworks,
                currentPage: page,
                totalPages: Math.ceil(artworks.total / limit)
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
            const { page: commentPage = 1 } = req.query;
            const artwork = await this.artworkRepository.findArtworkById(id);
            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            const comments = await this.artworkRepository.findComments(id, { page: commentPage });
            const relatedArtworks = await this.artworkRepository.findRelatedArtworks(id);
            const exhibitions = await this.exhibitionRepository.findExhibitions();

            const commentPageOptions = {
                page: commentPage,
                limit: 10,
                baseUrl: `/artwork/${id}`,
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const commentPageData = new Page(comments.total, commentPageOptions);

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.DETAIL, {
                title: artwork.title,
                artwork,
                comments: comments.items,
                relatedArtworks: relatedArtworks.items,
                exhibitions: exhibitions.items,
                page: commentPageData
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 등록 페이지를 렌더링합니다.
     */
    async getArtworkCreatePage(req, res) {
        try {
            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            ViewResolver.render(res, ViewPath.ARTWORK.CREATE, {
                title: '작품 등록',
                exhibitions
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
            const { title, description, exhibitionId, imageUrl, isFeatured } = req.body;
            const artwork = await this.artworkRepository.createArtwork({
                title,
                description,
                exhibition_id: exhibitionId,
                image_url: imageUrl,
                is_featured: isFeatured === 'true',
                created_by: req.session.user.id
            });

            res.redirect(`/artworks/${artwork.id}`);
        } catch (error) {
            ViewResolver.render(res, ViewPath.ARTWORK.CREATE, {
                title: '작품 등록',
                error: error.message
            });
        }
    }

    /**
     * 작품 수정 페이지를 렌더링합니다.
     */
    async getArtworkEditPage(req, res) {
        try {
            const [artwork, exhibitions] = await Promise.all([
                this.artworkRepository.findArtworkById(req.params.id),
                this.exhibitionRepository.findExhibitions({ limit: 100 })
            ]);

            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ARTWORK.EDIT, {
                title: '작품 수정',
                artwork,
                exhibitions
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
            const { title, description, exhibitionId, imageUrl, isFeatured } = req.body;
            await this.artworkRepository.updateArtwork(req.params.id, {
                title,
                description,
                exhibition_id: exhibitionId,
                image_url: imageUrl,
                is_featured: isFeatured === 'true'
            });

            res.redirect(`/artworks/${req.params.id}`);
        } catch (error) {
            ViewResolver.render(res, ViewPath.ARTWORK.EDIT, {
                title: '작품 수정',
                error: error.message
            });
        }
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(req, res) {
        try {
            await this.artworkRepository.deleteArtwork(req.params.id);
            res.redirect('/artworks');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 목록 페이지를 렌더링합니다.
     */
    async getAdminArtworkList(req, res) {
        try {
            const { page = 1, limit = 12, search, exhibitionId } = req.query;
            const artworks = await this.artworkRepository.findArtworks({ page, limit, search, exhibitionId });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                artworks,
                currentPage: page,
                totalPages: Math.ceil(artworks.total / limit)
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 상세 페이지를 렌더링합니다.
     */
    async getAdminArtworkDetail(req, res) {
        try {
            const { id } = req.params;
            const artwork = await this.artworkRepository.findArtworkById(id);
            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 상세',
                artwork
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 작품 수정 페이지를 렌더링합니다.
     */
    async getAdminArtworkEditPage(req, res) {
        try {
            const { id } = req.params;
            const artwork = await this.artworkRepository.findArtworkById(id);
            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            const exhibitions = await this.exhibitionRepository.findExhibitions();

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 수정',
                artwork,
                exhibitions,
                isEdit: true
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품을 수정합니다.
     */
    async updateAdminArtwork(req, res) {
        try {
            const { id } = req.params;
            const artworkData = req.body;

            await this.artworkRepository.updateArtwork(id, artworkData);
            res.redirect('/admin/management/artwork');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteAdminArtwork(req, res) {
        try {
            const { id } = req.params;
            await this.artworkRepository.deleteArtwork(id);
            res.redirect('/admin/management/artwork');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }
}

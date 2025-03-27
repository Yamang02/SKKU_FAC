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
            // 로그인 체크
            if (!req.session.user) {
                return res.redirect('/user/login?returnUrl=/artwork/register');
            }

            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            const exhibitionId = req.query.exhibition;

            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.REGISTER, {
                title: '작품 등록',
                exhibitions: exhibitions.items || [],
                selectedExhibitionId: exhibitionId,
                user: req.session.user
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
            // 로그인 체크
            if (!req.session.user) {
                return res.redirect('/user/login?returnUrl=/artwork/register');
            }

            const { title, description, exhibitionId, medium, size } = req.body;
            const imageFile = req.file;

            if (!imageFile) {
                throw new Error('작품 이미지를 업로드해주세요.');
            }

            if (!title) {
                throw new Error('작품 제목을 입력해주세요.');
            }

            const artwork = await this.artworkRepository.createArtwork({
                title,
                artist_name: req.session.user.name,
                department: req.session.user.department,
                student_id: req.session.user.studentId,
                description,
                exhibition_id: exhibitionId || null,
                medium,
                size,
                image_url: imageFile.path,
                is_featured: false, // 추천 작품은 관리자만 설정 가능
                created_by: req.session.user.id
            });

            res.redirect(`/artwork/${artwork.id}`);
        } catch (error) {
            // 에러 발생 시 등록 페이지로 돌아가면서 에러 메시지 전달
            const exhibitions = await this.exhibitionRepository.findExhibitions({ limit: 100 });
            ViewResolver.render(res, ViewPath.MAIN.ARTWORK.REGISTER, {
                title: '작품 등록',
                exhibitions: exhibitions.items || [],
                error: error.message,
                formData: req.body, // 이전 입력 데이터 유지
                user: req.session.user
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
    async getManagementArtworkList(req, res) {
        try {
            const { page = 1, limit = 10, keyword, exhibitionId, artistId } = req.query;
            const filters = { keyword, exhibitionId, artistId };

            const [artworks, exhibitions, artists] = await Promise.all([
                this.artworkRepository.findArtworks({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    ...filters
                }),
                this.exhibitionRepository.findExhibitions({ limit: 100 }),
                this.artworkRepository.findArtists({ limit: 100 })
            ]);

            const pageOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                baseUrl: '/admin/management/artwork',
                filters,
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(artworks.total, pageOptions);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.LIST, {
                title: '작품 관리',
                artworks: artworks.items || [],
                exhibitions: exhibitions.items || [],
                artists: artists.items || [],
                page: pageData,
                filters
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
            const [artwork, exhibitions, artists] = await Promise.all([
                this.artworkRepository.findArtworkById(id),
                this.exhibitionRepository.findExhibitions(),
                this.artworkRepository.findArtists({ limit: 100 })
            ]);

            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 상세',
                artwork,
                exhibitions: exhibitions.items || [],
                artists: artists.items || [],
                isEdit: true
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

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL, {
                title: '작품 수정',
                artwork,
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

            await this.artworkRepository.updateArtwork(id, artworkData);
            res.redirect('/admin/management/artwork');
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
            await this.artworkRepository.deleteArtwork(id);
            res.redirect('/admin/management/artwork');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 작품 상세 정보를 JSON 형식으로 반환합니다.
     */
    async getArtworkById(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        // 클라이언트에 필요한 데이터만 반환
        return {
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist,
            department: artwork.department,
            exhibition: artwork.exhibition ? artwork.exhibition.title : null,
            imageUrl: artwork.image_url || '/images/artwork-placeholder.jpg',
            description: artwork.description
        };
    }
}

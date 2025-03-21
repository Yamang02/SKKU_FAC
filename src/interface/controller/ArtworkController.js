/**
 * 작품 컨트롤러
 * 작품 관련 HTTP 요청을 처리합니다.
 */
class ArtworkController {
    constructor(artworkApplicationService, commentUseCase, exhibitionApplicationService) {
        this.artworkApplicationService = artworkApplicationService;
        this.commentUseCase = commentUseCase;
        this.exhibitionApplicationService = exhibitionApplicationService;
    }

    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkList(req, res) {
        try {
            const { keyword, exhibition, year, department, featured, page = 1, limit = 12 } = req.query;
            const offset = (page - 1) * limit;

            const [result, departments, years, exhibitions] = await Promise.all([
                this.artworkApplicationService.searchArtworks({
                    keyword,
                    exhibition,
                    year: year ? parseInt(year) : undefined,
                    department,
                    featured: featured === 'true',
                    limit: parseInt(limit),
                    offset
                }),
                this.artworkApplicationService.getDepartments(),
                this.artworkApplicationService.getYears(),
                this.exhibitionApplicationService.getAllExhibitions()
            ]);

            // 페이지네이션 정보 생성
            const totalPages = Math.ceil(result.total / limit);
            const maxPagesToShow = 5;
            let startPage = Math.max(1, parseInt(page) - 2);
            const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            const pages = [];
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            const pagination = {
                currentPage: parseInt(page),
                totalPages,
                totalItems: result.total,
                limit: parseInt(limit),
                hasPrevPage: parseInt(page) > 1,
                hasNextPage: parseInt(page) < totalPages,
                pages,
                showFirstPage: parseInt(page) > 3,
                showLastPage: parseInt(page) < totalPages - 2,
                showFirstEllipsis: parseInt(page) > 4,
                showLastEllipsis: parseInt(page) < totalPages - 3
            };

            res.render('artwork/ArtworkList', {
                artworks: result.items,
                total: result.total,
                currentPage: parseInt(page),
                limit: parseInt(limit),
                departments,
                years,
                exhibitions,
                keyword,
                exhibition,
                year,
                department,
                featured,
                pagination,
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Error in getArtworkList:', error);
            res.status(500).render('common/error', {
                message: '작품 목록을 불러오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     */
    async getArtworkDetail(req, res) {
        try {
            const { id } = req.params;
            const commentPage = parseInt(req.query.commentPage) || 1;
            const artwork = await this.artworkApplicationService.getArtworkById(parseInt(id));

            if (!artwork) {
                return res.status(404).render('error/404', {
                    message: '요청하신 작품을 찾을 수 없습니다.'
                });
            }

            const [relatedArtworks, commentData, exhibition] = await Promise.all([
                this.artworkApplicationService.getRelatedArtworks(parseInt(id)),
                this.commentUseCase.getArtworkComments(parseInt(id), commentPage),
                artwork.exhibition_id ? this.exhibitionApplicationService.getExhibitionById(artwork.exhibition_id) : null
            ]);

            // 작품 정보에 전시회 정보 추가
            const artworkWithDetails = {
                ...artwork,
                exhibition: exhibition,
                user: {
                    id: artwork.user_id,
                    username: artwork.username,
                    department: artwork.department,
                    student_id: artwork.student_id
                }
            };

            res.render('artwork/ArtworkDetail', {
                artwork: artworkWithDetails,
                relatedArtworks,
                comments: commentData.comments,
                commentPagination: commentData.pagination,
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Error in getArtworkDetail:', error);
            res.status(500).render('common/error', {
                message: '작품 상세 정보를 불러오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 전시회별 작품 목록을 조회합니다.
     */
    async getArtworksByExhibition(req, res) {
        try {
            const { exhibitionId } = req.params;
            const artworks = await this.artworkApplicationService.getArtworksByExhibitionId(parseInt(exhibitionId));
            res.json(artworks);
        } catch (error) {
            console.error('Error in getArtworksByExhibition:', error);
            res.status(500).json({
                error: '전시회별 작품 목록을 불러오는 중 오류가 발생했습니다.'
            });
        }
    }
}

export default ArtworkController;

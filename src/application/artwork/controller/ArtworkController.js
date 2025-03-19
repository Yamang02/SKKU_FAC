/**
 * 작품 컨트롤러
 * 작품 관련 HTTP 요청을 처리합니다.
 */
class ArtworkController {
    constructor(artworkApplicationService, commentApplicationService, exhibitionApplicationService) {
        this.artworkApplicationService = artworkApplicationService;
        this.commentApplicationService = commentApplicationService;
        this.exhibitionApplicationService = exhibitionApplicationService;
    }

    /**
     * 작품 목록 페이지를 렌더링합니다.
     */
    async getArtworkList(req, res) {
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
            pagination
        });
    }

    /**
     * 작품 상세 페이지를 렌더링합니다.
     */
    async getArtworkDetail(req, res) {
        const { id } = req.params;
        const commentPage = parseInt(req.query.commentPage) || 1;
        const artwork = await this.artworkApplicationService.getArtworkById(parseInt(id));

        if (!artwork) {
            return res.status(404).render('error/404');
        }

        const [relatedArtworks, commentData] = await Promise.all([
            this.artworkApplicationService.getRelatedArtworks(parseInt(id)),
            this.commentApplicationService.getCommentsByArtworkId(parseInt(id), commentPage)
        ]);

        res.render('artwork/ArtworkDetail', {
            artwork,
            relatedArtworks,
            comments: commentData.comments,
            commentPagination: commentData.pagination,
            user: req.session.user || null
        });
    }

    /**
     * 전시회별 작품 목록을 조회합니다.
     */
    async getArtworksByExhibition(req, res) {
        const { exhibitionId } = req.params;
        const artworks = await this.artworkApplicationService.getArtworksByExhibitionId(parseInt(exhibitionId));
        res.json(artworks);
    }
}

export default ArtworkController;

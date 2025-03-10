/**
 * 작품 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
import * as artworkService from '../service/ArtworkService.js';
import * as relatedArtworkService from '../service/RelatedArtworkService.js';
import * as exhibitionService from '../../exhibition/service/ExhibitionService.js';
import * as commentService from '../../comment/service/CommentService.js';

/**
 * 작품 목록 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export async function getArtworkList(req, res) {
    try {
        // 검색 파라미터 가져오기
        const { keyword, exhibition, year, department, page = 1 } = req.query;

        // 페이지네이션 설정
        const limit = 12;
        const offset = (page - 1) * limit;

        // 작품 목록 조회
        const artworksResult = artworkService.searchArtworks({
            keyword,
            exhibition,
            year,
            department,
            limit,
            offset
        });

        // 전시회 목록 조회 (필터용)
        const exhibitions = exhibitionService.getAllExhibitions();

        // 학과 목록 조회 (필터용)
        const departments = artworkService.getDepartments();

        // 연도 목록 조회 (필터용)
        const years = artworkService.getYears();

        res.render('artwork/index', {
            title: '작품 목록',
            artworks: artworksResult.items,
            exhibitions,
            departments,
            years,
            keyword: keyword || '',
            exhibition: exhibition || '',
            year: year || '',
            department: department || '',
            filters: { keyword, exhibition, year, department },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(artworksResult.total / limit),
                totalItems: artworksResult.total,
                hasPrevPage: parseInt(page) > 1,
                hasNextPage: parseInt(page) < Math.ceil(artworksResult.total / limit),
                pages: generatePageNumbers(parseInt(page), Math.ceil(artworksResult.total / limit)),
                showFirstPage: parseInt(page) > 3,
                showLastPage: parseInt(page) < Math.ceil(artworksResult.total / limit) - 2,
                showFirstEllipsis: parseInt(page) > 4,
                showLastEllipsis: parseInt(page) < Math.ceil(artworksResult.total / limit) - 3
            }
        });
    } catch (error) {
        // console.error('작품 목록 조회 오류:', error);
        res.status(500).render('common/error', {
            message: '작품 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 작품 상세 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getArtworkDetail(req, res) {
    try {
        const { id } = req.params;
        const commentPage = parseInt(req.query.commentPage) || 1;

        // 작품 정보 조회
        const artwork = artworkService.getArtworkById(id);

        if (!artwork) {
            return res.status(404).render('common/error', {
                message: '해당 작품을 찾을 수 없습니다.'
            });
        }

        // 관련 작품 조회
        const relatedArtworks = relatedArtworkService.getRelatedArtworks(id);

        // 댓글 조회
        const commentData = commentService.getCommentsByArtworkId(id, commentPage);

        res.render('artwork/detail', {
            title: artwork.title,
            artwork,
            relatedArtworks,
            comments: commentData.comments,
            commentPagination: commentData.pagination,
            user: req.session.user || null
        });
    } catch (error) {
        // console.error('작품 상세 조회 오류:', error);
        res.status(500).render('common/error', {
            message: '작품 정보를 불러오는 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 페이지 번호 배열을 생성합니다.
 * @param {number} currentPage - 현재 페이지 번호
 * @param {number} totalPages - 전체 페이지 수
 * @returns {Array} 페이지 번호 배열
 */
function generatePageNumbers(currentPage, totalPages) {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return pages;
}

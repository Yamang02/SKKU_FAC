/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
import * as exhibitionService from '../service/ExhibitionService.js';
import * as artworkService from '../../artwork/service/ArtworkService.js';

/**
 * 전시회 목록 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getExhibitionList(req, res) {
    try {
        const exhibitions = exhibitionService.getAllExhibitions();

        res.render('exhibition/ExhibitionList', {
            title: '작품 아카이브',
            exhibitions
        });
    } catch (error) {
        // console.error('전시회 목록 조회 오류:', error);
        res.status(500).render('common/error', {
            message: '전시회 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 카테고리별 전시회 목록을 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getCategoryExhibition(req, res) {
    try {
        const { category } = req.params;
        const exhibitions = exhibitionService.getExhibitionsByCategory(category);

        res.render('exhibition/category', {
            title: `${category} 전시회`,
            category,
            exhibitions
        });
    } catch (error) {
        // console.error('카테고리별 전시회 조회 오류:', error);
        res.status(500).render('common/error', {
            message: '전시회 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 전시회 상세 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getExhibitionDetail(req, res) {
    try {
        const { id } = req.params;
        const exhibition = exhibitionService.getExhibitionById(id);
        const artworks = artworkService.getArtworksByExhibitionId(id);

        res.render('exhibition/detail', {
            title: exhibition.title,
            exhibition,
            artworks
        });
    } catch (error) {
        // console.error('전시회 상세 조회 오류:', error);
        res.status(500).render('common/error', {
            message: '전시회 정보를 불러오는 중 오류가 발생했습니다.'
        });
    }
}

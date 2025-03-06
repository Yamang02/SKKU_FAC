/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
const exhibitionService = require('../service/ExhibitionService');
const artworkService = require('../../artwork/service/ArtworkService');

class ExhibitionController {
    /**
     * 전시회 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static getExhibitionList(req, res) {
        try {
            const exhibitions = exhibitionService.getAllExhibitions();
            
            res.render('exhibitions/index', {
                title: '작품 아카이브',
                exhibitions
            });
        } catch (error) {
            console.error('전시회 목록 조회 오류:', error);
            res.status(500).render('error', { 
                message: '전시회 목록을 불러오는 중 오류가 발생했습니다.' 
            });
        }
    }

    /**
     * 카테고리별 작품 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static getCategoryExhibition(req, res) {
        try {
            const category = req.params.category;
            
            // 카테고리에 해당하는 작품 목록을 가져오는 로직 추가 필요
            
            res.render('exhibitions/index', {
                title: `${category} 작품 목록`,
                category: category
            });
        } catch (error) {
            console.error('카테고리별 작품 목록 조회 오류:', error);
            res.status(500).render('error', { 
                message: '작품 목록을 불러오는 중 오류가 발생했습니다.' 
            });
        }
    }

    /**
     * 전시회 상세 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    static getExhibitionDetail(req, res) {
        try {
            const exhibitionId = req.params.id;
            
            // 전시회 정보를 가져오는 로직 추가 필요
            // const exhibition = exhibitionService.getExhibitionById(exhibitionId);
            
            res.render('exhibitions/detail', {
                title: '작품 상세'
                // exhibition
            });
        } catch (error) {
            console.error('전시회 상세 조회 오류:', error);
            res.status(500).render('error', { 
                message: '전시회 정보를 불러오는 중 오류가 발생했습니다.' 
            });
        }
    }
}

module.exports = ExhibitionController; 
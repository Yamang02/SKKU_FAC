import viewResolver from '../../presentation/view/ViewResolver.js';

/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
class ExhibitionController {
    /**
     * @param {ExhibitionApplicationService} exhibitionService - 전시회 애플리케이션 서비스
     * @param {ArtworkApplicationService} artworkService - 작품 애플리케이션 서비스
     */
    constructor(exhibitionService, artworkService) {
        this.exhibitionService = exhibitionService;
        this.artworkService = artworkService;
    }

    /**
     * 전시회 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getExhibitionList(req, res) {
        try {
            const exhibitions = await this.exhibitionService.getAllExhibitions();

            viewResolver.render(res, 'exhibition/ExhibitionList', {
                title: '전시회',
                exhibitions: exhibitions
            });
        } catch (error) {
            console.error('Error in getExhibitionList:', error);
            viewResolver.render(res, 'common/error', {
                title: '오류',
                message: '전시회 목록을 불러오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 전시회 상세 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getExhibitionDetail(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionService.getExhibitionById(id);

            if (!exhibition) {
                return viewResolver.render(res, 'common/error', {
                    title: '오류',
                    message: '전시회를 찾을 수 없습니다.'
                });
            }

            const artworks = await this.artworkService.getArtworksByExhibitionId(id);

            viewResolver.render(res, 'exhibition/detail', {
                title: exhibition.title,
                exhibition,
                artworks
            });
        } catch (error) {
            console.error('Error in getExhibitionDetail:', error);
            viewResolver.render(res, 'common/error', {
                title: '오류',
                message: '전시회 상세 정보를 불러오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 전시회 생성 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getExhibitionCreateForm(req, res) {
        viewResolver.render(res, 'exhibition/create', {
            title: '전시회 생성'
        });
    }

    /**
     * 전시회를 생성합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async createExhibition(req, res) {
        try {
            const exhibitionData = req.body;
            const exhibition = await this.exhibitionService.createExhibition(exhibitionData);

            res.redirect(`/exhibition/${exhibition.id}`);
        } catch (error) {
            console.error('Error in createExhibition:', error);
            viewResolver.render(res, 'exhibition/create', {
                title: '전시회 생성',
                error: error.message,
                formData: req.body
            });
        }
    }

    /**
     * 전시회 수정 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getExhibitionEditForm(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionService.getExhibitionById(id);

            if (!exhibition) {
                return viewResolver.render(res, 'common/error', {
                    title: '오류',
                    message: '전시회를 찾을 수 없습니다.'
                });
            }

            viewResolver.render(res, 'exhibition/edit', {
                title: '전시회 수정',
                exhibition
            });
        } catch (error) {
            console.error('Error in getExhibitionEditForm:', error);
            viewResolver.render(res, 'common/error', {
                title: '오류',
                message: '전시회 정보를 불러오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 전시회를 수정합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async updateExhibition(req, res) {
        try {
            const { id } = req.params;
            const exhibitionData = req.body;
            const exhibition = await this.exhibitionService.updateExhibition(id, exhibitionData);

            if (!exhibition) {
                return viewResolver.render(res, 'common/error', {
                    title: '오류',
                    message: '전시회를 찾을 수 없습니다.'
                });
            }

            res.redirect(`/exhibition/${id}`);
        } catch (error) {
            console.error('Error in updateExhibition:', error);
            viewResolver.render(res, 'exhibition/edit', {
                title: '전시회 수정',
                exhibition: { ...req.body, id: req.params.id },
                error: error.message
            });
        }
    }

    /**
     * 전시회를 삭제합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async deleteExhibition(req, res) {
        try {
            const { id } = req.params;
            const result = await this.exhibitionService.deleteExhibition(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            }

            res.json({
                success: true,
                message: '전시회가 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            console.error('Error in deleteExhibition:', error);
            res.status(500).json({
                success: false,
                message: '전시회 삭제 중 오류가 발생했습니다.'
            });
        }
    }
}

export default ExhibitionController;

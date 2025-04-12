import { ViewPath } from '../../../common/constants/ViewPath.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import ExhibitionService from '../service/ExhibitionService.js';

/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 서비스 계층과 연결합니다.
 */
export default class ExhibitionController {
    constructor() {
        this.exhibitionService = new ExhibitionService();
    }


    // ===== 사용자용 메서드 =====
    /**
     * 전시회 목록 페이지를 렌더링합니다.
     */
    async getExhibitionListPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.EXHIBITION.LIST, {
                title: '전시회 목록',
                exhibitions: []
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }
}

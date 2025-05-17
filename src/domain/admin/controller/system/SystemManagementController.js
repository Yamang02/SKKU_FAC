import { ViewPath } from '../../../../common/constants/ViewPath.js';
import ViewResolver from '../../../../common/utils/ViewResolver.js';
import SystemManagementService from '../../service/system/SystemManagementService.js';

export default class SystemManagementController {
    constructor() {
        this.adminService = new SystemManagementService();
    }

    /**
     * 관리자 대시보드를 렌더링합니다.
     */
    async getDashboard(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // AdminService를 통해 대시보드 데이터 조회
            const dashboardData = await this.adminService.getDashboardData({ page, limit });

            ViewResolver.render(res, ViewPath.ADMIN.DASHBOARD, {
                title: '관리자 대시보드',
                breadcrumb: '대시보드',
                currentPage: 'dashboard',
                ...dashboardData
            });
        } catch (error) {
            console.error('대시보드 렌더링 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

}



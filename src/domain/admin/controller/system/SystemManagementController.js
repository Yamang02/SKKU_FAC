import ViewResolver from '../../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../../common/constants/ViewPath.js';
import BaseAdminController from '../BaseAdminController.js';

export default class SystemManagementController extends BaseAdminController {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['SystemManagementService'];

    constructor(systemManagementService = null) {
        super('SystemManagementController');

        // 의존성 주입 방식 (새로운 방식)
        if (systemManagementService) {
            this.systemManagementService = systemManagementService;
        } else {
            // 기존 방식 호환성 유지 (임시)

            throw new Error('SystemManagementService가 주입되지 않았습니다.');
        }
    }

    /**
     * 관리자 대시보드를 렌더링합니다.
     */
    async getDashboard(req, res) {
        return this.safeExecuteSSR(
            async () => {
                const dashboardData = await this.systemManagementService.getDashboardData();

                return ViewResolver.render(res, ViewPath.ADMIN.DASHBOARD, {
                    title: '관리자 대시보드',
                    user: req.user,
                    // dashboardData 객체를 풀어서 전달
                    ...dashboardData
                });
            },
            req,
            res,
            {
                operationName: '대시보드 조회',
                errorRedirectPath: '/admin',
                errorMessage: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.'
            }
        );
    }
}

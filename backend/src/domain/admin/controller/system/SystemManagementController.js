import { ApiResponse } from '../../../common/model/ApiResponse.js';
import logger from '../../../../common/utils/Logger.js';

export default class SystemManagementController {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['SystemManagementService'];

    constructor(systemManagementService = null) {
        // 의존성 주입 확인
        if (!systemManagementService) {
            throw new Error('SystemManagementService가 주입되지 않았습니다.');
        }

        this.systemManagementService = systemManagementService;
    }

    /**
     * 관리자 대시보드 데이터를 JSON으로 반환합니다.
     * GET /admin/dashboard
     */
    async getDashboard(req, res) {
        try {
            const dashboardData = await this.systemManagementService.getDashboardData();

            return res.status(200).json(
                ApiResponse.success('대시보드 데이터를 성공적으로 조회했습니다.', {
                    user: {
                        id: req.user?.id,
                        name: req.user?.name,
                        email: req.user?.email,
                        role: req.user?.role
                    },
                    ...dashboardData
                })
            );
        } catch (error) {
            logger.error('대시보드 데이터 조회 실패:', error);
            return res.status(500).json(
                ApiResponse.error('대시보드 데이터를 불러오는 중 오류가 발생했습니다.', error.message)
            );
        }
    }
}

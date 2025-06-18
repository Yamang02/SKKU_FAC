import express from 'express';

/**
 * User Admin API 라우터 생성 함수
 * @param {Object} container - 의존성 주입 컨테이너
 * @returns {express.Router} User Admin API 라우터
 */
export function createUserAdminApiRouter(container) {
    const router = express.Router();
    const userAdminApiController = container.resolve('UserAdminApiController');

    // 사용자 관리 API 라우트
    router.get('/users', userAdminApiController.getUsers.bind(userAdminApiController));
    router.get('/users/:id', userAdminApiController.getUser.bind(userAdminApiController));
    router.post('/users', userAdminApiController.createUser.bind(userAdminApiController));
    router.put('/users/:id', userAdminApiController.updateUser.bind(userAdminApiController));
    router.delete('/users/:id', userAdminApiController.deleteUser.bind(userAdminApiController));
    router.put('/users/:id/role', userAdminApiController.updateUserRole.bind(userAdminApiController));
    router.post('/users/:id/reset-password', userAdminApiController.resetUserPassword.bind(userAdminApiController));
    router.get('/users/stats', userAdminApiController.getUserStats.bind(userAdminApiController));

    return router;
}

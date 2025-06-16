import HomeRouter from './domain/home/controller/HomeRouter.js';
import ExhibitionRouter from './domain/exhibition/controller/ExhibitionRouter.js';
import { createArtworkRouter } from './domain/artwork/controller/ArtworkRouter.js';
import { createUserRouter } from './domain/user/controller/UserRouter.js';
import { createAdminRouter } from './domain/admin/controller/AdminRouter.js';
import { createAdminApiRouter } from './domain/admin/controller/api/AdminApiRouter.js';
import AuthRouter from './domain/auth/controller/AuthRouter.js';
import CommonRouter from './domain/common/controller/CommonRouter.js';

/**
 * 라우터 팩토리 함수
 * 의존성 주입 컨테이너를 받아서 라우터들을 생성합니다.
 * @param {Container} container - 의존성 주입 컨테이너
 * @returns {Object} 생성된 라우터들
 */
export function createRouters(container) {
    // 의존성 주입된 컨트롤러들을 해결
    const userController = container.resolve('UserController');
    const userApiController = container.resolve('UserApiController');

    // 라우터들 생성
    const UserRouter = createUserRouter(userController, userApiController);
    const ArtworkRouter = createArtworkRouter(container);
    const AdminRouter = createAdminRouter(container);
    const AdminApiRouter = createAdminApiRouter(container);

    return {
        HomeRouter,
        ExhibitionRouter,
        ArtworkRouter,
        UserRouter,
        AdminRouter,
        AdminApiRouter,
        AuthRouter,
        CommonRouter
    };
}

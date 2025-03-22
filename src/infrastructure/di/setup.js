import { Container } from './Container.js';
import { setupExhibitionModule } from './modules/exhibitionModule.js';
import { setupArtworkModule } from './modules/artworkModule.js';
import { setupNoticeModule } from './modules/noticeModule.js';
import { setupUserModule } from './modules/userModule.js';
import { setupHomeModule } from './modules/homeModule.js';
import AdminController from '../../interface/controller/AdminController.js';

/**
 * 애플리케이션의 모든 의존성을 설정합니다.
 * @returns {Container} 설정된 의존성 컨테이너
 */
export const setupContainer = () => {
    const container = new Container();

    // 모듈 설정 순서 중요: 의존성 순서대로 설정
    setupExhibitionModule(container);  // 독립적인 모듈
    setupUserModule(container);        // 독립적인 모듈
    setupNoticeModule(container);      // 독립적인 모듈
    setupArtworkModule(container);     // exhibition 의존성 있음
    setupHomeModule(container);        // artwork, notice 의존성 있음

    // AdminController는 별도의 의존성이 없으므로 직접 등록
    container.register('adminController', new AdminController());

    return container;
};
